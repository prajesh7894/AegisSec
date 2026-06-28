from datetime import datetime

from pydantic import BaseModel


class AuditLogRead(BaseModel):
    id: int
    actor_id: int | None
    action: str
    resource: str
    detail: str
    created_at: datetime

    model_config = {"from_attributes": True}

