from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.profile import SettingsRead

router = APIRouter()


@router.get("", response_model=SettingsRead)
def read_settings(_: User = Depends(get_current_user)) -> SettingsRead:
    return SettingsRead(
        environment=settings.environment,
        rate_limit_per_minute=settings.rate_limit_per_minute,
    )

