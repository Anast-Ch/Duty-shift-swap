from datetime import date, datetime, time, timedelta, timezone

from app.database import Base, SessionLocal, engine
from app.models import (
    Role,
    Shift,
    ShiftStatus,
    SwapRequest,
    SwapRequestStatus,
    User,
)
from app.security import hash_password


def run() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    today = date.today()
    now = datetime.now(timezone.utc)
    password_hash = hash_password("password")

    u1 = User(name="Петрова Вера", email="pv@company.ru", password_hash=password_hash, role=Role.EMPLOYEE)
    u2 = User(name="Иванов Игорь", email="iv@company.ru", password_hash=password_hash, role=Role.SENIOR)
    u3 = User(name="Сидоров Алексей", email="sa@company.ru", password_hash=password_hash, role=Role.EMPLOYEE)
    u4 = User(name="Кузнецова Мария", email="km@company.ru", password_hash=password_hash, role=Role.EMPLOYEE)
    db.add_all([u1, u2, u3, u4])
    db.flush()

    morning_start, morning_end = time(8, 0), time(16, 0)
    evening_start, evening_end = time(16, 0), time(0, 0)

    sh0 = Shift(user_id=u1.id, date=today - timedelta(days=30), start_time=morning_start, end_time=morning_end, status=ShiftStatus.approved)
    sh1 = Shift(user_id=u1.id, date=today + timedelta(days=2), start_time=morning_start, end_time=morning_end, status=ShiftStatus.on_exchange)
    sh2 = Shift(user_id=u2.id, date=today + timedelta(days=2), start_time=evening_start, end_time=evening_end, status=ShiftStatus.approved)
    sh3 = Shift(user_id=u3.id, date=today + timedelta(days=3), start_time=morning_start, end_time=morning_end, status=ShiftStatus.on_exchange)
    sh4 = Shift(user_id=u4.id, date=today + timedelta(days=3), start_time=evening_start, end_time=evening_end, status=ShiftStatus.approved)
    sh5 = Shift(user_id=u1.id, date=today + timedelta(days=4), start_time=morning_start, end_time=morning_end, status=ShiftStatus.approved)
    db.add_all([sh0, sh1, sh2, sh3, sh4, sh5])
    db.flush()

    db.add_all(
        [
            SwapRequest(
                initiator_id=u1.id,
                respondent_id=u3.id,
                initiator_shift_id=sh1.id,
                respondent_shift_id=sh3.id,
                status=SwapRequestStatus.waiting_senior,
                created_at=now - timedelta(days=1),
            ),
            SwapRequest(
                initiator_id=u4.id,
                respondent_id=u1.id,
                initiator_shift_id=sh4.id,
                respondent_shift_id=sh5.id,
                status=SwapRequestStatus.declined_by_colleague,
                created_at=now - timedelta(days=2),
            ),
            SwapRequest(
                initiator_id=u2.id,
                respondent_id=u4.id,
                initiator_shift_id=sh2.id,
                respondent_shift_id=sh4.id,
                status=SwapRequestStatus.declined_by_senior,
                created_at=now - timedelta(days=3),
            ),
        ]
    )
    db.commit()
    db.close()


if __name__ == "__main__":
    run()
