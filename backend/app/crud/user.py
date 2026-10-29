from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import exists, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Role, Shift, ShiftStatus, User
from app.schemas.user import UserCreate, UserUpdate
from app.security import hash_password


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def list_users(
    db: Session,
    search: str | None,
    role: Role | None,
    exclude_user_id: int | None,
    has_free_shifts: bool) -> list[User]:
    query = select(User)
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    if role is not None:
        query = query.where(User.role == role)
    if exclude_user_id is not None:
        query = query.where(User.id != exclude_user_id)
    if has_free_shifts:
        free = exists().where(
            Shift.user_id == User.id,
            Shift.status == ShiftStatus.approved,
            Shift.date >= date.today(),
        )
        query = query.where(free)
    return list(db.scalars(query.order_by(User.name, User.id)))


def create_user(db: Session, data: UserCreate) -> User:
    if get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже есть",
        )
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    other = get_user_by_email(db, data.email)
    if other and other.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже есть",
        )
    user.name = data.name
    user.email = data.email
    user.role = data.role
    if data.password:
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    try:
        db.delete(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить пользователя: у него есть смены или запросы",
        )
