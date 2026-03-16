import uuid
from datetime import date, time
from typing import Literal

from pydantic import BaseModel


class BookingCreate(BaseModel):
    business_id: uuid.UUID
    service_id: uuid.UUID
    staff_id: uuid.UUID
    booking_date: date
    start_time: time


class BookingRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    business_id: uuid.UUID
    service_id: uuid.UUID
    staff_id: uuid.UUID
    booking_date: date
    start_time: time
    end_time: time
    status: str

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: Literal["confirmed", "cancelled", "completed"]
