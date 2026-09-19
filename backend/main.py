"""
StockPulse Enterprise Python Application Bootstrap
Registers middleware, central API routers, and lifecycle events using modern lifespan.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.logging import logger
from backend.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"[*] {settings.PROJECT_NAME} Engine v{settings.VERSION} initialized.")
    logger.info(f"[*] Gemini AI Copilot active: {bool(settings.GEMINI_API_KEY)}")
    yield
    logger.info(f"[*] {settings.PROJECT_NAME} Engine shutting down.")


app = FastAPI(
    title=f"{settings.PROJECT_NAME} Financial & QA Engine",
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular API routers
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
