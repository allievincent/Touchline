from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import session_crud, booking_crud
from app.dependencies import get_current_user, require_coach
from app.models import User, TrainingSession
from app.schemas.training_session import SessionCreate, SessionOut, SessionUpdate
from app.schemas.booking import RosterEntry

router = APIRouter(prefix="/sessions", tags=["Training Sessions"])


def get_session_or_404(db: Session, session_id: int) -> TrainingSession:
    session = session_crud.get(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def check_owner(session: TrainingSession, coach: User):
    if session.coach_id != coach.id:
        raise HTTPException(status_code=403, detail="You can only change your own sessions")


@router.get("/", response_model=list[SessionOut])
def list_sessions(
    focus: str | None = None,
    level: str | None = None,
    coach_id: int | None = None,
    include_past: bool = False,
    db: Session = Depends(get_db),
):
    return session_crud.get_all(db, focus=focus, level=level, coach_id=coach_id, upcoming_only=not include_past)


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: Session = Depends(get_db)):
    return get_session_or_404(db, session_id)


@router.post("/", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(data: SessionCreate, db: Session = Depends(get_db), coach: User = Depends(require_coach)):
    return session_crud.create(db, data, coach)


@router.put("/{session_id}", response_model=SessionOut)
def update_session(session_id: int, data: SessionUpdate, db: Session = Depends(get_db), coach: User = Depends(require_coach)):
    session = get_session_or_404(db, session_id)
    check_owner(session, coach)
    if data.capacity is not None and data.capacity < session.booked_count:
        raise HTTPException(status_code=400, detail=f"{session.booked_count} players are already booked, capacity can't go lower than that")
    return session_crud.update(db, session, data)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, db: Session = Depends(get_db), coach: User = Depends(require_coach)):
    session = get_session_or_404(db, session_id)
    check_owner(session, coach)
    session_crud.delete(db, session)


# coach sees who signed up
@router.get("/{session_id}/roster", response_model=list[RosterEntry])
def session_roster(session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = get_session_or_404(db, session_id)
    if session.coach_id != user.id:
        raise HTTPException(status_code=403, detail="Only the coach running this session can see the roster")
    return booking_crud.get_for_session(db, session)
