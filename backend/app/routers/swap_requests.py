import datetime as dt
from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Query, status

from app.crud import swap_request as swap_crud
from app.deps import CurrentUser, DbSession, SeniorUser
from app.models import Role, SwapRequestStatus
from app.schemas.swap_request import SwapRequestCreate, SwapRequestRead

router = APIRouter(prefix="/swap-requests", tags=["swap-requests"])


@router.post("", response_model=SwapRequestRead, status_code=status.HTTP_201_CREATED)
def create_swap_request(data: SwapRequestCreate, db: DbSession, current_user: CurrentUser):
    return swap_crud.create_request(db, current_user, data)


@router.get("/my", response_model=list[SwapRequestRead])
def read_my_swap_requests(
    db: DbSession,
    current_user: CurrentUser,
    box: Annotated[Literal["outgoing", "incoming"], Query()],
    status_filter: Annotated[list[SwapRequestStatus] | None, Query(alias="status")] = None,
):
    return swap_crud.list_my_requests(db, current_user, box, status_filter)


@router.get("", response_model=list[SwapRequestRead])
def read_all_swap_requests(
    db: DbSession,
    senior: SeniorUser,
    status_filter: Annotated[list[SwapRequestStatus] | None, Query(alias="status")] = None,
    user_id: int | None = None,
    date_from: dt.date | None = None,
    date_to: dt.date | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return swap_crud.list_all_requests(
        db, status_filter, user_id, date_from, date_to, limit, offset
    )


@router.get("/{request_id}", response_model=SwapRequestRead)
def read_swap_request(request_id: int, db: DbSession, current_user: CurrentUser):
    request = swap_crud.get_request(db, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запрос не найден")
    is_participant = current_user.id in (request.initiator_id, request.respondent_id)
    if not is_participant and current_user.role != Role.SENIOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к запросу")
    return request


@router.post("/{request_id}/accept", response_model=SwapRequestRead)
def accept_swap_request(request_id: int, db: DbSession, current_user: CurrentUser):
    return swap_crud.accept_request(db, request_id, current_user)


@router.post("/{request_id}/decline", response_model=SwapRequestRead)
def decline_swap_request(request_id: int, db: DbSession, current_user: CurrentUser):
    return swap_crud.decline_request(db, request_id, current_user)


@router.post("/{request_id}/senior-approve", response_model=SwapRequestRead)
def senior_approve_swap_request(request_id: int, db: DbSession, senior: SeniorUser):
    return swap_crud.decide_request(db, request_id, senior, True)


@router.post("/{request_id}/senior-decline", response_model=SwapRequestRead)
def senior_decline_swap_request(request_id: int, db: DbSession, senior: SeniorUser):
    return swap_crud.decide_request(db, request_id, senior, False)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_swap_request(request_id: int, db: DbSession, current_user: CurrentUser):
    swap_crud.delete_request(db, request_id, current_user)
