from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from app.security import hash_password, verify_password


class UserCRUD:
    """All the database work for users lives here. Routers call these methods."""

    def get(self, db: Session, user_id: int) -> User | None:
        return db.get(User, user_id)

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.scalar(select(User).where(User.email == email.lower()))

    def get_all(self, db: Session, role: str | None = None) -> list[User]:
        query = select(User).order_by(User.name)
        if role:
            query = query.where(User.role == role)
        return list(db.scalars(query))

    def create(self, db: Session, data: UserCreate) -> User:
        user = User(
            name=data.name,
            email=data.email.lower(),
            role=data.role,
            position=data.position,
            hashed_password=hash_password(data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update(self, db: Session, user: User, data: UserUpdate) -> User:
        changes = data.model_dump(exclude_unset=True)
        if "password" in changes:
            user.hashed_password = hash_password(changes.pop("password"))
        if "email" in changes:
            changes["email"] = changes["email"].lower()
        for field, value in changes.items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return user

    def delete(self, db: Session, user: User) -> None:
        db.delete(user)
        db.commit()

    def authenticate(self, db: Session, email: str, password: str) -> User | None:
        user = self.get_by_email(db, email)
        if user and verify_password(password, user.hashed_password):
            return user
        return None


user_crud = UserCRUD()
