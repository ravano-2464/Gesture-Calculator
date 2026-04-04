from collections import deque
from datetime import datetime, timezone
from typing import Protocol
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models.history import CalculationHistory
from app.schemas.history import HistoryCreate, HistoryRead


class HistoryRepository(Protocol):
    storage_mode: str

    async def list_recent(self, limit: int = 10) -> list[HistoryRead]:
        ...

    async def create(self, payload: HistoryCreate) -> HistoryRead:
        ...


class InMemoryHistoryRepository:
    storage_mode = "memory"

    def __init__(self, max_items: int = 200) -> None:
        self._items: deque[HistoryRead] = deque(maxlen=max_items)

    async def list_recent(self, limit: int = 10) -> list[HistoryRead]:
        return list(reversed(self._items))[:limit]

    async def create(self, payload: HistoryCreate) -> HistoryRead:
        item = HistoryRead(
            id=uuid4(),
            created_at=datetime.now(timezone.utc),
            **payload.model_dump(),
        )
        self._items.append(item)
        return item


class DatabaseHistoryRepository:
    storage_mode = "database"

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
    ) -> None:
        self._session_factory = session_factory

    async def list_recent(self, limit: int = 10) -> list[HistoryRead]:
        async with self._session_factory() as session:
            result = await session.execute(
                select(CalculationHistory)
                .order_by(CalculationHistory.created_at.desc())
                .limit(limit)
            )
            rows = result.scalars().all()
            return [HistoryRead.model_validate(row) for row in rows]

    async def create(self, payload: HistoryCreate) -> HistoryRead:
        async with self._session_factory() as session:
            row = CalculationHistory(**payload.model_dump())
            session.add(row)
            await session.commit()
            await session.refresh(row)
            return HistoryRead.model_validate(row)

