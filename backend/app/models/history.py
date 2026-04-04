from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CalculationHistory(Base):
    __tablename__ = "calculation_history"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    expression: Mapped[str] = mapped_column(String(120), nullable=False)
    result: Mapped[str] = mapped_column(String(120), nullable=False)
    tokens: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    source_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

