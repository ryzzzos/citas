import uuid
from datetime import date, time, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ScheduleBlock(Base):
    """
    Represents an unavailable time block (time-off, holiday, break, closure).
    If staff_id is None, it applies to the entire branch.
    If start_time and end_time are None, it applies to the entire day(s) from start_date to end_date.
    """

    __tablename__ = "schedule_blocks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    staff_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=True, index=True
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    business = relationship("Business", back_populates="schedule_blocks")
    branch = relationship("Branch", back_populates="schedule_blocks")
    staff = relationship("Staff", back_populates="schedule_blocks")

    @property
    def staff_name(self) -> str | None:
        return self.staff.name if self.staff else None

    @property
    def branch_name(self) -> str | None:
        return self.branch.name if self.branch else None
