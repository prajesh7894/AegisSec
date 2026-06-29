from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.finding import Finding
from app.models.scan import Scan, ScanStatus
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("", response_model=DashboardStats)
def stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardStats:
    def scan_count(status: str | None = None) -> int:
        statement = select(func.count()).select_from(Scan)
        if current_user.role != "admin":
            statement = statement.where(Scan.owner_id == current_user.id)
        if status:
            statement = statement.where(Scan.status == status)
        return int(db.scalar(statement) or 0)

    def severity_count(severity: str) -> int:
        statement = (
            select(func.count())
            .select_from(Finding)
            .join(Scan)
            .where(Finding.severity == severity)
        )
        if current_user.role != "admin":
            statement = statement.where(Scan.owner_id == current_user.id)
        return int(db.scalar(statement) or 0)

    def get_historical_trend() -> list[dict]:
        statement = select(Scan.created_at, Scan.risk_score).where(Scan.status == ScanStatus.completed.value).order_by(Scan.created_at.asc()).limit(10)
        if current_user.role != "admin":
            statement = statement.where(Scan.owner_id == current_user.id)
        scans = db.execute(statement).all()
        return [{"date": str(s[0].date()), "risk_score": s[1]} for s in scans]

    return DashboardStats(
        total_scans=scan_count(),
        running_scans=scan_count(ScanStatus.running.value),
        completed_scans=scan_count(ScanStatus.completed.value),
        failed_scans=scan_count(ScanStatus.failed.value),
        critical_findings=severity_count("critical"),
        high_findings=severity_count("high"),
        medium_findings=severity_count("medium"),
        low_findings=severity_count("low"),
        historical_trend=get_historical_trend()
    )

