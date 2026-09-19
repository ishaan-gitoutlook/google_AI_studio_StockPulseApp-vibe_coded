/**
 * StockPulse Market Domain Service
 * Encapsulates all backend API calls for quotes, breadth, research, analytics, and copilot.
 */

import { apiClient } from './apiClient';
import { StockQuote, MarketBreadth, StockFundamentals } from '../types';

export interface UniverseMetaDTO {
  id: string;
  name: string;
  region: string;
  currency: string;
  description: string;
  constituentCount?: number;
  count?: number;
  flag?: string;
}

export interface QuotesResponseDTO {
  status: string;
  universe: string;
  breadth: MarketBreadth;
  quotes: StockQuote[];
  count: number;
  timestamp: string;
}

export interface ResearchResponseDTO {
  status: string;
  data: StockFundamentals;
  source?: string;
}

export interface ChatResponseDTO {
  status: string;
  message: string;
  modelUsed: string;
  latencyMs: number;
  guardrailPassed: boolean;
  groundingSources?: Array<{ title: string; uri: string }>;
}

export interface IndicatorsResponseDTO {
  status: string;
  symbol: string;
  indicators: {
    currentPrice: number;
    compositeScore: number;
    signal: string;
    rsi: { rsi: number; condition: string };
    macd: { macd: number; signal: number; histogram: number; trend: string };
    bollingerBands: { upper: number; middle: number; lower: number; bandwidthPct: number };
  };
  timestamp: string;
}

export interface MonteCarloResponseDTO {
  status: string;
  symbol: string;
  simulation: {
    currentPrice: number;
    expectedPrice: number;
    medianPrice: number;
    percentile5th: number;
    percentile95th: number;
    var95: { dollarAmount: number; percentage: number };
    var99: { dollarAmount: number; percentage: number };
    expectedShortfall: number;
    samplePaths: number[][];
  };
  timestamp: string;
}

export const marketService = {
  async getUniverses(): Promise<UniverseMetaDTO[]> {
    const res = await apiClient.get<{ status: string; universes: UniverseMetaDTO[] }>('/api/v1/universes');
    return res.universes;
  },

  async getQuotes(universe: string, symbols?: string[]): Promise<QuotesResponseDTO> {
    let url = `/api/v1/quotes?universe=${encodeURIComponent(universe)}`;
    if (symbols && symbols.length > 0) {
      url += `&symbols=${encodeURIComponent(symbols.join(','))}`;
    }
    return apiClient.get<QuotesResponseDTO>(url);
  },

  async getResearch(symbol: string): Promise<StockFundamentals> {
    const res = await apiClient.get<ResearchResponseDTO>(`/api/v1/research?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  },

  async sendChatMessage(message: string, universe: string, activeStock?: any): Promise<ChatResponseDTO> {
    return apiClient.post<ChatResponseDTO>('/api/v1/chat', {
      message,
      universe,
      activeStock,
    });
  },

  async getIndicators(symbol: string): Promise<IndicatorsResponseDTO> {
    return apiClient.get<IndicatorsResponseDTO>(`/api/v1/analytics/indicators?symbol=${encodeURIComponent(symbol)}`);
  },

  async getMonteCarlo(symbol: string, days: number = 30, simulations: number = 1000): Promise<MonteCarloResponseDTO> {
    return apiClient.get<MonteCarloResponseDTO>(
      `/api/v1/analytics/monte-carlo?symbol=${encodeURIComponent(symbol)}&days=${days}&simulations=${simulations}`
    );
  },
};
