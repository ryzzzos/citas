import uuid
from datetime import date, time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_business_owner
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingStatusUpdate
from app.services.availability_service import get_available_slots
from app.services.booking_service import create_booking, update_booking_status

router = APIRouter()


@router.post("/", response_model=BookingRead, status_code=201)
def book_appointment(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_booking(data, current_user.id, db)


@router.get("/my", response_model=list[BookingRead])
def my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@router.get("/business/{business_id}", response_model=list[BookingRead])
def business_agenda(
    business_id: uuid.UUID,
    booking_date: date | None = None,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    query = db.query(Booking).filter(Booking.business_id == business_id)
    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
    return query.order_by(Booking.booking_date, Booking.start_time).all()


@router.get("/availability", response_model=list[time])
def check_availability(
    business_id: uuid.UUID,
    staff_id: uuid.UUID,
    service_id: uuid.UUID,
    booking_date: date,
    db: Session = Depends(get_db),
):
    return get_available_slots(db, staff_id, business_id, service_id, booking_date)


@router.patch("/{booking_id}/status", response_model=BookingRead)
def change_status(
    booking_id: uuid.UUID,
    data: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_booking_status(booking_id, data, current_user, db)
