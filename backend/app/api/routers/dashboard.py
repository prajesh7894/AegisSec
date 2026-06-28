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
        statement = select(func.count()).select_from(Scan).where(Scan.owner_id == current_user.id)
        if status:
            statement = statement.where(Scan.status == status)
        return int(db.scalar(statement) or 0)

    def severity_count(severity: str) -> int:
        statement = (
            select(func.count())
            .select_from(Finding)
            .join(Scan)
            .where(Scan.owner_id == current_user.id, Finding.severity == severity)
        )
        return int(db.scalar(statement) or 0)

    return DashboardStats(
        total_scans=scan_count(),
        running_scans=scan_count(ScanStatus.running.value),
        completed_scans=scan_count(ScanStatus.completed.value),
        failed_scans=scan_count(ScanStatus.failed.value),
        critical_findings=severity_count("critical"),
        high_findings=severity_count("high"),
        medium_findings=severity_count("medium"),
        low_findings=severity_count("low"),
    )

