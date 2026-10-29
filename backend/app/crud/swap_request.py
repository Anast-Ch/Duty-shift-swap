import datetime as dt

from fastapi import HTTPException, status
from sqlalchemy import Date, cast, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models import Shift, ShiftStatus, SwapRequest, SwapRequestStatus, User
from app.schemas.swap_request import SwapRequestCreate

LOAD_OPTIONS = (
    selectinload(SwapRequest.initiator),
    selectinload(SwapRequest.respondent),
    selectinload(SwapRequest.initiator_shift),
    selectinload(SwapRequest.respondent_shift),
)


def error(code: int, detail: str) -> HTTPException:
    return HTTPException(status_code=code, detail=detail)


def get_request(db: Session, request_id: int) -> SwapRequest | None:
    query = select(SwapRequest).options(*LOAD_OPTIONS).where(SwapRequest.id == request_id)
    return db.scalar(query)


def list_my_requests(
    db: Session,
    user: User,
    box: str,
    statuses: list[SwapRequestStatus] | None,
) -> list[SwapRequest]:
    column = SwapRequest.initiator_id if box == "outgoing" else SwapRequest.respondent_id
    query = select(SwapRequest).options(*LOAD_OPTIONS).where(column == user.id)
    if statuses:
        query = query.where(SwapRequest.status.in_(statuses))
    query = query.order_by(SwapRequest.created_at.desc(), SwapRequest.id.desc())
    return list(db.scalars(query))


def list_all_requests(
    db: Session,
    statuses: list[SwapRequestStatus] | None,
    user_id: int | None,
    date_from: dt.date | None,
    date_to: dt.date | None,
    limit: int,
    offset: int,
) -> list[SwapRequest]:
    query = select(SwapRequest).options(*LOAD_OPTIONS)
    if statuses:
        query = query.where(SwapRequest.status.in_(statuses))
    if user_id is not None:
        query = query.where(
            or_(SwapRequest.initiator_id == user_id, SwapRequest.respondent_id == user_id)
        )
    if date_from is not None:
        query = query.where(cast(SwapRequest.created_at, Date) >= date_from)
    if date_to is not None:
        query = query.where(cast(SwapRequest.created_at, Date) <= date_to)
    query = (
        query.order_by(SwapRequest.created_at.desc(), SwapRequest.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(query))


def release_shifts(request: SwapRequest) -> None:
    request.initiator_shift.status = ShiftStatus.approved
    request.respondent_shift.status = ShiftStatus.approved


def create_request(db: Session, user: User, data: SwapRequestCreate) -> SwapRequest:
    initiator_shift = db.get(Shift, data.initiator_shift_id, with_for_update=True)
    respondent_shift = db.get(Shift, data.respondent_shift_id, with_for_update=True)
    if initiator_shift is None or respondent_shift is None:
        raise error(status.HTTP_404_NOT_FOUND, "Смена не найдена")
    if initiator_shift.user_id != user.id:
        raise error(status.HTTP_403_FORBIDDEN, "Обмен можно начать только со своей смены")
    if respondent_shift.user_id == user.id:
        raise error(status.HTTP_400_BAD_REQUEST, "Нельзя обменяться со своей же сменой")
    today = dt.date.today()
    if initiator_shift.date < today or respondent_shift.date < today:
        raise error(status.HTTP_400_BAD_REQUEST, "Нельзя обменять прошедшую смену")
    if (
        initiator_shift.status != ShiftStatus.approved
        or respondent_shift.status != ShiftStatus.approved
    ):
        raise error(status.HTTP_409_CONFLICT, "Одна из смен уже участвует в обмене")
    request = SwapRequest(
        initiator_id=user.id,
        respondent_id=respondent_shift.user_id,
        initiator_shift_id=initiator_shift.id,
        respondent_shift_id=respondent_shift.id,
        status=SwapRequestStatus.sent,
    )
    initiator_shift.status = ShiftStatus.on_exchange
    respondent_shift.status = ShiftStatus.on_exchange
    db.add(request)
    db.commit()
    return get_request(db, request.id)


def get_for_respondent(db: Session, request_id: int, user: User) -> SwapRequest:
    request = db.get(SwapRequest, request_id, with_for_update=True)
    if request is None:
        raise error(status.HTTP_404_NOT_FOUND, "Запрос не найден")
    if request.respondent_id != user.id:
        raise error(status.HTTP_403_FORBIDDEN, "Отвечать на запрос может только адресат")
    if request.status != SwapRequestStatus.sent:
        raise error(status.HTTP_409_CONFLICT, "Запрос уже обработан")
    return request


def accept_request(db: Session, request_id: int, user: User) -> SwapRequest:
    request = get_for_respondent(db, request_id, user)
    request.status = SwapRequestStatus.waiting_senior
    db.commit()
    return get_request(db, request_id)


def decline_request(db: Session, request_id: int, user: User) -> SwapRequest:
    request = get_for_respondent(db, request_id, user)
    request.status = SwapRequestStatus.declined_by_colleague
    release_shifts(request)
    db.commit()
    return get_request(db, request_id)


def decide_request(db: Session, request_id: int, senior: User, approve: bool) -> SwapRequest:
    request = db.get(SwapRequest, request_id, with_for_update=True)
    if request is None:
        raise error(status.HTTP_404_NOT_FOUND, "Запрос не найден")
    if request.initiator_id == senior.id or request.respondent_id == senior.id:
        raise error(
            status.HTTP_403_FORBIDDEN, "Нельзя принимать решение по собственному запросу"
        )
    if request.status != SwapRequestStatus.waiting_senior:
        raise error(status.HTTP_409_CONFLICT, "Запрос не ожидает решения старшего")
    if approve:
        first = request.initiator_shift
        second = request.respondent_shift
        first.user_id, second.user_id = second.user_id, first.user_id
        first.status = ShiftStatus.approved
        second.status = ShiftStatus.approved
        request.status = SwapRequestStatus.approved
    else:
        request.status = SwapRequestStatus.declined_by_senior
        release_shifts(request)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise error(
            status.HTTP_409_CONFLICT,
            "У одного из сотрудников уже есть смена на это время",
        )
    return get_request(db, request_id)


def delete_request(db: Session, request_id: int, user: User) -> None:
    request = db.get(SwapRequest, request_id, with_for_update=True)
    if request is None:
        raise error(status.HTTP_404_NOT_FOUND, "Запрос не найден")
    if request.initiator_id != user.id:
        raise error(status.HTTP_403_FORBIDDEN, "Отозвать запрос может только инициатор")
    if request.status != SwapRequestStatus.sent:
        raise error(status.HTTP_409_CONFLICT, "Запрос уже обработан")
    release_shifts(request)
    db.delete(request)
    db.commit()
