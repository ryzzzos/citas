import uuid

from sqlalchemy import ForeignKey, Integer, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Schedule(Base):
    """Weekly recurring availability for a staff member of a business."""

    __tablename__ = "schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False
    )
    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False
    )
    # 0 = Monday, 6 = Sunday
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[object] = mapped_column(Time, nullable=False)
    end_time: Mapped[object] = mapped_column(Time, nullable=False)

    business = relationship("Business", back_populates="schedules")
    staff = relationship("Staff", back_populates="schedules")
