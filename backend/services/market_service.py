"""
StockPulse Market Service
Encapsulates market breadth calculation, tick simulation, and dynamic fundamentals instantiation.
"""

import random
from typing import List
from backend.schemas.market import MarketBreadth, StockQuote
from backend.schemas.analytics import StockFundamentals, ValuationMultiples, Financials, StabilityScore, AnalystTargets
from backend.data import STOCK_FUNDAMENTALS


def calculate_breadth(stocks: List[StockQuote]) -> MarketBreadth:
    """Calculates real-time market breadth metrics across a universe of quotes."""
    if not stocks:
        fallback = StockQuote(
            symbol="N/A",
            name="N/A",
            exchange="",
            price=0.0,
            change=0.0,
            changePercent=0.0,
            open=0.0,
            high=0.0,
            low=0.0,
            previousClose=0.0,
            volume=0,
            avgVolume=0,
            marketCap=0,
            marketCapFormatted="0",
            week52High=0.0,
            week52Low=0.0,
            sector="",
            industry="",
            lastUpdated="",
        )
        return MarketBreadth(
            total=0,
            advancers=0,
            decliners=0,
            unchanged=0,
            advanceDeclineRatio=1.0,
            avgChangePercent=0.0,
            totalVolume=0,
            topGainer=fallback,
            topLoser=fallback,
        )

    advancers = 0
    decliners = 0
    unchanged = 0
    total_volume = 0
    total_change_pct = 0.0

    top_gainer = stocks[0]
    top_loser = stocks[0]

    for s in stocks:
        total_volume += s.volume
        total_change_pct += s.changePercent

        if s.changePercent > 0.05:
            advancers += 1
        elif s.changePercent < -0.05:
            decliners += 1
        else:
            unchanged += 1

        if s.changePercent > top_gainer.changePercent:
            top_gainer = s
        if s.changePercent < top_loser.changePercent:
            top_loser = s

    ad_ratio = float(round(advancers / decliners, 2)) if decliners > 0 else float(advancers)
    avg_change = float(round(total_change_pct / len(stocks), 2))

    return MarketBreadth(
        total=len(stocks),
        advancers=advancers,
        decliners=decliners,
        unchanged=unchanged,
        advanceDeclineRatio=ad_ratio,
        avgChangePercent=avg_change,
        totalVolume=total_volume,
        topGainer=top_gainer,
        topLoser=top_loser,
    )


def simulate_tick(stock: StockQuote) -> StockQuote:
    """Simulates realistic Brownian intraday price variation for a single stock."""
    variance = (random.random() - 0.48) * 0.008
    old_price = stock.price
    new_price = round(max(1.0, old_price * (1 + variance)), 2)
    total_change = round(new_price - stock.previousClose, 2)
    change_pct = round((total_change / (stock.previousClose or 1.0)) * 100, 2)

    new_high = max(stock.high, new_price)
    new_low = min(stock.low, new_price)
    new_vol = stock.volume + random.randint(500, 9000)
    spark = stock.sparkline[-14:] + [new_price]

    return stock.model_copy(
        update={
            "price": new_price,
            "change": total_change,
            "changePercent": change_pct,
            "high": new_high,
            "low": new_low,
            "volume": new_vol,
            "sparkline": spark,
            "lastUpdated": "Simulated Tick",
        }
    )


def get_or_create_fundamentals(stock: StockQuote) -> StockFundamentals:
    """Retrieves curated fundamentals or synthesizes quantitative models for dynamic assets."""
    sym = stock.symbol.upper()
    if sym in STOCK_FUNDAMENTALS:
        return STOCK_FUNDAMENTALS[sym]

    pe = stock.peRatio or 25.0
    fwd_pe = round(pe * 0.88, 2)
    peg = round(pe / 22.0, 2)
    pb = 4.5
    ps = 3.2
    ev_ebitda = 18.0

    return StockFundamentals(
        symbol=stock.symbol,
        name=stock.name,
        companyName=stock.name,
        exchange=stock.exchange,
        sector=stock.sector,
        industry=stock.industry,
        country="Global",
        employees=15000,
        ceo="Executive Leadership",
        currentPrice=stock.price,
        marketCap=stock.marketCap,
        week52High=stock.week52High,
        week52Low=stock.week52Low,
        valuation=ValuationMultiples(
            peRatio=pe,
            forwardPe=fwd_pe,
            pegRatio=peg,
            priceToBook=pb,
            priceToSales=ps,
            evToEbitda=ev_ebitda,
            dividendYield=stock.dividendYield or 0.5,
            beta=1.1,
            marketCapFormatted=stock.marketCapFormatted,
            enterpriseValueFormatted=stock.marketCapFormatted,
        ),
        financials=Financials(
            revenueFormatted="$45.0 B",
            revenueGrowthYoy=18.5,
            grossMargin=55.0,
            operatingMargin=28.5,
            netMargin=18.9,
            roe=22.4,
            roa=12.1,
            debtToEquity=0.45,
            currentRatio=1.85,
            freeCashFlowFormatted="$6.8 B",
        ),
        stabilityScore=StabilityScore(
            total=82,
            profitability=22,
            balanceSheet=21,
            growth=20,
            momentum=19,
            rating="Strong",
            grade="A-",
            assessment="Strong Investment Grade",
        ),
        analysts=AnalystTargets(
            consensus="Buy",
            targetMean=round(stock.price * 1.15, 2),
            targetHigh=round(stock.price * 1.35, 2),
            targetLow=round(stock.price * 0.95, 2),
            analystCount=32,
            upsidePercent=15.0,
        ),
        keyRisks=["Macroeconomic volatility", "Competitive pressure"],
        catalysts=["Operational expansion", "Product innovation"],
        description=f"{stock.name} is a prominent constituent in the {stock.sector} sector.",
    )
