"""
Quantitative Analytics Router
Provides RSI/MACD/Bollinger technicals, Monte Carlo price path simulations, and solvency models.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Query
from backend.data import INITIAL_STOCKS
from backend.services.indicators_service import get_technical_summary
from backend.services.analytics_service import (
    run_monte_carlo_simulation,
    calculate_altman_z_score,
    calculate_dupont_analysis,
)

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/indicators")
def get_indicators(symbol: str = Query(default="NVDA")):
    """Returns RSI, MACD, Bollinger Bands, and Moving Averages computed in Python."""
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)
    sparkline = found.sparkline if found and found.sparkline else [140.0, 142.0, 141.5, 143.0, 145.0, 147.0, 146.5, 149.0, 150.0]

    indicators = get_technical_summary(sparkline)
    return {
        "status": "success",
        "symbol": sym_upper,
        "indicators": indicators,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/monte-carlo")
def get_monte_carlo(
    symbol: str = Query(default="NVDA"),
    days: int = Query(default=30, ge=5, le=365),
    simulations: int = Query(default=1000, ge=100, le=5000),
):
    """Executes 1,000+ iteration Geometric Brownian Motion Monte Carlo simulation with VaR."""
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)
    price = found.price if found else 150.0
    sparkline = found.sparkline if found and found.sparkline else None

    results = run_monte_carlo_simulation(
        current_price=price,
        sparkline=sparkline,
        days=days,
        num_simulations=simulations,
    )
    return {
        "status": "success",
        "symbol": sym_upper,
        "simulation": results,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/solvency")
def get_solvency(symbol: str = Query(default="NVDA")):
    """Computes Altman Z-Score and DuPont 3-Way ROE Decomposition."""
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)
    mcap = found.marketCap if found else 180000000000

    z_score = calculate_altman_z_score(
        working_capital=mcap * 0.15,
        total_assets=mcap * 0.40,
        retained_earnings=mcap * 0.20,
        ebit=mcap * 0.12,
        market_equity=mcap,
        total_liabilities=mcap * 0.25,
        sales=mcap * 0.30,
    )

    dupont = calculate_dupont_analysis(
        net_income=mcap * 0.08,
        revenue=mcap * 0.30,
        total_assets=mcap * 0.40,
        shareholder_equity=mcap * 0.25,
    )

    return {
        "status": "success",
        "symbol": sym_upper,
        "altmanZScore": z_score,
        "dupontAnalysis": dupont,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
