from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import workout_log_crud, user_crud
from app.dependencies import get_current_user, require_coach
from app.models import User, WorkoutLog
from app.schemas.workout_log import LogCreate, LogUpdate, LogOut, FeedbackIn

router = APIRouter(prefix="/logs", tags=["Training Log"])


def check_coach(db: Session, coach_id: int | None, user: User):
    """Make sure the person you're sharing with is actually a coach."""
    if coach_id is None:
        return
    coach = user_crud.get(db, coach_id)
    if not coach or coach.role != "coach":
        raise HTTPException(status_code=400, detail="You can only share a log with a coach")
    if coach.id == user.id:
        raise HTTPException(status_code=400, detail="You can't share a log with yourself")


def get_log(db: Session, log_id: int) -> WorkoutLog:
    log = workout_log_crud.get(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


def get_my_log(db: Session, log_id: int, user: User) -> WorkoutLog:
    log = get_log(db, log_id)
    if log.user_id != user.id:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.get("/me", response_model=list[LogOut])
def my_logs(kind: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return workout_log_crud.get_for_user(db, user, kind)


# coaches: everything players have shared with you
@router.get("/shared", response_model=list[LogOut])
def shared_with_me(db: Session = Depends(get_db), coach: User = Depends(require_coach)):
    return workout_log_crud.get_shared_with(db, coach)


@router.get("/{log_id}", response_model=LogOut)
def read_log(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = get_log(db, log_id)
    # private unless it's yours or it was shared with you
    if user.id not in (log.user_id, log.coach_id):
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.post("/", response_model=LogOut, status_code=status.HTTP_201_CREATED)
def create_log(data: LogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_coach(db, data.coach_id, user)
    return workout_log_crud.create(db, user, data)


@router.put("/{log_id}", response_model=LogOut)
def update_log(log_id: int, data: LogUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = get_my_log(db, log_id, user)
    if "coach_id" in data.model_fields_set:
        check_coach(db, data.coach_id, user)
    return workout_log_crud.update(db, log, data)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    workout_log_crud.delete(db, get_my_log(db, log_id, user))


@router.put("/{log_id}/feedback", response_model=LogOut)
def leave_feedback(log_id: int, data: FeedbackIn, db: Session = Depends(get_db), coach: User = Depends(require_coach)):
    log = get_log(db, log_id)
    if log.coach_id != coach.id:
        raise HTTPException(status_code=403, detail="This log wasn't shared with you")
    return workout_log_crud.set_feedback(db, log, data.feedback)
