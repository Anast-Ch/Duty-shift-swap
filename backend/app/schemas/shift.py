import datetime as dt
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PlainSerializer, model_validator

from app.models import ShiftStatus
from app.schemas.user import UserShort

TimeStr = Annotated[
    dt.time,
    PlainSerializer(lambda value: value.strftime("%H:%M"), return_type=str),
]


class ShiftBase(BaseModel):
    date: dt.date
    start_time: TimeStr
    end_time: TimeStr

    @model_validator(mode="after")
    def check_times(self):
        if self.start_time == self.end_time:
            raise ValueError("Начало и конец смены не должны совпадать")
        return self


class ShiftCreate(ShiftBase):
    user_id: int


class ShiftUpdate(ShiftCreate):
    pass


class ShiftRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: dt.date
    start_time: TimeStr
    end_time: TimeStr
    status: ShiftStatus


class ShiftWithOwner(ShiftRead):
    user: UserShort
