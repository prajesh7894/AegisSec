from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.report import Report, ReportFormat
from app.models.scan import Scan, ScanStatus
from app.models.user import User
from app.services.report_service import build_html_report, build_json_report

router = APIRouter()


@router.post("/{scan_id}/{report_format}", response_model=dict[str, int | str])
def generate_report(
    scan_id: int,
    report_format: ReportFormat,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int | str]:
    scan = db.scalar(
        select(Scan)
        .options(selectinload(Scan.findings))
        .where(Scan.id == scan_id, Scan.owner_id == current_user.id)
    )
    if scan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    if scan.status != ScanStatus.completed.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reports require a completed scan.")

    content = build_json_report(scan) if report_format == ReportFormat.json else build_html_report(scan)
    report = Report(scan_id=scan.id, format=report_format.value, content=content)
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"id": report.id, "format": report.format}


@router.get("/{report_id}", response_model=dict[str, int | str])
def get_report(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, int | str]:
    report = db.scalar(
        select(Report)
        .join(Scan)
        .where(Report.id == report_id, Scan.owner_id == current_user.id)
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"id": report.id, "format": report.format, "content": report.content}

