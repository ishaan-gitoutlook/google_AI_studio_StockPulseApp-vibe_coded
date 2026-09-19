"""
Backward-compatibility shim for backend.copilot.
Re-exports canonical services from backend.services.copilot_service.
"""

from backend.services.copilot_service import run_copilot_inference

__all__ = [
    "run_copilot_inference",
]
