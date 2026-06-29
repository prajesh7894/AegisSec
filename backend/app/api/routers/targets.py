from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.target import Target
from app.models.user import User
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter()

class TargetCreate(BaseModel):
    value: str

class TargetRead(BaseModel):
    id: int
    value: str
    target_type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

@router.post("", response_model=TargetRead, status_code=status.HTTP_201_CREATED)
def create_target(
    payload: TargetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Basic target classification
    target_type = "ip" if any(char.isdigit() for char in payload.value) else "domain"
    if "://" in payload.value:
        target_type = "url"
        
    target = Target(owner_id=current_user.id, value=payload.value, target_type=target_type)
    db.add(target)
    db.commit()
    db.refresh(target)
    return target

@router.get("", response_model=List[TargetRead])
def list_targets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        statement = select(Target).order_by(Target.created_at.desc())
    else:
        statement = select(Target).where(Target.owner_id == current_user.id).order_by(Target.created_at.desc())
    return list(db.scalars(statement).all())

@router.delete("/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_target(target_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    statement = select(Target).where(Target.id == target_id)
    if current_user.role != "admin":
        statement = statement.where(Target.owner_id == current_user.id)
        
    target = db.scalar(statement)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found.")
        
    db.delete(target)
    db.commit()
