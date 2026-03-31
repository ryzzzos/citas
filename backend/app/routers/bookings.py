import uuid
from datetime import date, datetime, time, timezone, tzinfo
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import String, and_, cast, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_business_owner
from app.models.booking import Booking
from app.models.service import Service
from app.models.staff import Staff
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingStatusUpdate
from app.services.availability_service import get_available_slots
from app.services.booking_service import create_booking, update_booking_status

router = APIRouter()


def _resolve_timezone(timezone_name: str) -> tzinfo:
    normalized = timezone_name.strip()
    if normalized.upper() in {"UTC", "Z", "GMT"}:
        return timezone.utc
    try:
        return ZoneInfo(normalized)
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid timezone: {timezone_name}",
        ) from exc


def _to_aware_local(booking_date: date, booking_time: time, timezone_name: str) -> datetime:
    local_zone = _resolve_timezone(timezone_name)
    return datetime.combine(booking_date, booking_time).replace(tzinfo=local_zone)


def _intersects_range(
    booking: Booking,
    timezone_name: str,
    from_at: datetime | None,
    to_at: datetime | None,
) -> bool:
    start_local = _to_aware_local(booking.booking_date, booking.start_time, timezone_name)
    end_local = _to_aware_local(booking.booking_date, booking.end_time, timezone_name)

    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    if from_at and end_utc <= from_at:
        return False
    if to_at and start_utc >= to_at:
        return False
    return True


def _ensure_aware_utc(value: datetime | None) -> datetime | None:
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


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
    from_at: datetime | None = None,
    to_at: datetime | None = None,
    timezone: str = "UTC",
    statuses: list[str] | None = Query(default=None),
    staff_id: uuid.UUID | None = None,
    service_id: uuid.UUID | None = None,
    q: str | None = None,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    local_zone = _resolve_timezone(timezone)

    query = db.query(Booking).filter(Booking.business_id == business_id)

    if staff_id:
        query = query.filter(Booking.staff_id == staff_id)

    if service_id:
        query = query.filter(Booking.service_id == service_id)

    if statuses:
        query = query.filter(Booking.status.in_(statuses))

    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
    elif from_at or to_at:
        range_filters = []
        if from_at:
            range_filters.append(Booking.booking_date >= from_at.astimezone(local_zone).date())
        if to_at:
            range_filters.append(Booking.booking_date <= to_at.astimezone(local_zone).date())
        if range_filters:
            query = query.filter(and_(*range_filters))

    if q:
        query = query.join(Booking.service).join(Booking.staff).filter(
            or_(
                cast(Booking.id, String).ilike(f"%{q}%"),
                Booking.status.ilike(f"%{q}%"),
                Service.name.ilike(f"%{q}%"),
                Staff.name.ilike(f"%{q}%"),
            )
        )

    bookings = query.order_by(Booking.booking_date, Booking.start_time).all()

    if from_at or to_at:
        from_utc = _ensure_aware_utc(from_at)
        to_utc = _ensure_aware_utc(to_at)
        bookings = [
            booking
            for booking in bookings
            if _intersects_range(booking, timezone, from_utc, to_utc)
        ]

    return bookings


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
