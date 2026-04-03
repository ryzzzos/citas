from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.service import Service
from app.schemas.booking import BookingCreate, BookingStatusUpdate
from app.services.availability_service import _overlaps_any


def create_booking(data: BookingCreate, user_id, db: Session) -> Booking:
    service = db.get(Service, data.service_id)
    if not service or not service.is_active or service.business_id != data.business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    end_time = (
        datetime.combine(data.booking_date, data.start_time)
        + timedelta(minutes=service.duration_minutes)
    ).time()

    # Conflict check — no double booking for same staff on same date
    existing = (
        db.query(Booking)
        .filter(
            Booking.staff_id == data.staff_id,
            Booking.booking_date == data.booking_date,
            Booking.status.notin_(["cancelled"]),
        )
        .all()
    )

    busy = [(b.start_time, b.end_time) for b in existing]
    if _overlaps_any(data.start_time, end_time, busy):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Time slot is not available",
        )

    booking = Booking(
        user_id=user_id,
        business_id=data.business_id,
        service_id=data.service_id,
        staff_id=data.staff_id,
        booking_date=data.booking_date,
        start_time=data.start_time,
        end_time=end_time,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def update_booking_status(
    booking_id, data: BookingStatusUpdate, current_user, db: Session
) -> Booking:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Customer can only cancel their own bookings
    if current_user.role == "customer":
        if booking.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        if data.status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers may only cancel bookings",
            )

    booking.status = data.status
    db.commit()
    db.refresh(booking)
    return booking
