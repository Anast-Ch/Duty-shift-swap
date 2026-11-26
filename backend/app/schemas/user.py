from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import Role


class EmailNormalized(BaseModel):
    @field_validator("email", mode="before", check_fields=False)
    @classmethod
    def normalize_email(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value


class UserShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class UserRead(UserShort):
    email: str
    role: Role


class UserBase(EmailNormalized):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    role: Role


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=72)


class UserUpdate(UserBase):
    password: str | None = Field(default=None, min_length=6, max_length=72)


class RegistrationRequest(EmailNormalized):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)

    @field_validator("name", mode="before")
    @classmethod
    def normalize_name(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("password")
    @classmethod
    def check_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Пароль не должен превышать 72 байта в UTF-8")
        return value


class LoginRequest(EmailNormalized):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1, max_length=4096)


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
