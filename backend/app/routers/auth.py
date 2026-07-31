from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import create_access_token
from app.models.business import Business
from app.models.user import User
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import register_user, login_user
from app.services.demo_service import reset_and_seed_demo_bookings

DEMO_OWNER_EMAIL = "maxialex.com@gmail.com"

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return register_user(data, db)


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(data.email, data.password, db)


@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Authenticate as the demo business owner and refresh demo bookings.

    This endpoint:
    1. Looks up the Barberia SENA owner account.
    2. Wipes old demo-seeded bookings and creates a fresh set around *now*.
    3. Returns a JWT access token so the frontend can redirect to /dashboard.
    """
    owner = db.query(User).filter(User.email == DEMO_OWNER_EMAIL).first()
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo account is not available. Please run the seed script first.",
        )

    business = db.query(Business).filter(Business.owner_id == owner.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo business not found.",
        )

    reset_and_seed_demo_bookings(db, str(business.id))
    db.commit()

    token = create_access_token(str(owner.id))
    return Token(access_token=token)

