import datetime as dt

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, contains_eager

from app.models import Shift, ShiftStatus, User
from app.schemas.shift import ShiftCreate, ShiftUpdate


def get_shift(db: Session, shift_id: int) -> Shift | None:
    return db.get(Shift, shift_id)


def list_shifts(
    db: Session,
    user_id: int | None,
    status_filter: ShiftStatus | None,
    date_from: dt.date | None,
    date_to: dt.date | None,
    search: str | None,
    limit: int,
    offset: int,
) -> list[Shift]:
    query = select(Shift).join(Shift.user).options(contains_eager(Shift.user))
    if user_id is not None:
        query = query.where(Shift.user_id == user_id)
    if status_filter is not None:
        query = query.where(Shift.status == status_filter)
    if date_from is not None:
        query = query.where(Shift.date >= date_from)
    if date_to is not None:
        query = query.where(Shift.date <= date_to)
    if search:
        query = query.where(User.name.ilike(f"%{search}%"))
    query = (
        query.order_by(Shift.date, Shift.start_time, Shift.id)
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(query))


def get_swap_candidates(
    db: Session,
    current_user: User,
    my_shift_id: int,
    user_id: int | None,
    search: str | None,
    date_from: dt.date | None,
    date_to: dt.date | None,
) -> list[Shift]:
    my_shift = db.get(Shift, my_shift_id)
    if my_shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Смена не найдена")
    if my_shift.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Начать обмен можно только со своей смены",
        )
    today = dt.date.today()
    if my_shift.date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя обменять прошедшую смену",
        )
    if my_shift.status != ShiftStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Эта смена уже участвует в обмене",
        )
    query = (
        select(Shift)
        .join(Shift.user)
        .options(contains_eager(Shift.user))
        .where(
            Shift.user_id != current_user.id,
            Shift.status == ShiftStatus.approved,
            Shift.date >= today,
        )
    )
    if user_id is not None:
        query = query.where(Shift.user_id == user_id)
    if search:
        query = query.where(User.name.ilike(f"%{search}%"))
    if date_from is not None:
        query = query.where(Shift.date >= date_from)
    if date_to is not None:
        query = query.where(Shift.date <= date_to)
    return list(db.scalars(query.order_by(Shift.date, Shift.start_time, Shift.id)))


def create_shift(db: Session, data: ShiftCreate) -> Shift:
    if db.get(User, data.user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сотрудник не найден")
    shift = Shift(
        user_id=data.user_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    db.add(shift)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="У сотрудника уже есть смена с таким началом",
        )
    db.refresh(shift)
    return shift


def update_shift(db: Session, shift: Shift, data: ShiftUpdate) -> Shift:
    if shift.status == ShiftStatus.on_exchange:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Смена участвует в обмене и недоступна для изменения",
        )
    if db.get(User, data.user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сотрудник не найден")
    shift.user_id = data.user_id
    shift.date = data.date
    shift.start_time = data.start_time
    shift.end_time = data.end_time
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="У сотрудника уже есть смена с таким началом",
        )
    db.refresh(shift)
    return shift


def delete_shift(db: Session, shift: Shift) -> None:
    if shift.status == ShiftStatus.on_exchange:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Смена участвует в обмене и недоступна для удаления",
        )
    try:
        db.delete(shift)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Смена есть в запросах обмена и не может быть удалена",
        )
