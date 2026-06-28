from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record_audit(db: Session, actor_id: int | None, action: str, resource: str, detail: str = "") -> None:
    db.add(AuditLog(actor_id=actor_id, action=action, resource=resource, detail=detail))
    db.commit()

