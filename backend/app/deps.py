from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Role, User


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    x_user_id: Annotated[int | None, Header()] = None,
) -> User:
    if x_user_id is not None:
        user = db.get(User, x_user_id)
    else:
        user = db.scalar(select(User).order_by(User.id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_senior(user: CurrentUser) -> User:
    if user.role != Role.SENIOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступно только старшему",
        )
    return user


SeniorUser = Annotated[User, Depends(require_senior)]
