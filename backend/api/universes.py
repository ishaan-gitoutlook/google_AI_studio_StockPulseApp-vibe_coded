"""
Universes Router
Lists global market indices and universe metadata.
"""

from fastapi import APIRouter
from backend.data import UNIVERSES_META

router = APIRouter(prefix="/api/v1", tags=["Universes"])


@router.get("/universes")
def get_universes():
    return {
        "status": "success",
        "universes": list(UNIVERSES_META.values()),
        "count": len(UNIVERSES_META),
    }
