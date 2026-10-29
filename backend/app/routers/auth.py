from fastapi import APIRouter, HTTPException, status

from app.crud import user as user_crud
from app.deps import CurrentUser, DbSession
from app.schemas.user import LoginRequest, UserRead
from app.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserRead)
def login(data: LoginRequest, db: DbSession):
    user = user_crud.get_user_by_email(db, data.email)
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    return user


@router.get("/me", response_model=UserRead)
def read_me(current_user: CurrentUser):
    return current_user
