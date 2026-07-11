import uuid
from datetime import date, time, datetime
from typing import Literal

from pydantic import BaseModel


class BookingCreate(BaseModel):
    business_id: uuid.UUID
    branch_id: uuid.UUID
    service_id: uuid.UUID
    staff_id: uuid.UUID
    booking_date: date
    start_time: time
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    customer_whatsapp: str | None = None
    notes: str | None = None


class BookingPaymentRead(BaseModel):
    id: uuid.UUID
    amount: float
    status: str
    payment_method: str

    model_config = {"from_attributes": True}


class BookingRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    business_id: uuid.UUID
    branch_id: uuid.UUID
    service_id: uuid.UUID
    staff_id: uuid.UUID
    booking_date: date
    start_time: time
    end_time: time
    status: str
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    customer_whatsapp: str | None = None
    notes: str | None = None
    service_name: str | None = None
    staff_name: str | None = None
    branch_name: str | None = None

    created_at: datetime
    confirmed_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None
    paid_at: datetime | None = None
    
    payment: BookingPaymentRead | None = None

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "cancelled", "completed"]


class BookingPayInput(BaseModel):
    payment_method: Literal["cash", "credit_card", "transfer"]


class BookingAlert(BaseModel):
    id: uuid.UUID
    type: Literal["pending_confirmation", "past_uncompleted"]
    message: str
    booking: BookingRead

    model_config = {"from_attributes": True}


class BookingReschedule(BaseModel):
    booking_date: date
    start_time: time
    staff_id: uuid.UUID | None = None



