from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import user_crud
from app.dependencies import get_current_user
from app.models import User
from app.schemas.user import UserCreate, UserOut, Token
from app.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="An account with that email already exists")
    user = user_crud.create(db, data)
    return Token(access_token=create_access_token(user.id), user=user)


# uses a form (username + password) so the Authorize button on /docs works.
# the "username" field is the email
@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.authenticate(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return Token(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
