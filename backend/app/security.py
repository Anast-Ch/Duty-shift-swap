from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
import jwt

from app.config import settings

JWT_ALGORITHM = "HS256"
TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def create_refresh_token(
    user_id: int, session_id: str, *, issued_at: datetime | None = None
) -> str:
    now = issued_at or datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "sid": session_id,
        "iat": now,
        "exp": now + timedelta(days=settings.refresh_token_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_token(token: str, expected_type: TokenType) -> dict:
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[JWT_ALGORITHM],
        options={"require": ["sub", "type", "iat", "exp"]},
    )
    subject = payload["sub"]
    if payload["type"] != expected_type:
        raise jwt.InvalidTokenError("Неверный тип токена")
    if (
        not isinstance(subject, str)
        or not subject.isascii()
        or not subject.isdecimal()
        or len(subject) > 10
        or not 1 <= int(subject) <= 2_147_483_647
    ):
        raise jwt.InvalidTokenError("Некорректный идентификатор пользователя")
    if expected_type == "refresh" and (
        not isinstance(payload.get("sid"), str) or not payload["sid"]
    ):
        raise jwt.InvalidTokenError("Некорректный идентификатор сессии")
    return payload
