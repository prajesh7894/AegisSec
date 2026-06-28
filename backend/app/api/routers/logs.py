from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.logs import AuditLogRead

router = APIRouter()


@router.get("", response_model=list[AuditLogRead])
def list_audit_logs(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> list[AuditLog]:
    return list(db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200)).all())
