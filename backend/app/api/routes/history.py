from fastapi import APIRouter, Query, Request, status

from app.schemas.history import HistoryCreate, HistoryListResponse, HistoryRead

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryListResponse)
async def list_history(
    request: Request,
    limit: int = Query(default=10, ge=1, le=50),
) -> HistoryListResponse:
    repository = request.app.state.history_repository
    items = await repository.list_recent(limit=limit)
    return HistoryListResponse(items=items, storage_mode=repository.storage_mode)


@router.post("", response_model=HistoryRead, status_code=status.HTTP_201_CREATED)
async def create_history(
    payload: HistoryCreate,
    request: Request,
) -> HistoryRead:
    repository = request.app.state.history_repository
    return await repository.create(payload)

