import datetime as dt

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import SwapRequestStatus
from app.schemas.shift import ShiftRead
from app.schemas.user import UserShort


class SwapRequestCreate(BaseModel):
    initiator_shift_id: int = Field(gt=0)
    respondent_shift_id: int = Field(gt=0)

    @model_validator(mode="after")
    def check_different(self):
        if self.initiator_shift_id == self.respondent_shift_id:
            raise ValueError("Нужно выбрать две разные смены")
        return self


class SwapRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: SwapRequestStatus
    created_at: dt.datetime
    initiator: UserShort
    respondent: UserShort
    initiator_shift: ShiftRead
    respondent_shift: ShiftRead
