import random
from typing import List
from backend.models import MarketBreadth, StockQuote, StockFundamentals, ValuationMultiples, Financials, StabilityScore, AnalystTargets
from backend.data import STOCK_FUNDAMENTALS


def calculate_breadth(stocks: List[StockQuote]) -> MarketBreadth:
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
            "lastUpdated": "Live Python Tick",
        }
    )


def get_or_create_fundamentals(quote: StockQuote) -> StockFundamentals:
    if quote.symbol in STOCK_FUNDAMENTALS:
        return STOCK_FUNDAMENTALS[quote.symbol]

    pe = quote.peRatio if quote.peRatio and quote.peRatio > 0 else 28.5
    eps = quote.eps if quote.eps and quote.eps > 0 else round(quote.price / pe, 2)

    return StockFundamentals(
        symbol=quote.symbol,
        name=quote.name,
        sector=quote.sector or "Technology",
        industry=quote.industry or "Enterprise Equity",
        country="India" if ("NSE" in quote.exchange or "BSE" in quote.exchange) else "United States",
        employees=45000,
        ceo="Executive Leadership",
        description=f"{quote.name} ({quote.symbol}) is a premier corporation listed on {quote.exchange} with strong financial moats.",
        valuation=ValuationMultiples(
            peRatio=pe,
            forwardPe=round(pe * 0.85, 1),
            pegRatio=1.35,
            priceToBook=4.8,
            evToEbitda=18.2,
            marketCapFormatted=quote.marketCapFormatted or "$50.0 B",
            enterpriseValueFormatted=quote.marketCapFormatted or "$52.4 B",
        ),
        financials=Financials(
            revenueFormatted="$24.5 B",
            revenueGrowthYoy=14.8,
            grossMargin=52.4,
            operatingMargin=28.2,
            netMargin=21.5,
            roe=22.8,
            roa=12.4,
            debtToEquity=0.35,
            currentRatio=2.1,
            freeCashFlowFormatted="$6.4 B",
        ),
        stabilityScore=StabilityScore(
            total=86,
            profitability=22,
            balanceSheet=23,
            growth=21,
            momentum=20,
            rating="Strong",
        ),
        analysts=AnalystTargets(
            consensus="Buy",
            targetMean=round(quote.price * 1.14, 2),
            targetHigh=round(quote.price * 1.32, 2),
            targetLow=round(quote.price * 0.92, 2),
            analystCount=28,
            upsidePercent=14.0,
        ),
        keyRisks=[
            "Macroeconomic sensitivity and interest rate fluctuations",
            "Currency exchange variance across global operations",
        ],
        catalysts=[
            "Operating margin leverage through automated cloud operations",
            "Expanding addressable market share in high-growth segments",
        ],
    )
