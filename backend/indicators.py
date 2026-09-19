"""
Backward-compatibility shim for backend.indicators.
Re-exports canonical services from backend.services.indicators_service.
"""

from backend.services.indicators_service import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    get_technical_summary,
)

__all__ = [
    "calculate_sma",
    "calculate_ema",
    "calculate_rsi",
    "calculate_macd",
    "calculate_bollinger_bands",
    "get_technical_summary",
]
