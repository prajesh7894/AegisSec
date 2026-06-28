from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.services.target_validation import validate_target


class ScanCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    target: str = Field(min_length=3, max_length=512)
    authorization_confirmed: bool

    @field_validator("target")
    @classmethod
    def target_must_be_valid(cls, value: str) -> str:
        validate_target(value)
        return value.strip()


class ScanRead(BaseModel):
    id: int
    name: str
    status: str
    progress: int
    current_step: str
    risk_score: int
    created_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class FindingRead(BaseModel):
    id: int
    title: str
    severity: str
    cvss: float
    description: str
    recommendation: str

    model_config = {"from_attributes": True}


class ScanDetail(ScanRead):
    findings: list[FindingRead] = []

