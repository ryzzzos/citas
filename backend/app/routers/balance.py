import uuid
import calendar
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Dict, Any
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, String
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.deps import get_db, require_business_owner
from app.models.business import Business
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.service import Service
from app.models.staff import Staff
from app.models.user import User

router = APIRouter()

class PaymentMethodBreakdown(BaseModel):
    cash: float
    credit_card: float
    transfer: float
    online: float

class ExpensesBreakdown(BaseModel):
    commissions: float
    fixed_costs: float
    variable_costs: float

class StaffCommissionItem(BaseModel):
    staff_id: str
    staff_name: str
    bookings_count: int
    income: float
    commission: float
    status: str

class ProfitableServiceItem(BaseModel):
    name: str
    bookings_count: int
    income: float

class KPIItem(BaseModel):
    value: float
    delta: int

class BalanceResponse(BaseModel):
    period: str
    start_date: str
    end_date: str
    gross_income: KPIItem
    expenses: KPIItem
    expenses_breakdown: ExpensesBreakdown
    net_profit: KPIItem
    new_customers: KPIItem
    payment_methods: PaymentMethodBreakdown
    staff_commissions: List[StaffCommissionItem]
    profitable_services: List[ProfitableServiceItem]

@router.get("/businesses/{business_id}/balance", response_model=BalanceResponse)
def get_business_balance(
    business_id: uuid.UUID,
    branch_id: uuid.UUID | None = Query(None),
    period: str = Query("month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business_owner),
):
    # 1. Verify business exists and user owns it
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    if business.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not own this business"
        )

    # 2. Get current date in business timezone
    try:
        tz = ZoneInfo(business.timezone)
    except Exception:
        tz = ZoneInfo("America/Bogota")
        
    now_tz = datetime.now(tz)
    today = now_tz.date()

    # 3. Calculate date ranges (current and previous comparison)
    if period == "week":
        # Current week (Monday to Sunday)
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        # Previous week
        prev_start_date = start_date - timedelta(days=7)
        prev_end_date = end_date - timedelta(days=7)
        
    elif period == "year":
        # Current year
        start_date = date(today.year, 1, 1)
        end_date = date(today.year, 12, 31)
        
        # Previous year
        prev_start_date = date(today.year - 1, 1, 1)
        prev_end_date = date(today.year - 1, 12, 31)
        
    else: # "month"
        # Current month
        start_date = date(today.year, today.month, 1)
        last_day = calendar.monthrange(today.year, today.month)[1]
        end_date = date(today.year, today.month, last_day)
        
        # Previous month
        if today.month == 1:
            prev_year = today.year - 1
            prev_month = 12
        else:
            prev_year = today.year
            prev_month = today.month - 1
        prev_start_date = date(prev_year, prev_month, 1)
        prev_last_day = calendar.monthrange(prev_year, prev_month)[1]
        prev_end_date = date(prev_year, prev_month, prev_last_day)

    # Helper function to filter by business, optional branch, and dates
    def apply_filters(query, start, end):
        q = query.filter(
            Booking.business_id == business_id,
            Booking.booking_date >= start,
            Booking.booking_date <= end
        )
        if branch_id:
            q = q.filter(Booking.branch_id == branch_id)
        return q

    # 4. Gross Income (Paid Payments)
    current_gross_q = apply_filters(db.query(func.sum(Payment.amount)).join(Booking), start_date, end_date).filter(Payment.status == "paid")
    current_gross = current_gross_q.scalar() or Decimal("0.00")

    prev_gross_q = apply_filters(db.query(func.sum(Payment.amount)).join(Booking), prev_start_date, prev_end_date).filter(Payment.status == "paid")
    prev_gross = prev_gross_q.scalar() or Decimal("0.00")

    # 5. Expenses (30% completed bookings commissions)
    current_completed_q = apply_filters(db.query(func.sum(Service.price)).join(Booking, Booking.service_id == Service.id), start_date, end_date).filter(Booking.status == "completed")
    current_completed_sum = current_completed_q.scalar() or Decimal("0.00")
    current_commissions = current_completed_sum * Decimal("0.30")
    current_expenses = current_commissions

    prev_completed_q = apply_filters(db.query(func.sum(Service.price)).join(Booking, Booking.service_id == Service.id), prev_start_date, prev_end_date).filter(Booking.status == "completed")
    prev_completed_sum = prev_completed_q.scalar() or Decimal("0.00")
    prev_commissions = prev_completed_sum * Decimal("0.30")
    prev_expenses = prev_commissions

    # 6. Net Profit (Gross - Expenses)
    current_net = current_gross - current_expenses
    prev_net = prev_gross - prev_expenses

    # 7. New Customers (Unique customers whose first booking of the business falls in range)
    customer_id_expr = func.coalesce(
        func.cast(Booking.user_id, String),
        Booking.customer_email,
        Booking.customer_phone
    )
    first_bookings_sub = (
        db.query(
            customer_id_expr.label("customer_id"),
            func.min(Booking.booking_date).label("first_date")
        )
        .filter(Booking.business_id == business_id)
        .filter(customer_id_expr.isnot(None))
    )
    if branch_id:
        first_bookings_sub = first_bookings_sub.filter(Booking.branch_id == branch_id)
    first_bookings_sub = first_bookings_sub.group_by(customer_id_expr).subquery()

    current_new_cust = db.query(func.count(first_bookings_sub.c.customer_id)).filter(
        first_bookings_sub.c.first_date >= start_date,
        first_bookings_sub.c.first_date <= end_date
    ).scalar() or 0

    prev_new_cust = db.query(func.count(first_bookings_sub.c.customer_id)).filter(
        first_bookings_sub.c.first_date >= prev_start_date,
        first_bookings_sub.c.first_date <= prev_end_date
    ).scalar() or 0

    # Delta helper
    def get_delta(curr, prev):
        if not prev:
            return 100 if curr > 0 else 0
        return int(((curr - prev) / abs(prev)) * 100)

    # 8. Payment methods breakdown (current period)
    pay_breakdown_q = apply_filters(
        db.query(Payment.payment_method, func.sum(Payment.amount)),
        start_date,
        end_date
    ).filter(Payment.status == "paid").group_by(Payment.payment_method).all()

    pay_methods = {"cash": 0.0, "credit_card": 0.0, "transfer": 0.0, "online": 0.0}
    for m, val in pay_breakdown_q:
        if m in pay_methods:
            pay_methods[m] = float(val or 0)
        else:
            pay_methods["online"] += float(val or 0) # Fallback to online for any custom methods

    # 9. Staff commissions breakdown
    staff_breakdown_q = apply_filters(
        db.query(
            Staff.id,
            Staff.name,
            func.count(Booking.id).label("citas_count"),
            func.sum(Service.price).label("ingresos_generados")
        )
        .join(Booking, Booking.staff_id == Staff.id)
        .join(Service, Booking.service_id == Service.id),
        start_date,
        end_date
    ).filter(Booking.status == "completed").group_by(Staff.id, Staff.name).all()

    staff_commissions = []
    for s_id, s_name, count, total_income in staff_breakdown_q:
        inc = float(total_income or 0)
        staff_commissions.append(
            StaffCommissionItem(
                staff_id=str(s_id),
                staff_name=s_name,
                bookings_count=count,
                income=inc,
                commission=round(inc * 0.30, 2),
                status="pending"
            )
        )

    # 10. Most profitable services
    services_breakdown_q = apply_filters(
        db.query(
            Service.name,
            func.count(Booking.id).label("citas_count"),
            func.sum(Service.price).label("total_income")
        )
        .join(Booking, Booking.service_id == Service.id),
        start_date,
        end_date
    ).filter(Booking.status == "completed").group_by(Service.id, Service.name).order_by(
        func.sum(Service.price).desc()
    ).limit(5).all()

    profitable_services = []
    for name, count, total_income in services_breakdown_q:
        profitable_services.append(
            ProfitableServiceItem(
                name=name,
                bookings_count=count,
                income=float(total_income or 0)
            )
        )

    return BalanceResponse(
        period=period,
        start_date=start_date.isoformat(),
        end_date=end_date.isoformat(),
        gross_income=KPIItem(value=float(current_gross), delta=get_delta(current_gross, prev_gross)),
        expenses=KPIItem(value=float(current_expenses), delta=get_delta(current_expenses, prev_expenses)),
        expenses_breakdown=ExpensesBreakdown(
            commissions=float(current_commissions),
            fixed_costs=0.0,
            variable_costs=0.0
        ),
        net_profit=KPIItem(value=float(current_net), delta=get_delta(current_net, prev_net)),
        new_customers=KPIItem(value=float(current_new_cust), delta=get_delta(current_new_cust, prev_new_cust)),
        payment_methods=PaymentMethodBreakdown(**pay_methods),
        staff_commissions=staff_commissions,
        profitable_services=profitable_services
    )
