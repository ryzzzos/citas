import uuid
from datetime import time

from pydantic import BaseModel, field_validator, Field


from typing import List

class ScheduleInterval(BaseModel):
    start: time
    end: time

    @field_validator("start")
    @classmethod
    def start_within_limits(cls, v: time) -> time:
        limit_start = time(6, 0)
        limit_end = time(22, 0)
        if v < limit_start or v > limit_end:
            raise ValueError("Start time must be between 6:00 AM and 10:00 PM")
        return v

    @field_validator("end")
    @classmethod
    def end_after_start_and_within_limits(cls, v: time, info) -> time:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("Interval end must be after start")
        limit_end = time(22, 0)
        if v > limit_end:
            raise ValueError("End time must be at or before 10:00 PM")
        return v

class ScheduleCreate(BaseModel):
    branch_id: uuid.UUID
    staff_id: uuid.UUID
    day_of_week: int = Field(ge=0, le=6, description="0 = Monday, 6 = Sunday")
    intervals: List[ScheduleInterval] = Field(default_factory=list)

    @field_validator("day_of_week")
    @classmethod
    def valid_day(cls, v: int) -> int:
        if v not in range(7):
            raise ValueError("day_of_week must be 0 (Mon) to 6 (Sun)")
        return v
        
    @field_validator("intervals")
    @classmethod
    def validate_intervals_overlap(cls, v: List[ScheduleInterval]) -> List[ScheduleInterval]:
        # Sort intervals by start time
        sorted_intervals = sorted(v, key=lambda x: x.start)
        for i in range(len(sorted_intervals) - 1):
            if sorted_intervals[i].end > sorted_intervals[i + 1].start:
                raise ValueError("Intervals cannot overlap")
        return sorted_intervals

class UpdateStaffScheduleDay(BaseModel):
    day_of_week: int = Field(ge=0, le=6, description="0 = Monday, 6 = Sunday")
    intervals: List[ScheduleInterval] = Field(default_factory=list)

    @field_validator("day_of_week")
    @classmethod
    def valid_day(cls, v: int) -> int:
        if v not in range(7):
            raise ValueError("day_of_week must be 0 (Mon) to 6 (Sun)")
        return v
        
    @field_validator("intervals")
    @classmethod
    def validate_intervals_overlap(cls, v: List[ScheduleInterval]) -> List[ScheduleInterval]:
        sorted_intervals = sorted(v, key=lambda x: x.start)
        for i in range(len(sorted_intervals) - 1):
            if sorted_intervals[i].end > sorted_intervals[i + 1].start:
                raise ValueError("Intervals cannot overlap")
        return sorted_intervals

class UpdateStaffSchedulesInput(BaseModel):
    schedules: List[UpdateStaffScheduleDay]


class ScheduleRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    branch_id: uuid.UUID
    staff_id: uuid.UUID
    day_of_week: int
    intervals: List[ScheduleInterval]

    model_config = {"from_attributes": True}
