from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileUpdate
from app.schemas.user import UserRead
from app.services.audit_service import record_audit

router = APIRouter()


@router.get("", response_model=UserRead)
def read_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("", response_model=UserRead)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
    record_audit(db, current_user.id, "profile.updated", "user", current_user.email)
    return current_user

