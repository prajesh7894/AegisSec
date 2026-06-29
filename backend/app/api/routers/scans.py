import asyncio

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import SessionLocal, get_db
from app.models.scan import Scan, ScanStatus
from app.models.target import Target
from app.models.user import User
from app.schemas.scan import ScanCreate, ScanDetail, ScanRead
from app.services.audit_service import record_audit
from app.services.scan_engine import scan_engine
from app.services.target_validation import classify_target

router = APIRouter()


async def run_scan_background(scan_id: int) -> None:
    db = SessionLocal()
    try:
        await scan_engine.run(scan_id, db)
    finally:
        db.close()


@router.post("", response_model=ScanRead, status_code=status.HTTP_201_CREATED)
def create_scan(
    payload: ScanCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Scan:
    if not payload.authorization_confirmed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization confirmation is required.")

    target = Target(owner_id=current_user.id, value=payload.target, target_type=classify_target(payload.target))
    db.add(target)
    db.flush()
    scan = Scan(owner_id=current_user.id, target_id=target.id, name=payload.name)
    db.add(scan)
    db.commit()
    db.refresh(scan)
    record_audit(db, current_user.id, "scan.created", "scan", f"scan_id={scan.id}")
    background_tasks.add_task(run_scan_background, scan.id)
    return scan


@router.get("", response_model=list[ScanRead])
def list_scans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Scan]:
    if current_user.role == "admin":
        statement = select(Scan).options(selectinload(Scan.target)).order_by(Scan.created_at.desc())
    else:
        statement = select(Scan).options(selectinload(Scan.target)).where(Scan.owner_id == current_user.id).order_by(Scan.created_at.desc())
    return list(db.scalars(statement).all())


@router.get("/{scan_id}", response_model=ScanDetail)
def get_scan(scan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Scan:
    scan = db.scalar(
        select(Scan)
        .options(selectinload(Scan.findings), selectinload(Scan.target))
        .where(Scan.id == scan_id, Scan.owner_id == current_user.id)
    )
    if scan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    return scan


@router.post("/{scan_id}/cancel", response_model=ScanRead)
def cancel_scan(scan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Scan:
    scan = db.scalar(select(Scan).where(Scan.id == scan_id, Scan.owner_id == current_user.id))
    if scan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    scan.status = ScanStatus.cancelled.value
    scan.current_step = "Cancelled"
    db.commit()
    db.refresh(scan)
    record_audit(db, current_user.id, "scan.cancelled", "scan", f"scan_id={scan.id}")
    return scan


@router.post("/{scan_id}/duplicate", response_model=ScanRead, status_code=status.HTTP_201_CREATED)
def duplicate_scan(
    scan_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Scan:
    original = db.scalar(select(Scan).options(selectinload(Scan.target)).where(Scan.id == scan_id, Scan.owner_id == current_user.id))
    if original is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    target = Target(owner_id=current_user.id, value=original.target.value, target_type=original.target.target_type)
    db.add(target)
    db.flush()
    scan = Scan(owner_id=current_user.id, target_id=target.id, name=f"{original.name} Copy")
    db.add(scan)
    db.commit()
    db.refresh(scan)
    background_tasks.add_task(run_scan_background, scan.id)
    return scan


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(scan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    scan = db.scalar(select(Scan).where(Scan.id == scan_id, Scan.owner_id == current_user.id))
    if scan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    db.delete(scan)
    db.commit()
    record_audit(db, current_user.id, "scan.deleted", "scan", f"scan_id={scan_id}")


@router.websocket("/{scan_id}/ws")
async def scan_progress(websocket: WebSocket, scan_id: int) -> None:
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            scan = db.get(Scan, scan_id)
            if scan is None:
                await websocket.send_json({"error": "scan_not_found"})
                return
            db.refresh(scan)
            await websocket.send_json(
                {
                    "scan_id": scan.id,
                    "status": scan.status,
                    "progress": scan.progress,
                    "current_step": scan.current_step,
                }
            )
            if scan.status in {ScanStatus.completed.value, ScanStatus.failed.value, ScanStatus.cancelled.value}:
                return
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        return
    finally:
        db.close()

