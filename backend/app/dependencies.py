from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import decode_access_token
from app.crud.user_crud import user_crud
from app.models import User

# tokenUrl makes the "Authorize" button work on the /docs page
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_access_token(token)
    user = user_crud.get(db, user_id) if user_id else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not logged in",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_coach(user: User = Depends(get_current_user)) -> User:
    if user.role != "coach":
        raise HTTPException(status_code=403, detail="Only coaches can do that")
    return user
