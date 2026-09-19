"""
StockPulse Market & Quotation Schemas (Pydantic v2)
Defines data models for stock quotes, market universes, and breadth metrics.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class StockQuote(BaseModel):
    model_config = ConfigDict(extra="ignore")

    symbol: str = Field(..., description="Ticker symbol (e.g. NVDA, AAPL)")
    name: str = Field(..., description="Company full name")
    exchange: str = Field(default="NASDAQ", description="Listing exchange")
    currency: str = Field(default="USD", description="Currency denomination")
    price: float = Field(..., description="Current market price")
    change: float = Field(..., description="Net price change from previous close")
    changePercent: float = Field(..., description="Percentage price change")
    open: float = Field(..., description="Session open price")
    high: float = Field(..., description="Session high price")
    low: float = Field(..., description="Session low price")
    previousClose: float = Field(..., description="Previous session closing price")
    volume: int = Field(..., description="Cumulative trading volume")
    avgVolume: int = Field(..., description="Average daily trading volume")
    marketCap: int = Field(..., description="Market capitalization in base units")
    marketCapFormatted: str = Field(..., description="Formatted market cap (e.g. $3.27 T)")
    peRatio: Optional[float] = Field(default=None, description="Trailing Price-to-Earnings")
    eps: Optional[float] = Field(default=None, description="Earnings Per Share")
    dividendYield: float = Field(default=0.0, description="Dividend yield %")
    week52High: float = Field(..., description="52-week price ceiling")
    week52Low: float = Field(..., description="52-week price floor")
    sparkline: List[float] = Field(default_factory=list, description="Intraday price points")
    sector: str = Field(..., description="Primary industry sector")
    industry: str = Field(..., description="Sub-industry classification")
    lastUpdated: str = Field(..., description="ISO or relative timestamp")
    isCustom: Optional[bool] = Field(default=False, description="Whether stock is custom added")


class MarketBreadth(BaseModel):
    model_config = ConfigDict(extra="ignore")

    total: int = Field(..., description="Total active stocks tracked")
    advancers: int = Field(..., description="Count of advancing stocks")
    decliners: int = Field(..., description="Count of declining stocks")
    unchanged: int = Field(..., description="Count of unchanged stocks")
    advanceDeclineRatio: float = Field(..., description="Advance/Decline ratio")
    avgChangePercent: float = Field(..., description="Average percent return")
    totalVolume: int = Field(..., description="Aggregate universe volume")
    topGainer: StockQuote = Field(..., description="Top outperforming stock")
    topLoser: StockQuote = Field(..., description="Top lagging stock")


class UniverseMeta(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    region: str
    currency: str
    constituentCount: int = 8
    flag: str = "🌐"
    description: str
    count: Optional[int] = None


class QuotesResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
    universe: str
    breadth: MarketBreadth
    quotes: List[StockQuote]
    count: int
    timestamp: str
