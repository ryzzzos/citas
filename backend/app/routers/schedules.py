import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.schedule import Schedule
from app.models.user import User
from app.schemas.schedule import ScheduleCreate, ScheduleRead

router = APIRouter()


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


@router.post("/{business_id}/schedules", response_model=ScheduleRead, status_code=201)
def create_schedule(
    business_id: uuid.UUID,
    data: ScheduleCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    schedule = Schedule(**data.model_dump(), business_id=business_id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/{business_id}/schedules", response_model=list[ScheduleRead])
def list_schedules(business_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Schedule).filter(Schedule.business_id == business_id).all()


@router.delete("/{business_id}/schedules/{schedule_id}", status_code=204)
def delete_schedule(
    business_id: uuid.UUID,
    schedule_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    schedule = db.get(Schedule, schedule_id)
    if not schedule or schedule.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
