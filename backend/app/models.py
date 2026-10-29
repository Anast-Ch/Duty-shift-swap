import datetime as dt
import enum

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Role(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    SENIOR = "SENIOR"


class ShiftStatus(str, enum.Enum):
    approved = "approved"
    on_exchange = "on_exchange"


class SwapRequestStatus(str, enum.Enum):
    sent = "sent"
    waiting_senior = "waiting_senior"
    approved = "approved"
    declined_by_colleague = "declined_by_colleague"
    declined_by_senior = "declined_by_senior"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(
        Enum(Role, name="role"),
        default=Role.EMPLOYEE,
        server_default=Role.EMPLOYEE.value,
    )


class Shift(Base):
    __tablename__ = "shifts"
    __table_args__ = (
        UniqueConstraint("user_id", "date", "start_time", name="uq_shift_user_date_start"),
        CheckConstraint("start_time <> end_time", name="ck_shift_time"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    date: Mapped[dt.date] = mapped_column(Date, index=True)
    start_time: Mapped[dt.time] = mapped_column(Time)
    end_time: Mapped[dt.time] = mapped_column(Time)
    status: Mapped[ShiftStatus] = mapped_column(
        Enum(ShiftStatus, name="shift_status"),
        default=ShiftStatus.approved,
        server_default=ShiftStatus.approved.value,
    )

    user: Mapped["User"] = relationship()


class SwapRequest(Base):
    __tablename__ = "swap_requests"
    __table_args__ = (
        CheckConstraint("initiator_id <> respondent_id", name="ck_swap_users"),
        CheckConstraint("initiator_shift_id <> respondent_shift_id", name="ck_swap_shifts"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    initiator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    respondent_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    initiator_shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id"))
    respondent_shift_id: Mapped[int] = mapped_column(ForeignKey("shifts.id"))
    status: Mapped[SwapRequestStatus] = mapped_column(
        Enum(SwapRequestStatus, name="swap_request_status"),
        default=SwapRequestStatus.sent,
        server_default=SwapRequestStatus.sent.value,
        index=True,
    )
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    initiator: Mapped["User"] = relationship(foreign_keys="SwapRequest.initiator_id")
    respondent: Mapped["User"] = relationship(foreign_keys="SwapRequest.respondent_id")
    initiator_shift: Mapped["Shift"] = relationship(
        foreign_keys="SwapRequest.initiator_shift_id"
    )
    respondent_shift: Mapped["Shift"] = relationship(
        foreign_keys="SwapRequest.respondent_shift_id"
    )
