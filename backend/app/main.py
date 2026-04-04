import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.history import router as history_router
from app.core.config import get_settings
from app.db.session import create_engine_and_session_factory, init_database
from app.repositories.history import (
    DatabaseHistoryRepository,
    InMemoryHistoryRepository,
)

settings = get_settings()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_engine = None
    app.state.history_repository = InMemoryHistoryRepository()

    if settings.database_url:
        engine = None

        try:
            engine, session_factory = create_engine_and_session_factory(
                settings.database_url,
            )
            await init_database(engine)
        except Exception:
            logger.exception(
                "Database startup failed, backend will continue in in-memory mode.",
            )
            if engine is not None:
                await engine.dispose()
        else:
            app.state.db_engine = engine
            app.state.history_repository = DatabaseHistoryRepository(
                session_factory,
            )

    yield

    if app.state.db_engine is not None:
        await app.state.db_engine.dispose()


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(history_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "storage_mode": app.state.history_repository.storage_mode,
    }
