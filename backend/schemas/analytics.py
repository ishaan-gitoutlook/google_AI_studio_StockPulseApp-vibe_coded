"""
StockPulse Quantitative Analytics Schemas (Pydantic v2)
Defines models for technical indicators, Monte Carlo risk paths, and solvency ratios.
"""

from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


class ValuationMultiples(BaseModel):
    model_config = ConfigDict(extra="ignore")

    peRatio: Optional[float] = None
    forwardPe: Optional[float] = None
    pegRatio: Optional[float] = None
    priceToBook: Optional[float] = None
    priceToSales: Optional[float] = None
    evToEbitda: Optional[float] = None
    dividendYield: Optional[float] = None
    beta: Optional[float] = None
    marketCapFormatted: Optional[str] = ""
    enterpriseValueFormatted: Optional[str] = ""


class Financials(BaseModel):
    model_config = ConfigDict(extra="ignore")

    revenueFormatted: Optional[str] = ""
    revenueGrowthYoy: Optional[float] = 0.0
    grossMargin: Optional[float] = 0.0
    operatingMargin: float = 0.0
    netMargin: float = 0.0
    roe: Optional[float] = 0.0
    roa: Optional[float] = 0.0
    debtToEquity: float = 0.0
    currentRatio: float = 1.0
    freeCashFlowFormatted: Optional[str] = ""


class StabilityScore(BaseModel):
    model_config = ConfigDict(extra="ignore")

    total: int = 80
    profitability: int = 20
    balanceSheet: int = 20
    growth: int = 20
    momentum: int = 20
    rating: Optional[str] = "Prime"
    grade: Optional[str] = "A"
    assessment: Optional[str] = "Strong Solvency"


class AnalystTargets(BaseModel):
    model_config = ConfigDict(extra="ignore")

    consensus: Optional[str] = "Buy"
    targetMean: float = 100.0
    targetHigh: float = 120.0
    targetLow: float = 80.0
    analystCount: int = 25
    upsidePercent: Optional[float] = 15.0


class StockFundamentals(BaseModel):
    model_config = ConfigDict(extra="ignore")

    symbol: str
    name: str = ""
    companyName: Optional[str] = ""
    exchange: Optional[str] = "NASDAQ"
    sector: str = "Technology"
    industry: str = "General"
    country: Optional[str] = "United States"
    employees: Optional[int] = 10000
    ceo: Optional[str] = ""
    currentPrice: Optional[float] = None
    marketCap: Optional[int] = None
    week52High: Optional[float] = None
    week52Low: Optional[float] = None
    description: str = ""
    valuation: ValuationMultiples
    financials: Financials
    stabilityScore: StabilityScore
    analysts: AnalystTargets
    keyRisks: List[str] = Field(default_factory=list)
    catalysts: List[str] = Field(default_factory=list)


class VarMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")

    dollarAmount: float
    percentage: float


class MonteCarloResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
    symbol: str
    simulation: Dict[str, Any]
    timestamp: str


class IndicatorsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
    symbol: str
    indicators: Dict[str, Any]
    timestamp: str
