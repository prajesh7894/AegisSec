from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)


class SettingsRead(BaseModel):
    environment: str
    rate_limit_per_minute: int
    authorized_use_only: bool = True

