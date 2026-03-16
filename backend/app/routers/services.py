import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.service import Service
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter()


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


@router.post("/{business_id}/services", response_model=ServiceRead, status_code=201)
def create_service(
    business_id: uuid.UUID,
    data: ServiceCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = Service(**data.model_dump(), business_id=business_id)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.get("/{business_id}/services", response_model=list[ServiceRead])
def list_services(business_id: uuid.UUID, db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.business_id == business_id, Service.is_active.is_(True))
        .all()
    )


@router.patch("/{business_id}/services/{service_id}", response_model=ServiceRead)
def update_service(
    business_id: uuid.UUID,
    service_id: uuid.UUID,
    data: ServiceUpdate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = db.get(Service, service_id)
    if not service or service.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{business_id}/services/{service_id}", status_code=204)
def delete_service(
    business_id: uuid.UUID,
    service_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = db.get(Service, service_id)
    if not service or service.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    db.delete(service)
    db.commit()
