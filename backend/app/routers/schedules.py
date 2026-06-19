import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.schedule import Schedule
from app.models.user import User
from app.schemas.schedule import ScheduleCreate, ScheduleRead, UpdateStaffSchedulesInput

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

    from app.models.staff import Staff
    staff = db.get(Staff, data.staff_id)
    if not staff or staff.branch_id != data.branch_id or staff.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid staff or branch")

    # Use mode='json' so that time objects in intervals are serialized to strings
    schedule = Schedule(**data.model_dump(mode="json"), business_id=business_id)
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


@router.put("/{business_id}/schedules/staff/{staff_id}", response_model=list[ScheduleRead])
def update_staff_schedules(
    business_id: uuid.UUID,
    staff_id: uuid.UUID,
    data: UpdateStaffSchedulesInput,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)

    from app.models.staff import Staff
    staff = db.get(Staff, staff_id)
    if not staff or staff.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff not found")

    # Delete existing schedules for this staff member
    db.query(Schedule).filter(Schedule.staff_id == staff_id).delete()

    new_schedules = []
    # Create new schedules
    for sched in data.schedules:
        schedule = Schedule(
            business_id=business_id,
            branch_id=staff.branch_id,
            staff_id=staff_id,
            day_of_week=sched.day_of_week,
            intervals=[interval.model_dump(mode="json") for interval in sched.intervals]
        )
        db.add(schedule)
        new_schedules.append(schedule)

    db.commit()
    for s in new_schedules:
        db.refresh(s)
    return new_schedules
