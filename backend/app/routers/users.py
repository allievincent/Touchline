from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import user_crud
from app.dependencies import get_current_user
from app.models import User
from app.schemas.user import UserOut, UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserPublic])
def list_users(role: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return user_crud.get_all(db, role=role)


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = user_crud.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# you can only edit / delete your own account
@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if data.email and data.email.lower() != user.email:
        if user_crud.get_by_email(db, data.email):
            raise HTTPException(status_code=400, detail="That email is already taken")
    return user_crud.update(db, user, data)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user_crud.delete(db, user)
