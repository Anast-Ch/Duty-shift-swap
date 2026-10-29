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


class LoginRequest(EmailNormalized):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)
