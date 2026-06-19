from typing import List
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.core.security import decode_access_token
from app.models.branch import Branch
from app.models.business import Business
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchRead, BranchUpdate
from app.services.geocoding_service import geocode_business_location
from datetime import datetime, timezone

router = APIRouter()

@router.get("", response_model=List[BranchRead])
def list_branches(
    business_id: uuid.UUID,
    include_inactive: bool = Query(default=False),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """List all branches for a specific business. Includes active ones by default."""
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )

    query = db.query(Branch).filter(Branch.business_id == business_id)

    if include_inactive:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to include inactive branches",
            )
        
        token = authorization.removeprefix("Bearer ").strip()
        user_id = decode_access_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        
        current_user = db.get(User, uuid.UUID(user_id))
        if not current_user or (business.owner_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden to view inactive branches",
            )
    else:
        query = query.filter(Branch.is_active.is_(True))

    return query.order_by(Branch.created_at.asc()).all()

@router.post("", response_model=BranchRead, status_code=status.HTTP_201_CREATED)
def create_branch(
    business_id: uuid.UUID,
    branch_in: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    """Create a new branch."""
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    geo_result = None
    if branch_in.latitude is None and branch_in.longitude is None:
        geo_result = geocode_business_location(
            name=branch_in.name, address=branch_in.address, city=branch_in.city
        )
    
    branch = Branch(
        business_id=business_id,
        name=branch_in.name,
        address=branch_in.address,
        city=branch_in.city,
        phone=branch_in.phone,
        is_active=branch_in.is_active,
        latitude=branch_in.latitude if branch_in.latitude is not None else (geo_result.latitude if geo_result else None),
        longitude=branch_in.longitude if branch_in.longitude is not None else (geo_result.longitude if geo_result else None),
        geocoding_status=geo_result.status if geo_result else "pending",
        geocoding_error=geo_result.error if geo_result else None,
        geocoded_at=datetime.now(timezone.utc) if geo_result else None,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

@router.patch("/{branch_id}", response_model=BranchRead)
def update_branch(
    business_id: uuid.UUID,
    branch_id: uuid.UUID,
    branch_in: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    """Update a branch."""
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    branch = db.query(Branch).filter(
        Branch.id == branch_id,
        Branch.business_id == business_id
    ).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    update_data = branch_in.model_dump(exclude_unset=True)
    
    needs_geocoding = False
    if "address" in update_data or "city" in update_data:
        needs_geocoding = True
        
    for field, value in update_data.items():
        setattr(branch, field, value)

    if needs_geocoding and "latitude" not in update_data:
        geo_result = geocode_business_location(
            name=branch.name, address=branch.address, city=branch.city
        )
        branch.latitude = geo_result.latitude
        branch.longitude = geo_result.longitude
        branch.geocoding_status = geo_result.status
        branch.geocoding_error = geo_result.error
        branch.geocoded_at = datetime.now(timezone.utc)


    db.commit()
    db.refresh(branch)
    return branch

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(
    business_id: uuid.UUID,
    branch_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    """Delete a branch."""
    business = db.query(Business).filter(
        Business.id == business_id, Business.owner_id == current_user.id
    ).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or you don't have access",
        )

    branch = db.query(Branch).filter(
        Branch.id == branch_id,
        Branch.business_id == business_id
    ).first()
    if not branch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    # Prevent deleting the last active branch if we want to enforce at least one, but for now we just delete.
    # Optionally: check if staff or bookings exist and prevent deletion. Postgres CASCADE will handle it, but it might be dangerous.
    
    db.delete(branch)
    db.commit()
    return None
