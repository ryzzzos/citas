import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.branch import Branch
from app.models.staff import Staff
from app.models.schedule_block import ScheduleBlock
from app.models.user import User
from app.schemas.schedule_block import ScheduleBlockCreate, ScheduleBlockRead

router = APIRouter()


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


@router.get("/{business_id}", response_model=list[ScheduleBlockRead])
def list_schedule_blocks(
    business_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    staff_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ScheduleBlock).filter(ScheduleBlock.business_id == business_id)

    if branch_id:
        query = query.filter(ScheduleBlock.branch_id == branch_id)

    if from_date:
        query = query.filter(ScheduleBlock.end_date >= from_date)

    if to_date:
        query = query.filter(ScheduleBlock.start_date <= to_date)

    if staff_id:
        query = query.filter(
            or_(ScheduleBlock.staff_id == staff_id, ScheduleBlock.staff_id.is_(None))
        )

    blocks = query.order_by(ScheduleBlock.start_date.asc(), ScheduleBlock.start_time.asc().nulls_first()).all()
    return blocks


@router.post("/{business_id}", response_model=ScheduleBlockRead, status_code=201)
def create_schedule_block(
    business_id: uuid.UUID,
    data: ScheduleBlockCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)

    branch = db.get(Branch, data.branch_id)
    if not branch or branch.business_id != business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch not found or does not belong to this business",
        )

    if data.staff_id:
        staff = db.get(Staff, data.staff_id)
        if not staff or staff.business_id != business_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff member not found or does not belong to this business",
            )
        if staff.branch_id != data.branch_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff member does not belong to the selected branch",
            )

    block = ScheduleBlock(
        business_id=business_id,
        branch_id=data.branch_id,
        staff_id=data.staff_id,
        start_date=data.start_date,
        end_date=data.end_date,
        start_time=data.start_time,
        end_time=data.end_time,
        reason=data.reason,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.delete("/{business_id}/{block_id}", status_code=204)
def delete_schedule_block(
    business_id: uuid.UUID,
    block_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)

    block = db.get(ScheduleBlock, block_id)
    if not block or block.business_id != business_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule block not found",
        )

    db.delete(block)
    db.commit()
