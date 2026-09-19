"""
StockPulse Core Configuration Module
Provides typed environment settings and application constants.
"""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


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

    # AI Copilot Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_GEMINI_MODEL: str = "gemini-2.5-flash"
    FALLBACK_GEMINI_MODEL: str = "gemini-2.0-flash"

    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]

    # Quantitative defaults
    DEFAULT_UNIVERSE: str = "global-megacaps"
    MONTE_CARLO_DEFAULT_SIMULATIONS: int = 1000
    MONTE_CARLO_DEFAULT_DAYS: int = 30


settings = Settings()
