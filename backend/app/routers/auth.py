from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import register_user, login_user

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return register_user(data, db)


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(data.email, data.password, db)
