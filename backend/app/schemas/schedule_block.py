import uuid
from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, model_validator


class ScheduleBlockCreate(BaseModel):
    branch_id: uuid.UUID
    staff_id: Optional[uuid.UUID] = None
    start_date: date
    end_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates_and_times(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")

        if (self.start_time is not None and self.end_time is None) or (
            self.start_time is None and self.end_time is not None
        ):
            raise ValueError("Both start_time and end_time must be provided for time-range blocks")

        if self.start_time is not None and self.end_time is not None:
            if self.start_date == self.end_date and self.end_time <= self.start_time:
                raise ValueError("end_time must be strictly after start_time on the same day")

        return self


class ScheduleBlockRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    branch_id: uuid.UUID
    staff_id: Optional[uuid.UUID] = None
    start_date: date
    end_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    reason: Optional[str] = None
    created_at: datetime

    staff_name: Optional[str] = None
    branch_name: Optional[str] = None

    model_config = {"from_attributes": True}
