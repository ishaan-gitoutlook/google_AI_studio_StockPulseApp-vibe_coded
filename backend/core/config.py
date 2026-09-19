"""
StockPulse Core Configuration Module
Provides typed environment settings and application constants.
"""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


def _sanitize_api_key(key: str) -> str:
    """Strips quotes, whitespace, and detects placeholder strings."""
    if not key:
        return ""
    cleaned = key.strip().strip("\"'").strip()
    placeholders = {
        "my_gemini_api_key",
        "your_api_key",
        "your_gemini_api_key",
        "your_google_ai_studio_key_here",
        "placeholder",
        "none",
        "null",
        "<api_key>",
    }
    if cleaned.lower() in placeholders:
        return ""
    return cleaned


class Settings:
    PROJECT_NAME: str = "StockPulse"
    VERSION: str = "1.3.0-enterprise"
    DESCRIPTION: str = "Enterprise Quantitative Financial Intelligence & Autonomous QA Platform"
    
    # Server configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # API Prefix
    API_V1_STR: str = "/api/v1"

    # AI Copilot Keys (supports GEMINI_API_KEY, GOOGLE_API_KEY, and VITE_GEMINI_API_KEY)
    GEMINI_API_KEY: str = _sanitize_api_key(
        os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or ""
    )
    DEFAULT_GEMINI_MODEL: str = "gemini-2.5-flash"
    FALLBACK_GEMINI_MODEL: str = "gemini-2.0-flash"

    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]

    # Quantitative defaults
    DEFAULT_UNIVERSE: str = "global-megacaps"
    MONTE_CARLO_DEFAULT_SIMULATIONS: int = 1000
    MONTE_CARLO_DEFAULT_DAYS: int = 30


settings = Settings()
