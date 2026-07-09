import uuid
from datetime import datetime

from sqlalchemy import Date, Enum, ForeignKey, String, Text, Time, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False
    )
    branch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False
    )
    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False
    )
    booking_date: Mapped[object] = mapped_column(Date, nullable=False)
    start_time: Mapped[object] = mapped_column(Time, nullable=False)
    end_time: Mapped[object] = mapped_column(Time, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "confirmed", "cancelled", "completed", name="booking_status"),
        nullable=False,
        default="pending",
    )

    # Guest customer contact fields
    customer_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    customer_whatsapp: Mapped[str | None] = mapped_column(String(30), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Auditing timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="bookings")
    business = relationship("Business", back_populates="bookings")
    branch = relationship("Branch", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    staff = relationship("Staff", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

    @property
    def service_name(self) -> str | None:
        return self.service.name if self.service else None

    @property
    def staff_name(self) -> str | None:
        return self.staff.name if self.staff else None

    @property
    def branch_name(self) -> str | None:
        return self.branch.name if self.branch else None
