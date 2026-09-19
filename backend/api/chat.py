"""
AI Copilot Chat Router
Handles quantitative inquiries using Gemini 2.5 Flash with search grounding and guardrails.
"""

from fastapi import APIRouter, HTTPException
from backend.schemas.response import ChatRequest, ChatResponse
from backend.data import INITIAL_STOCKS
from backend.services.market_service import calculate_breadth
from backend.services.copilot_service import run_copilot_inference

router = APIRouter(prefix="/api/v1", tags=["AI Copilot"])


@router.post("/chat", response_model=ChatResponse)
def copilot_chat(payload: ChatRequest):
    query = payload.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message is required.")

    current_stocks = INITIAL_STOCKS.get(payload.universe, INITIAL_STOCKS["global-megacaps"])
    breadth = calculate_breadth(current_stocks)

    result = run_copilot_inference(
        message=query,
        universe=payload.universe,
        breadth_info=breadth.model_dump(),
    )

    return ChatResponse(
        status="success",
        message=result["message"],
        modelUsed=result["modelUsed"],
        latencyMs=result["latencyMs"],
        guardrailPassed=result.get("guardrailPassed", True),
        groundingSources=result.get("groundingSources"),
    )
