"""Demo mode service: seeds realistic bookings around the current datetime.

Each call wipes all bookings tagged with ``is_demo_seed = True`` for the
target business and re-creates a fresh set distributed across all branches,
staff members, and booking statuses so that every dashboard module renders
meaningful data.
"""

from __future__ import annotations

import random
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.branch import Branch
from app.models.service import Service
from app.models.staff import Staff

# Realistic Colombian customer names used for demo bookings
DEMO_CUSTOMER_NAMES = [
    "Santiago Restrepo",
    "Isabella Cardona",
    "Mateo Ramirez",
    "Valeria Gonzalez",
    "Samuel Herrera",
    "Daniela Lopez",
    "Nicolas Salazar",
    "Camila Arias",
    "Alejandro Torres",
    "Mariana Velez",
    "Diego Monsalve",
    "Laura Betancur",
    "Sebastian Giraldo",
    "Paula Ochoa",
    "Andres Jaramillo",
    "Carolina Zapata",
    "Julian Gomez",
    "Natalia Restrepo",
]


def _add_minutes(t: time, minutes: int) -> time:
    """Return a new time offset by *minutes*."""
    dt = datetime.combine(date.today(), t) + timedelta(minutes=minutes)
    return dt.time()


def reset_and_seed_demo_bookings(session: Session, business_id: str) -> int:
    """Delete previous demo bookings and create a realistic fresh set.

    Returns the number of bookings created.
    """

    # ── 1. Purge old demo bookings ──────────────────────────────
    session.query(Booking).filter(
        Booking.business_id == business_id,
        Booking.is_demo_seed.is_(True),
    ).delete(synchronize_session="fetch")
    session.flush()

    # ── 2. Load business assets ─────────────────────────────────
    branches = (
        session.query(Branch)
        .filter(Branch.business_id == business_id, Branch.is_active.is_(True))
        .all()
    )
    services = (
        session.query(Service)
        .filter(Service.business_id == business_id, Service.is_active.is_(True))
        .all()
    )

    if not branches or not services:
        return 0

    now = datetime.now(timezone.utc)
    today = now.date()
    current_hour = now.hour

    name_pool = list(DEMO_CUSTOMER_NAMES)
    random.shuffle(name_pool)
    name_idx = 0
    created_count = 0

    def next_customer() -> dict:
        nonlocal name_idx
        name = name_pool[name_idx % len(name_pool)]
        name_idx += 1
        first = name.split()[0].lower()
        return {
            "customer_name": name,
            "customer_email": f"{first}.demo@agenda-demo.co",
            "customer_phone": f"+57 300 {random.randint(100, 999)} {random.randint(1000, 9999)}",
        }

    def make_booking(
        branch: Branch,
        staff: Staff,
        service: Service,
        booking_date: date,
        start: time,
        status: str,
    ) -> Booking:
        end = _add_minutes(start, service.duration_minutes)
        customer = next_customer()
        ts_fields: dict = {}

        if status == "confirmed":
            ts_fields["confirmed_at"] = now - timedelta(hours=random.randint(1, 12))
        elif status == "completed":
            ts_fields["confirmed_at"] = now - timedelta(hours=random.randint(12, 36))
            ts_fields["completed_at"] = datetime.combine(booking_date, end, tzinfo=timezone.utc)
            ts_fields["paid_at"] = ts_fields["completed_at"] + timedelta(minutes=random.randint(1, 5))
        elif status == "cancelled":
            ts_fields["cancelled_at"] = now - timedelta(hours=random.randint(1, 6))

        booking_obj = Booking(
            business_id=business_id,
            branch_id=branch.id,
            service_id=service.id,
            staff_id=staff.id,
            booking_date=booking_date,
            start_time=start,
            end_time=end,
            status=status,
            is_demo_seed=True,
            notes="Reserva generada automaticamente para el modo demo.",
            **customer,
            **ts_fields,
        )
        session.add(booking_obj)
        session.flush()

        from app.models.payment import Payment
        pay_status = "paid" if status == "completed" else "pending"
        pay_method = random.choice(["cash", "transfer", "credit_card"]) if status == "completed" else "pending"

        payment_obj = Payment(
            booking_id=booking_obj.id,
            amount=service.price,
            currency="COP",
            status=pay_status,
            payment_method=pay_method,
            transaction_id=f"DEMO-TX-{booking_obj.id.hex[:8].upper()}" if status == "completed" else None,
        )
        session.add(payment_obj)
        return booking_obj

    # ── 3. Seed bookings per branch ─────────────────────────────
    for branch in branches:
        staff_list = (
            session.query(Staff)
            .filter(Staff.branch_id == branch.id, Staff.is_active.is_(True))
            .all()
        )
        if not staff_list:
            continue

        for staff_member in staff_list:
            staff_services = staff_member.services if staff_member.services else services
            if not staff_services:
                continue

            # --- Yesterday: 3 completed bookings for financial history ---
            yesterday = today - timedelta(days=1)
            for i, slot_hour in enumerate([9, 11, 14]):
                svc = staff_services[i % len(staff_services)]
                make_booking(branch, staff_member, svc, yesterday, time(slot_hour, 0), "completed")
                created_count += 1

            # --- Today: completed in the morning ---
            morning_hours = [h for h in [9, 10, 11] if h < current_hour]
            for i, h in enumerate(morning_hours):
                svc = staff_services[i % len(staff_services)]
                make_booking(branch, staff_member, svc, today, time(h, 0), "completed")
                created_count += 1

            # --- Today: confirmed "in-progress" at current hour ---
            if 8 <= current_hour <= 17:
                svc = staff_services[0]
                make_booking(branch, staff_member, svc, today, time(current_hour, 0), "confirmed")
                created_count += 1

            # --- Today: afternoon confirmed + pending ---
            afternoon_hours = [h for h in [14, 15, 16, 17] if h > current_hour]
            for i, h in enumerate(afternoon_hours[:2]):
                svc = staff_services[i % len(staff_services)]
                st = "confirmed" if i == 0 else "pending"
                make_booking(branch, staff_member, svc, today, time(h, 0), st)
                created_count += 1

            # --- Today: 1 cancelled booking (always present) ---
            cancel_hour = min(max(current_hour - 1, 9), 17)
            svc = staff_services[-1]
            make_booking(branch, staff_member, svc, today, time(cancel_hour, 30), "cancelled")
            created_count += 1

            # --- Tomorrow: 2 confirmed + 1 pending ---
            tomorrow = today + timedelta(days=1)
            for i, slot_hour in enumerate([10, 14]):
                svc = staff_services[i % len(staff_services)]
                make_booking(branch, staff_member, svc, tomorrow, time(slot_hour, 0), "confirmed")
                created_count += 1

            svc = staff_services[0]
            make_booking(branch, staff_member, svc, tomorrow, time(16, 0), "pending")
            created_count += 1

            # --- Day after tomorrow: 1 pending ---
            day_after = today + timedelta(days=2)
            svc = staff_services[0]
            make_booking(branch, staff_member, svc, day_after, time(11, 0), "pending")
            created_count += 1

    session.flush()
    return created_count

