from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import APIRouter, HTTPException, Response, status

from app.config import settings
from app.crud import auth_session as session_crud
from app.crud import user as user_crud
from app.deps import CurrentUser, DbSession
from app.models import AuthSession
from app.schemas.user import (
    AccessToken,
    LoginRequest,
    RefreshRequest,
    RegistrationRequest,
    TokenPair,
    UserRead,
)
from app.security import create_access_token, create_refresh_token, decode_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: RegistrationRequest, db: DbSession):
    return user_crud.register_user(db, data)


@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, db: DbSession):
    user = user_crud.get_user_by_email(db, data.email)
    if (
        user is None
        or len(data.password.encode("utf-8")) > 72
        or not verify_password(data.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    session_id = str(uuid4())
    issued_at = datetime.now(timezone.utc).replace(microsecond=0)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id, session_id, issued_at=issued_at)
    expires_at = issued_at + timedelta(days=settings.refresh_token_days)
    session_crud.create_session(db, session_id, user.id, expires_at)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


def get_refresh_session(data: RefreshRequest, db: DbSession) -> AuthSession:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный refresh-токен",
    )
    try:
        payload = decode_token(data.refresh_token, "refresh")
    except jwt.InvalidTokenError:
        raise unauthorized from None

    user_id = int(payload["sub"])
    session = session_crud.get_active_session(
        db, payload["sid"], user_id, datetime.now(timezone.utc)
    )
    if session is None or user_crud.get_user(db, user_id) is None:
        raise unauthorized
    return session


@router.post("/refresh", response_model=AccessToken)
def refresh(data: RefreshRequest, db: DbSession):
    session = get_refresh_session(data, db)
    return AccessToken(access_token=create_access_token(session.user_id))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: DbSession):
    session = get_refresh_session(data, db)
    session_crud.revoke_session(db, session, datetime.now(timezone.utc))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user
