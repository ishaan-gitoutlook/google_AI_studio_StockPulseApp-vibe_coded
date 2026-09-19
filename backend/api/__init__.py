"""
StockPulse Central API Router Registry
Aggregates all modular sub-routers into a unified FastAPI router.
"""

from fastapi import APIRouter
from backend.api.health import router as health_router
from backend.api.universes import router as universes_router
from backend.api.quotes import router as quotes_router
from backend.api.research import router as research_router
from backend.api.analytics import router as analytics_router
from backend.api.chat import router as chat_router
from backend.api.tests import router as tests_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(universes_router)
api_router.include_router(quotes_router)
api_router.include_router(research_router)
api_router.include_router(analytics_router)
api_router.include_router(chat_router)
api_router.include_router(tests_router)

__all__ = ["api_router"]
