import datetime as dt
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.crud import shift as shift_crud
from app.deps import CurrentUser, DbSession, get_current_user, require_senior
from app.models import Role, ShiftStatus
from app.schemas.shift import ShiftCreate, ShiftRead, ShiftUpdate, ShiftWithOwner

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.get("", response_model=list[ShiftWithOwner])
def read_shifts(
    db: DbSession,
    current_user: CurrentUser,
    user_id: int | None = None,
    status_filter: Annotated[ShiftStatus | None, Query(alias="status")] = None,
    date_from: dt.date | None = None,
    date_to: dt.date | None = None,
    search: str | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    if current_user.role != Role.SENIOR:
        if user_id is not None and user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Можно смотреть только свои смены",
            )
        user_id = current_user.id
        search = None
    return shift_crud.list_shifts(
        db, user_id, status_filter, date_from, date_to, search, limit, offset
    )


@router.get("/swap-candidates", response_model=list[ShiftWithOwner])
def read_swap_candidates(
    db: DbSession,
    current_user: CurrentUser,
    my_shift_id: int,
    user_id: int | None = None,
    search: str | None = None,
    date_from: dt.date | None = None,
    date_to: dt.date | None = None,
):
    return shift_crud.get_swap_candidates(
        db, current_user, my_shift_id, user_id, search, date_from, date_to
    )


@router.get(
    "/{shift_id}",
    response_model=ShiftRead,
    dependencies=[Depends(get_current_user)],
)
def read_shift(shift_id: int, db: DbSession):
    shift = shift_crud.get_shift(db, shift_id)
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Смена не найдена")
    return shift


@router.post(
    "",
    response_model=ShiftRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_senior)],
)
def create_shift(data: ShiftCreate, db: DbSession):
    return shift_crud.create_shift(db, data)


@router.put(
    "/{shift_id}",
    response_model=ShiftRead,
    dependencies=[Depends(require_senior)],
)
def update_shift(shift_id: int, data: ShiftUpdate, db: DbSession):
    shift = shift_crud.get_shift(db, shift_id)
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Смена не найдена")
    return shift_crud.update_shift(db, shift, data)


@router.delete(
    "/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_senior)],
)
def delete_shift(shift_id: int, db: DbSession):
    shift = shift_crud.get_shift(db, shift_id)
    if shift is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Смена не найдена")
    shift_crud.delete_shift(db, shift)
