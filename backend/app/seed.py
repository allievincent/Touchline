"""Hardcoded starter data so the app isn't empty the first time you run it."""
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.crud import user_crud, session_crud, booking_crud, workout_log_crud
from app.schemas.user import UserCreate
from app.schemas.training_session import SessionCreate
from app.schemas.workout_log import LogCreate, ExerciseIn


def at(days: int, hour: int, minute: int = 0) -> datetime:
    day = datetime.now() + timedelta(days=days)
    return day.replace(hour=hour, minute=minute, second=0, microsecond=0)


def seed(db: Session) -> None:
    if user_crud.get_all(db):
        return  # already has data

    allie = user_crud.create(db, UserCreate(name="Allie Vincent", email="coach@touchline.app", password="password123", role="coach", position="Goalkeeper"))
    sam = user_crud.create(db, UserCreate(name="Sam Rivera", email="sam@touchline.app", password="password123", role="coach", position="Midfielder"))
    demo = user_crud.create(db, UserCreate(name="Demo Player", email="player@touchline.app", password="password123", role="player", position="Forward"))
    jordan = user_crud.create(db, UserCreate(name="Jordan Lee", email="jordan@touchline.app", password="password123", role="player", position="Goalkeeper"))
    user_crud.create(db, UserCreate(name="Maya Patel", email="maya@touchline.app", password="password123", role="player", position="Defender"))

    sessions = [
        (allie, SessionCreate(title="Goalkeeper Fundamentals", focus="Goalkeeping", level="Beginner",
            description="Set position, catching shapes, and footwork. Great if you've never had keeper training before. Bring gloves if you have them.",
            location="Main Field", start_time=at(2, 17), duration_minutes=60, capacity=6)),
        (allie, SessionCreate(title="Shot Stopping & Diving", focus="Goalkeeping", level="Intermediate",
            description="Low and high dives, recovery saves, and reacting to deflections. We'll finish with live shots from the edge of the box.",
            location="Main Field", start_time=at(4, 17), duration_minutes=75, capacity=6)),
        (allie, SessionCreate(title="1v1s and Crosses", focus="Goalkeeping", level="Advanced",
            description="Coming off your line, spreading in 1v1s, and claiming crosses under pressure.",
            location="Turf Field 2", start_time=at(9, 18), duration_minutes=75, capacity=4)),
        (sam, SessionCreate(title="Finishing Clinic", focus="Finishing", level="Intermediate",
            description="First-time finishes, placement vs. power, and finishing off crosses. Keepers welcome to join and get reps in goal.",
            location="Turf Field 2", start_time=at(3, 18), duration_minutes=60, capacity=14)),
        (sam, SessionCreate(title="Passing Patterns", focus="Passing", level="Beginner",
            description="Weight of pass, first touch, and simple combinations like the wall pass and third-man run.",
            location="Practice Field", start_time=at(5, 16), duration_minutes=60, capacity=16)),
        (sam, SessionCreate(title="Pickup 5v5", focus="Small-Sided Games", level="Intermediate",
            description="Just games. Small fields, quick rounds, winner stays on.",
            location="Practice Field", start_time=at(6, 19), duration_minutes=90, capacity=20)),
        (sam, SessionCreate(title="Speed & Agility", focus="Fitness", level="Advanced",
            description="Acceleration, change of direction, and repeat sprints. Bring water.",
            location="Track", start_time=at(8, 7), duration_minutes=45, capacity=12)),
    ]
    created = [session_crud.create(db, data, coach) for coach, data in sessions]

    # a few bookings so spots_left isn't always full
    booking_crud.create(db, demo, created[0], "First time doing keeper training!")
    booking_crud.create(db, demo, created[3])
    booking_crud.create(db, jordan, created[0])
    booking_crud.create(db, jordan, created[1], "Working on my left side")

    # a week of training log entries for the demo player
    def ago(n):
        return date.today() - timedelta(days=n)

    logs = [
        LogCreate(date=ago(0), kind="Lift", title="Lower body", duration_minutes=55, effort=7,
            notes="Squats felt heavy, probably still tired from Saturday.", coach_id=allie.id,
            exercises=[ExerciseIn(name="Back squat", sets=4, reps=6, weight=135),
                       ExerciseIn(name="RDL", sets=3, reps=8, weight=95),
                       ExerciseIn(name="Bulgarian split squat", sets=3, reps=10, weight=25),
                       ExerciseIn(name="Copenhagen plank", sets=3)]),
        LogCreate(date=ago(1), kind="Recovery", title="Stretch + foam roll", duration_minutes=25, effort=2),
        LogCreate(date=ago(2), kind="Game", title="Club game vs. Riverside", duration_minutes=90, effort=9,
            notes="Won 2-1. Played the full 90."),
        LogCreate(date=ago(3), kind="Practice", title="Team practice", duration_minutes=100, effort=6,
            notes="Lots of crossing and finishing. First touch was good today."),
        LogCreate(date=ago(5), kind="Conditioning", title="Tempo runs", duration_minutes=35, effort=8,
            notes="10 x 100m, 30s rest", exercises=[ExerciseIn(name="100m tempo", sets=10)]),
        LogCreate(date=ago(6), kind="Lift", title="Upper body", duration_minutes=45, effort=6, coach_id=allie.id,
            exercises=[ExerciseIn(name="Bench press", sets=4, reps=8, weight=85),
                       ExerciseIn(name="Pull-ups", sets=3, reps=6),
                       ExerciseIn(name="DB row", sets=3, reps=10, weight=30)]),
    ]
    created_logs = [workout_log_crud.create(db, demo, data) for data in logs]
    workout_log_crud.set_feedback(db, created_logs[5], "Nice work on the pull-ups. Try adding a 4th set next week.")
