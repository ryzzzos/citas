from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.schedule import Schedule
from app.models.service import Service


def get_available_slots(
    db: Session,
    staff_id,
    business_id,
    service_id,
    target_date: date,
) -> list[time]:
    """Return list of available start times for a given staff/service/date."""
    service = db.get(Service, service_id)
    if not service or not service.is_active:
        return []

    day_of_week = target_date.weekday()  # 0=Monday
    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.staff_id == staff_id,
            Schedule.business_id == business_id,
            Schedule.day_of_week == day_of_week,
        )
        .first()
    )
    if not schedule:
        return []

    existing_bookings = (
        db.query(Booking)
        .filter(
            Booking.staff_id == staff_id,
            Booking.booking_date == target_date,
            Booking.status.notin_(["cancelled"]),
        )
        .all()
    )

    busy_intervals = [(b.start_time, b.end_time) for b in existing_bookings]

    slots: list[time] = []
    duration = timedelta(minutes=service.duration_minutes)
    slot_start = datetime.combine(target_date, schedule.start_time)
    work_end = datetime.combine(target_date, schedule.end_time)

    while slot_start + duration <= work_end:
        candidate_start = slot_start.time()
        candidate_end = (slot_start + duration).time()

        if not _overlaps_any(candidate_start, candidate_end, busy_intervals):
            slots.append(candidate_start)

        slot_start += timedelta(minutes=service.duration_minutes)

    return slots


def _overlaps_any(
    start: time,
    end: time,
    intervals: list[tuple[time, time]],
) -> bool:
    for busy_start, busy_end in intervals:
        if start < busy_end and end > busy_start:
            return True
    return False
