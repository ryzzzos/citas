import uuid
from datetime import time

from pydantic import BaseModel, field_validator, Field


from typing import List

class ScheduleInterval(BaseModel):
    start: time
    end: time

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: time, info) -> time:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("Interval end must be after start")
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
