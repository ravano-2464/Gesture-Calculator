from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HistoryCreate(BaseModel):
    expression: str = Field(min_length=1, max_length=120)
    result: str = Field(min_length=1, max_length=120)
    tokens: list[str] = Field(default_factory=list, max_length=64)
    source_label: str | None = Field(default=None, max_length=100)
    source_type: str | None = Field(default=None, max_length=50)


class HistoryRead(HistoryCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class HistoryListResponse(BaseModel):
    items: list[HistoryRead]
    storage_mode: Literal["memory", "database"]

