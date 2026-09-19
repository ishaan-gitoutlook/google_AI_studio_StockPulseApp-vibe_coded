export type ThemeId =
  | 'midnight-navy'
  | 'clean-light'
  | 'obsidian-noir'
  | 'emerald-wealth'
  | 'arctic-frost'
  | 'crimson-sunset'
  | 'solarized-dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light' | 'special';
  description: string;
  accent: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gainColor: string;
  lossColor: string;
  tag: string;
}

export type MarketUniverseId =
  | 'global-megacaps'
  | 'sp500'
  | 'nasdaq100'
  | 'nifty500'
  | 'bse-sensex30'
  | 'ftse100'
  | 'dax40'
  | 'custom';

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in USD or local currency
  marketCapFormatted: string;
  peRatio: number;
  eps: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  sparkline: number[];
  sector: string;
  industry: string;
  lastUpdated: string;
  isCustom?: boolean;
}

export interface StockFundamentals {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  country: string;
  employees: number;
  ceo: string;
  valuation: {
    peRatio: number;
    forwardPe: number;
    pegRatio: number;
    priceToBook: number;
    evToEbitda: number;
    marketCapFormatted: string;
    enterpriseValueFormatted: string;
  };
  financials: {
    revenueFormatted: string;
    revenueGrowthYoy: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
    debtToEquity: number;
    currentRatio: number;
    freeCashFlowFormatted: string;
  };
  stabilityScore: {
    total: number; // 0 - 100
    profitability: number; // 0-25
    balanceSheet: number; // 0-25
    growth: number; // 0-25
    momentum: number; // 0-25
    rating: 'Prime Investment Grade' | 'Strong' | 'Moderate' | 'Speculative';
  };
  analysts: {
    consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Underperform' | 'Sell';
    targetMean: number;
    targetHigh: number;
    targetLow: number;
    analystCount: number;
    upsidePercent: number;
  };
  keyRisks: string[];
  catalysts: string[];
}

export interface MarketBreadth {
  total: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  advanceDeclineRatio: number;
  avgChangePercent: number;
  totalVolume: number;
  topGainer: StockQuote;
  topLoser: StockQuote;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  contextSymbols?: string[];
  groundingSources?: GroundingSource[];
  metrics?: {
    latencyMs?: number;
    tokens?: number;
  };
  guardrailPassed?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  watchlist: string[];
  favoriteUniverse?: string;
  customPriceAlerts?: Array<{
    id: string;
    symbol: string;
    targetPrice: number;
    condition: 'above' | 'below';
    createdAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockResearchNote {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  noteText: string;
  rating?: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  targetPrice?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QAScenario {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  category: 'E2E' | 'AI_AGENT' | 'UNIT';
  steps: string[];
  expected: string;
  status: 'IDLE' | 'RUNNING' | 'PASS' | 'FAIL';
  duration?: string;
  rationale?: string;
  screenshotUrl?: string;
  ariaSnapshot?: string;
  thoughtLog?: Array<{
    step: number;
    thought: string;
    action: string;
    observation: string;
    timestamp: string;
  }>;
}

export interface UnitTestResult {
  id: string;
  module: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  durationMs: number;
  assertion: string;
  details?: string;
}

export interface PlaywrightTestSpec {
  file: string;
  title: string;
  testsCount: number;
  description: string;
  tests: Array<{
    name: string;
    status: 'PASS' | 'FAIL' | 'PENDING';
    durationMs: number;
    codeSnippet: string;
  }>;
}

export type TrackerWidgetId = 'breadth_radar' | 'd3_distribution' | 'sector_treemap' | 'detail_chart' | 'quotes_matrix';

export interface TrackerWidgetConfig {
  id: TrackerWidgetId;
  title: string;
  description: string;
  colSpan: 'full' | 'half' | 'two-thirds' | 'one-third';
  minHeight?: string;
  isCollapsed?: boolean;
}

