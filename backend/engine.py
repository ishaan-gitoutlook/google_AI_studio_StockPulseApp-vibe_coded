"""
Backward-compatibility shim for backend.engine.
Re-exports canonical services from backend.services.market_service.
"""

from backend.services.market_service import (
    calculate_breadth,
    simulate_tick,
    get_or_create_fundamentals,
)

__all__ = [
    "calculate_breadth",
    "simulate_tick",
    "get_or_create_fundamentals",
]
