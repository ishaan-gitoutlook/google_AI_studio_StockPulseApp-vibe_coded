from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class StockQuote(BaseModel):
    symbol: str
    name: str
    exchange: str
    currency: str = "USD"
    price: float
    change: float
    changePercent: float
    open: float
    high: float
    low: float
    previousClose: float
    volume: int
    avgVolume: int
    marketCap: int
    marketCapFormatted: str
    peRatio: Optional[float] = None
    eps: Optional[float] = None
    dividendYield: float = 0.0
    week52High: float
    week52Low: float
    sparkline: List[float] = Field(default_factory=list)
    sector: str
    industry: str
    lastUpdated: str
    isCustom: Optional[bool] = False


class MarketBreadth(BaseModel):
    total: int
    advancers: int
    decliners: int
    unchanged: int
    advanceDeclineRatio: float
    avgChangePercent: float
    totalVolume: int
    topGainer: StockQuote
    topLoser: StockQuote


class UniverseMeta(BaseModel):
    id: str
    name: str
    region: str
    currency: str
    constituentCount: int
    flag: str
    description: str


class ValuationMultiples(BaseModel):
    peRatio: Optional[float] = None
    forwardPe: Optional[float] = None
    pegRatio: Optional[float] = None
    priceToBook: Optional[float] = None
    evToEbitda: Optional[float] = None
    marketCapFormatted: str
    enterpriseValueFormatted: str


class Financials(BaseModel):
    revenueFormatted: str
    revenueGrowthYoy: float
    grossMargin: float
    operatingMargin: float
    netMargin: float
    roe: float
    roa: float
    debtToEquity: float
    currentRatio: float
    freeCashFlowFormatted: str


class StabilityScore(BaseModel):
    total: int
    profitability: int
    balanceSheet: int
    growth: int
    momentum: int
    rating: Literal["Prime", "Strong", "Moderate", "Weak", "Distressed"]


class AnalystTargets(BaseModel):
    consensus: Literal["Strong Buy", "Buy", "Hold", "Underperform", "Sell"]
    targetMean: float
    targetHigh: float
    targetLow: float
    analystCount: int
    upsidePercent: float


class StockFundamentals(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: str
    country: str
    employees: int
    ceo: str
    description: str
    valuation: ValuationMultiples
    financials: Financials
    stabilityScore: StabilityScore
    analysts: AnalystTargets
    keyRisks: List[str]
    catalysts: List[str]


class ChatRequest(BaseModel):
    message: str
    universe: Optional[str] = "global-megacaps"
    activeStock: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    status: str
    message: str
    modelUsed: str
    latencyMs: int
    guardrailPassed: bool


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    framework: str = "FastAPI"
    uptimeSeconds: int
    timestamp: str
    capabilities: Dict[str, Any]
