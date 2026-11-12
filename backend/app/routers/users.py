from fastapi import APIRouter, Depends, HTTPException, status

from app.crud import user as user_crud
from app.deps import CurrentUser, DbSession, get_current_user, require_senior
from app.models import Role
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def read_users(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = None,
    role: Role | None = None,
    exclude_me: bool = False,
    has_free_shifts: bool = False,
):
    exclude_id = current_user.id if exclude_me else None
    return user_crud.list_users(db, search, role, exclude_id, has_free_shifts)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(get_current_user)],
)
def read_user(user_id: int, db: DbSession):
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_senior)],
)
def create_user(data: UserCreate, db: DbSession):
    return user_crud.create_user(db, data)


@router.put(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_senior)],
)
def update_user(user_id: int, data: UserUpdate, db: DbSession):
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user_crud.update_user(db, user, data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_senior)],
)
def delete_user(user_id: int, db: DbSession):
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    user_crud.delete_user(db, user)
