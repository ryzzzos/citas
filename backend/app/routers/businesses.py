import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_business_owner
from app.models.business import Business
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessRead, BusinessUpdate

router = APIRouter()


@router.post("/", response_model=BusinessRead, status_code=201)
def create_business(
    data: BusinessCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = Business(**data.model_dump(), owner_id=current_user.id)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


@router.get("/", response_model=list[BusinessRead])
def list_businesses(
    city: str | None = None,
    category: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Business)
    if city:
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(Business.category.ilike(f"%{category}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{business_id}", response_model=BusinessRead)
def get_business(business_id: uuid.UUID, db: Session = Depends(get_db)):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business


@router.patch("/{business_id}", response_model=BusinessRead)
def update_business(
    business_id: uuid.UUID,
    data: BusinessUpdate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business


@router.delete("/{business_id}", status_code=204)
def delete_business(
    business_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    db.delete(business)
    db.commit()
