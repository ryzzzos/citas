import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.staff import Staff
from app.models.user import User
from app.models.service import Service
from app.schemas.staff import StaffCreate, StaffRead, StaffUpdate

router = APIRouter()


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


@router.post("/{business_id}/staff", response_model=StaffRead, status_code=201)
def add_staff(
    business_id: uuid.UUID,
    data: StaffCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    
    services = []
    if data.service_ids:
        services = db.query(Service).filter(
            Service.id.in_(data.service_ids),
            Service.business_id == business_id
        ).all()
        if len(services) != len(data.service_ids):
            raise HTTPException(status_code=400, detail="One or more services are invalid or don't belong to this business")

    dump_data = data.model_dump(exclude={"service_ids"})
    member = Staff(**dump_data, business_id=business_id)
    member.services = services
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/{business_id}/staff", response_model=list[StaffRead])
def list_staff(
    business_id: uuid.UUID,
    branch_id: uuid.UUID | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Staff).filter(Staff.business_id == business_id, Staff.is_active.is_(True))
    if branch_id:
        query = query.filter(Staff.branch_id == branch_id)
    return query.all()


@router.patch("/{business_id}/staff/{staff_id}", response_model=StaffRead)
def update_staff(
    business_id: uuid.UUID,
    staff_id: uuid.UUID,
    data: StaffUpdate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    member = db.get(Staff, staff_id)
    if not member or member.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")
    
    update_data = data.model_dump(exclude_unset=True)
    if "service_ids" in update_data:
        service_ids = update_data.pop("service_ids")
        if service_ids:
            services = db.query(Service).filter(
                Service.id.in_(service_ids),
                Service.business_id == business_id
            ).all()
            if len(services) != len(service_ids):
                raise HTTPException(status_code=400, detail="One or more services are invalid or don't belong to this business")
            member.services = services
        else:
            member.services = []

    for field, value in update_data.items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{business_id}/staff/{staff_id}", status_code=204)
def remove_staff(
    business_id: uuid.UUID,
    staff_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    member = db.get(Staff, staff_id)
    if not member or member.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")
    db.delete(member)
    db.commit()
