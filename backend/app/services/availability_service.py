import uuid
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.schedule import Schedule
from app.models.service import Service
from app.models.staff import Staff
from app.models.business import Business



def _get_staff_slots(
    db: Session,
    staff_id: uuid.UUID,
    business_id: uuid.UUID,
    service: Service,
    target_date: date,
) -> list[time]:
    """Return list of available start times for a given staff/service/date."""
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
    
    for interval in schedule.intervals:
        try:
            start_str = interval.get("start")
            end_str = interval.get("end")
            if not start_str or not end_str:
                continue
                
            start_t = datetime.strptime(start_str, "%H:%M:%S").time()
            end_t = datetime.strptime(end_str, "%H:%M:%S").time()
        except (ValueError, TypeError):
            # Fallback if time format is %H:%M instead of %H:%M:%S
            try:
                start_t = datetime.strptime(start_str, "%H:%M").time()
                end_t = datetime.strptime(end_str, "%H:%M").time()
            except (ValueError, TypeError):
                continue

        slot_start = datetime.combine(target_date, start_t)
        work_end = datetime.combine(target_date, end_t)

        while slot_start + duration <= work_end:
            candidate_start = slot_start.time()
            candidate_end = (slot_start + duration).time()

            if not _overlaps_any(candidate_start, candidate_end, busy_intervals):
                slots.append(candidate_start)

            # Enforce strict intervals matching service duration
            slot_start += duration

    return slots


def get_available_slots(
    db: Session,
    business_id: uuid.UUID,
    service_id: uuid.UUID,
    target_date: date,
    staff_id: uuid.UUID | None = None,
) -> dict[str, list[uuid.UUID]]:
    """
    Returns a dict mapping time slot (e.g. "10:00:00") to a list of available staff UUIDs.
    If staff_id is provided, checks only that staff member.
    """
    service = db.get(Service, service_id)
    if not service or not service.is_active:
        return {}
    
    # Get current date/time in business's timezone
    business = db.get(Business, business_id)
    tz_str = business.timezone if business else "America/Bogota"
    try:
        tz = ZoneInfo(tz_str)
    except Exception:
        tz = ZoneInfo("America/Bogota")
        
    now_in_tz = datetime.now(tz)
    current_date = now_in_tz.date()
    current_time = now_in_tz.time()

    if target_date < current_date:
        return {}
    
    if staff_id:
        staff_members = [db.get(Staff, staff_id)]
    else:
        # Get all active staff for this business that provide this service
        staff_members = (
            db.query(Staff)
            .filter(Staff.business_id == business_id, Staff.is_active == True)
            .all()
        )
        # Filter in memory because of the many-to-many relationship
        staff_members = [s for s in staff_members if service_id in s.service_ids]
        
    slots_map: dict[str, list[uuid.UUID]] = defaultdict(list)
    
    for staff in staff_members:
        if not staff: continue
        staff_slots = _get_staff_slots(db, staff.id, business_id, service, target_date)
        for t in staff_slots:
            # Skip times that are in the past for today
            if target_date == current_date and t <= current_time:
                continue
            time_str = t.strftime("%H:%M:%S")
            slots_map[time_str].append(staff.id)
            
    # Sort the dictionary by time keys
    sorted_slots = {k: slots_map[k] for k in sorted(slots_map.keys())}
    return sorted_slots


def _overlaps_any(
    start: time,
    end: time,
    intervals: list[tuple[time, time]],
) -> bool:
    for busy_start, busy_end in intervals:
        if start < busy_end and end > busy_start:
            return True
    return False
