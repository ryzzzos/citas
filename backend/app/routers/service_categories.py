from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.service_category import ServiceCategory
from app.models.service import Service
from app.models.user import User
from app.schemas.service_category import ServiceCategoryCreate, ServiceCategoryRead, ServiceCategoryUpdate, ServiceCategoryReorder

router = APIRouter()


@router.get("", response_model=List[ServiceCategoryRead])
def list_service_categories(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    """List all service categories for a specific business."""
    # Ensure current user owns the business
    from app.models.business import Business
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    categories = db.query(ServiceCategory).filter(
        ServiceCategory.business_id == business_id
    ).order_by(ServiceCategory.position.asc()).all()
    return categories


@router.post("", response_model=ServiceCategoryRead, status_code=status.HTTP_201_CREATED)
def create_service_category(
    business_id: uuid.UUID,
    category_in: ServiceCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    """Create a new service category."""
    from app.models.business import Business
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    category = ServiceCategory(
        business_id=business_id,
        name=category_in.name,
        description=category_in.description,
        position=category_in.position
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=ServiceCategoryRead)
def update_service_category(
    business_id: uuid.UUID,
    category_id: uuid.UUID,
    category_in: ServiceCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    from app.models.business import Business
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    category = db.query(ServiceCategory).filter(
        ServiceCategory.id == category_id,
        ServiceCategory.business_id == business_id
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_category(
    business_id: uuid.UUID,
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    from app.models.business import Business
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    category = db.query(ServiceCategory).filter(
        ServiceCategory.id == category_id,
        ServiceCategory.business_id == business_id
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Re-assign services to default category - meaning setting them to null or creating an ad-hoc one if needed
    # The plan says "re-asignacion de servicios a 'Sin categoria'."
    # I'll find or create "Sin categoria" for this business.
    default_cat = db.query(ServiceCategory).filter(
        ServiceCategory.business_id == business_id,
        ServiceCategory.name == "Sin categoría",
        ServiceCategory.id != category_id
    ).first()

    if not default_cat:
        default_cat = ServiceCategory(
            business_id=business_id,
            name="Sin categoría",
            position=999
        )
        db.add(default_cat)
        db.commit()
        db.refresh(default_cat)

    services = db.query(Service).filter(Service.service_category_id == category_id).all()
    for service in services:
        service.service_category_id = default_cat.id

    db.delete(category)
    db.commit()
    return None
