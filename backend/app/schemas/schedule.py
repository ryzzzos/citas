import uuid
from datetime import time

from pydantic import BaseModel, field_validator


class ScheduleCreate(BaseModel):
    staff_id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time

    @field_validator("day_of_week")
    @classmethod
    def valid_day(cls, v: int) -> int:
        if v not in range(7):
            raise ValueError("day_of_week must be 0 (Mon) to 6 (Sun)")
        return v

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v: time, info) -> time:
        start = info.data.get("start_time")
        if start and v <= start:
            raise ValueError("end_time must be after start_time")
        return v


class ScheduleRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    staff_id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time

    model_config = {"from_attributes": True}
