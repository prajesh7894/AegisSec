from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    expires_at = datetime.now(UTC) + expires_delta
    payload: dict[str, Any] = {"sub": subject, "type": token_type, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    return create_token(subject, "access", timedelta(minutes=settings.access_token_minutes))


def create_refresh_token(subject: str) -> str:
    return create_token(subject, "refresh", timedelta(days=settings.refresh_token_days))


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

