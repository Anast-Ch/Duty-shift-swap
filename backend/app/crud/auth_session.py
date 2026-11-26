from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuthSession


def create_session(db: Session, session_id: str, user_id: int, expires_at: datetime) -> None:
    session = AuthSession(id=session_id, user_id=user_id, expires_at=expires_at)
    db.add(session)
    db.commit()


def get_active_session(
    db: Session, session_id: str, user_id: int, now: datetime
) -> AuthSession | None:
    query = (
        select(AuthSession)
        .where(
            AuthSession.id == session_id,
            AuthSession.user_id == user_id,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
        .with_for_update()
    )
    return db.scalar(query)


def revoke_session(db: Session, session: AuthSession, now: datetime) -> None:
    session.revoked_at = now
    db.commit()
