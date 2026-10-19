from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import TrainingSession, User
from app.schemas.training_session import SessionCreate, SessionUpdate


class SessionCRUD:
    """Database work for training sessions."""

    def get(self, db: Session, session_id: int) -> TrainingSession | None:
        return db.get(TrainingSession, session_id)

    def get_all(
        self,
        db: Session,
        focus: str | None = None,
        level: str | None = None,
        coach_id: int | None = None,
        upcoming_only: bool = True,
    ) -> list[TrainingSession]:
        query = select(TrainingSession).order_by(TrainingSession.start_time)
        if focus:
            query = query.where(TrainingSession.focus == focus)
        if level:
            query = query.where(TrainingSession.level == level)
        if coach_id:
            query = query.where(TrainingSession.coach_id == coach_id)
        if upcoming_only:
            query = query.where(TrainingSession.start_time >= datetime.now())
        return list(db.scalars(query))

    def create(self, db: Session, data: SessionCreate, coach: User) -> TrainingSession:
        session = TrainingSession(**data.model_dump(), coach_id=coach.id)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def update(self, db: Session, session: TrainingSession, data: SessionUpdate) -> TrainingSession:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(session, field, value)
        db.commit()
        db.refresh(session)
        return session

    def delete(self, db: Session, session: TrainingSession) -> None:
        db.delete(session)
        db.commit()


session_crud = SessionCRUD()
