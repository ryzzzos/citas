import uuid
from datetime import date, time
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

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: Literal["confirmed", "cancelled", "completed"]
