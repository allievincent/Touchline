from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import WorkoutLog, Exercise, User
from app.schemas.workout_log import LogCreate, LogUpdate, ExerciseIn


class WorkoutLogCRUD:
    """Database work for the training journal."""

    def get(self, db: Session, log_id: int) -> WorkoutLog | None:
        return db.get(WorkoutLog, log_id)

    def get_for_user(self, db: Session, user: User, kind: str | None = None) -> list[WorkoutLog]:
        query = select(WorkoutLog).where(WorkoutLog.user_id == user.id)
        if kind:
            query = query.where(WorkoutLog.kind == kind)
        return list(db.scalars(query.order_by(WorkoutLog.date.desc(), WorkoutLog.id.desc())))

    def get_shared_with(self, db: Session, coach: User) -> list[WorkoutLog]:
        query = select(WorkoutLog).where(WorkoutLog.coach_id == coach.id)
        return list(db.scalars(query.order_by(WorkoutLog.date.desc(), WorkoutLog.id.desc())))

    def _set_exercises(self, log: WorkoutLog, exercises: list[ExerciseIn]) -> None:
        log.exercises = [Exercise(position=i, **e.model_dump()) for i, e in enumerate(exercises)]

    def create(self, db: Session, user: User, data: LogCreate) -> WorkoutLog:
        log = WorkoutLog(user_id=user.id, **data.model_dump(exclude={"exercises"}))
        self._set_exercises(log, data.exercises)
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    def update(self, db: Session, log: WorkoutLog, data: LogUpdate) -> WorkoutLog:
        changes = data.model_dump(exclude_unset=True, exclude={"exercises"})
        # changing which coach it's shared with clears the old coach's feedback
        if "coach_id" in changes and changes["coach_id"] != log.coach_id:
            log.coach_feedback = None
        for field, value in changes.items():
            setattr(log, field, value)
        if data.exercises is not None:
            self._set_exercises(log, data.exercises)
        db.commit()
        db.refresh(log)
        return log

    def set_feedback(self, db: Session, log: WorkoutLog, feedback: str) -> WorkoutLog:
        log.coach_feedback = feedback.strip() or None
        db.commit()
        db.refresh(log)
        return log

    def delete(self, db: Session, log: WorkoutLog) -> None:
        db.delete(log)
        db.commit()


workout_log_crud = WorkoutLogCRUD()
