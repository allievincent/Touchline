# importing these here makes sure every table is registered before create_all runs
from app.models.user import User
from app.models.training_session import TrainingSession
from app.models.booking import Booking
from app.models.workout_log import WorkoutLog, Exercise

__all__ = ["User", "TrainingSession", "Booking", "WorkoutLog", "Exercise"]
