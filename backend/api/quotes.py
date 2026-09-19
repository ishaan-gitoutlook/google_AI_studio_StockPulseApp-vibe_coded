"""
Quotes Router
Provides real-time financial quotes, price deltas, and breadth metrics.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Query
from backend.schemas.market import StockQuote
from backend.data import INITIAL_STOCKS
from backend.services.market_service import calculate_breadth

router = APIRouter(prefix="/api/v1", tags=["Quotes"])


@router.get("/quotes")
def get_quotes(
    universe: str = Query(default="global-megacaps"),
    symbols: Optional[str] = Query(default=None),
):
    quotes = INITIAL_STOCKS.get(universe, INITIAL_STOCKS["global-megacaps"])

    if symbols:
        req_syms = [s.strip().upper() for s in symbols.split(",") if s.strip()]
        all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
        found_quotes = []
        for sym in req_syms:
            found = next((q for q in all_quotes if q.symbol.upper() == sym), None)
            if found:
                found_quotes.append(found)
            else:
                found_quotes.append(
                    StockQuote(
                        symbol=sym,
                        name=f"{sym} Corporation",
                        exchange="NASDAQ",
                        currency="USD",
                        price=150.0,
                        change=2.5,
                        changePercent=1.69,
                        open=148.0,
                        high=152.0,
                        low=147.5,
                        previousClose=147.5,
                        volume=12000000,
                        avgVolume=14000000,
                        marketCap=180000000000,
                        marketCapFormatted="$180.0 B",
                        peRatio=28.0,
                        eps=5.35,
                        dividendYield=0.8,
                        week52High=165.0,
                        week52Low=98.0,
                        sparkline=[145.0, 146.0, 148.0, 149.0, 148.5, 151.0, 150.0],
                        sector="Technology",
                        industry="Custom Asset",
                        lastUpdated="Live Python Quote",
                        isCustom=True,
                    )
                )
        quotes = found_quotes

    breadth = calculate_breadth(quotes)
    return {
        "status": "success",
        "universe": universe,
        "breadth": breadth,
        "quotes": quotes,
        "count": len(quotes),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
