"""
Backward-compatibility shim for backend.analytics.
Re-exports canonical services from backend.services.analytics_service.
"""

from backend.services.analytics_service import (
    run_monte_carlo_simulation,
    calculate_altman_z_score,
    calculate_dupont_analysis,
)

__all__ = [
    "run_monte_carlo_simulation",
    "calculate_altman_z_score",
    "calculate_dupont_analysis",
]
