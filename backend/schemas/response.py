"""
StockPulse API Response Schemas (Pydantic v2)
Defines standard response contracts for health checks, AI chat, and test reports.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok")
    app: str = Field(default="StockPulse")
    version: str = Field(default="1.3.0-enterprise")
    framework: str = Field(default="FastAPI + Uvicorn + Python 3.14")
    uptimeSeconds: int
    timestamp: str
    capabilities: Dict[str, Any] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    message: str = Field(default="")
    universe: str = Field(default="global-megacaps")
    activeStock: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    status: str = Field(default="success")
    message: str
    modelUsed: str
    latencyMs: int
    guardrailPassed: bool = True
    groundingSources: Optional[List[Dict[str, str]]] = None


class TestRunResponse(BaseModel):
    status: str
    framework: str = "pytest"
    exitCode: int
    totalTests: int
    passed: int
    failed: int
    durationMs: int
    rawOutput: Optional[str] = None
    timestamp: str
