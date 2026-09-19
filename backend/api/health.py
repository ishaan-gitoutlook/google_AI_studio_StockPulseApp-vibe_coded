"""
Health Check Router
Provides uptime, framework version, and active service capabilities.
"""

import time
from datetime import datetime, timezone
from fastapi import APIRouter
from backend.core.config import settings
from backend.schemas.response import HealthResponse

router = APIRouter(tags=["Health"])
START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
def health_check():
    uptime = int(time.time() - START_TIME)
    return HealthResponse(
        status="ok",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        framework="FastAPI + Uvicorn + Python 3.14",
        uptimeSeconds=uptime,
        timestamp=datetime.now(timezone.utc).isoformat(),
        capabilities={
            "marketData": "active",
            "fastapi": "v0.110+",
            "pydantic": "v2",
            "technicalIndicators": "active (RSI, MACD, Bollinger)",
            "monteCarloSimulation": "active (GBM 1,000 runs)",
            "geminiCopilot": bool(settings.GEMINI_API_KEY),
            "pytestSuite": "active",
        },
    )
