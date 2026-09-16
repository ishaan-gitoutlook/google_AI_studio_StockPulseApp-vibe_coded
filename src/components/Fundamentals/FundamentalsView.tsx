import React, { useState, useMemo } from 'react';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  Target,
  AlertTriangle,
  Sparkles,
  Bot,
  Building2,
  Users,
  Globe,
  Award,
  DollarSign,
  PieChart,
  Percent,
} from 'lucide-react';
import { StockFundamentals, StockQuote, ThemeConfig } from '../../types';
import { getOrCreateStockFundamentals } from '../../utils/marketEngine';

interface FundamentalsViewProps {
  stocks: StockQuote[];
  initialSymbol?: string;
  currentTheme: ThemeConfig;
  onAskCopilot: (prompt: string) => void;
}

export const FundamentalsView: React.FC<FundamentalsViewProps> = ({
  stocks,
  initialSymbol = 'NVDA',
  currentTheme,
  onAskCopilot,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);

  const activeQuote = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  }, [stocks, selectedSymbol]);

  const fundamentals: StockFundamentals = useMemo(() => {
    if (!activeQuote) {
      return getOrCreateStockFundamentals({
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        exchange: 'NASDAQ',
        currency: 'USD',
        price: 132.85,
        change: 4.65,
        changePercent: 3.63,
        open: 128.9,
        high: 134.1,
        low: 128.4,
        previousClose: 128.2,
        volume: 48920100,
        avgVolume: 51200000,
        marketCap: 3265000000000,
        marketCapFormatted: '$3.27 T',
        peRatio: 52.4,
        eps: 2.54,
        dividendYield: 0.03,
        week52High: 140.76,
        week52Low: 45.11,
        sparkline: [126, 127.5, 127, 129, 131, 130.5, 133, 132.85],
        sector: 'Technology',
        industry: 'Semiconductors',
        lastUpdated: 'Live',
      });
    }
    return getOrCreateStockFundamentals(activeQuote);
  }, [activeQuote]);

  const stabilityColor =
    fundamentals.stabilityScore.total >= 90
      ? currentTheme.gainColor
      : fundamentals.stabilityScore.total >= 75
      ? currentTheme.accent
      : '#f59e0b';

  return (
    <div id="fundamentals-view" className="space-y-6">
      {/* 1. Stock Selector & Quick Switcher */}
      <div
        className="rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: currentTheme.textPrimary }}>
              Fundamentals Research & Financial Health Lab
            </h2>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              Institutional financial metrics, balance sheet scores, and consensus targets
            </p>
          </div>
        </div>

        {/* Stock Selector Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: currentTheme.textSecondary }}>Focus Stock:</span>
          <select
            id="fundamentals-stock-select"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border outline-none cursor-pointer"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.accent,
              color: currentTheme.textPrimary,
            }}
          >
            {stocks.map((s) => (
              <option key={s.symbol} value={s.symbol} className="bg-slate-900 text-white">
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>

          {/* Quick chip buttons for top 4 */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            {stocks.slice(0, 4).map((s) => (
              <button
                key={s.symbol}
                onClick={() => setSelectedSymbol(s.symbol)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                  selectedSymbol === s.symbol ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSymbol === s.symbol ? currentTheme.accent : 'transparent',
                  color: selectedSymbol === s.symbol ? '#ffffff' : currentTheme.textPrimary,
                  border: `1px solid ${selectedSymbol === s.symbol ? currentTheme.accent : currentTheme.cardBorder}`,
                }}
              >
                {s.symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Profile Header Card */}
      <div
        className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-white/10" style={{ color: currentTheme.accent }}>
                {fundamentals.symbol}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {fundamentals.stabilityScore.rating}
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed pt-1" style={{ color: currentTheme.textSecondary }}>
              {fundamentals.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => onAskCopilot(`Conduct a rigorous valuation multiples and solvency risk assessment for ${fundamentals.name} (${fundamentals.symbol})`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform hover:scale-102"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Copilot</span>
            </button>

            <div className="flex items-center gap-3 text-xs font-mono" style={{ color: currentTheme.textMuted }}>
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>CEO: {fundamentals.ceo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{fundamentals.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Valuation & Financial Stability Double Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Valuation Multiples Matrix */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.textPrimary }}>
                Valuation Multiples & Capital Structure
              </h3>
            </div>
            <span className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>TTM Standard</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Trailing P/E Ratio</div>
              <div className="text-lg font-black font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.valuation.peRatio ? `${fundamentals.valuation.peRatio.toFixed(1)}x` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>Sector avg: 28.4x</div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Forward P/E Ratio</div>
              <div className="text-lg font-black font-mono mt-1 text-sky-400">
                {fundamentals.valuation.forwardPe ? `${fundamentals.valuation.forwardPe.toFixed(1)}x` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>Next FY Estimate</div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>PEG Ratio</div>
              <div className="text-lg font-black font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.valuation.pegRatio ? `${fundamentals.valuation.pegRatio.toFixed(2)}` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>Growth Adjusted</div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Price to Book (P/B)</div>
              <div className="text-lg font-black font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.valuation.priceToBook ? `${fundamentals.valuation.priceToBook.toFixed(1)}x` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>Book Equity Multiple</div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>EV / EBITDA</div>
              <div className="text-lg font-black font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.valuation.evToEbitda ? `${fundamentals.valuation.evToEbitda.toFixed(1)}x` : 'N/A'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>Operating Multiple</div>
            </div>

            <div className="p-3.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Market Capitalization</div>
              <div className="text-lg font-black font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
                {fundamentals.valuation.marketCapFormatted}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: currentTheme.textSecondary }}>EV: {fundamentals.valuation.enterpriseValueFormatted}</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Stability Score Gauge */}
        <div
          className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" style={{ color: currentTheme.gainColor }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.textPrimary }}>
                Financial Stability Score
              </h3>
            </div>
            <span className="text-xs font-mono font-bold" style={{ color: stabilityColor }}>
              {fundamentals.stabilityScore.rating}
            </span>
          </div>

          {/* Central Circular Gauge Display */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={currentTheme.cardBorder}
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={stabilityColor}
                  strokeWidth="3.2"
                  strokeDasharray={`${fundamentals.stabilityScore.total}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black font-mono tracking-tight" style={{ color: currentTheme.textPrimary }}>
                  {fundamentals.stabilityScore.total}
                </span>
                <span className="text-[10px] uppercase font-bold" style={{ color: currentTheme.textMuted }}>/ 100</span>
              </div>
            </div>
          </div>

          {/* Sub-Metric Bars */}
          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span style={{ color: currentTheme.textMuted }}>Profitability</span>
                <span style={{ color: currentTheme.textPrimary }}>{fundamentals.stabilityScore.profitability}/25</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(fundamentals.stabilityScore.profitability / 25) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span style={{ color: currentTheme.textMuted }}>Balance Sheet Solvency</span>
                <span style={{ color: currentTheme.textPrimary }}>{fundamentals.stabilityScore.balanceSheet}/25</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(fundamentals.stabilityScore.balanceSheet / 25) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span style={{ color: currentTheme.textMuted }}>Growth Velocity</span>
                <span style={{ color: currentTheme.textPrimary }}>{fundamentals.stabilityScore.growth}/25</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(fundamentals.stabilityScore.growth / 25) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financial Performance Breakdown & Analyst Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyst Consensus & Price Targets */}
        <div
          className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.textPrimary }}>
                Wall Street Analyst Targets & Consensus
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 font-mono">
              {fundamentals.analysts.consensus} ({fundamentals.analysts.analystCount} Analysts)
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs" style={{ color: currentTheme.textMuted }}>Mean Price Target</div>
                <div className="text-2xl font-black font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
                  ${fundamentals.analysts.targetMean.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: currentTheme.textMuted }}>Implied Headroom</div>
                <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                  +{fundamentals.analysts.upsidePercent.toFixed(1)}% Upside
                </div>
              </div>
            </div>

            {/* Target Range Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono" style={{ color: currentTheme.textMuted }}>
                <span>Low: ${fundamentals.analysts.targetLow.toFixed(0)}</span>
                <span className="font-bold text-white">Mean: ${fundamentals.analysts.targetMean.toFixed(0)}</span>
                <span>High: ${fundamentals.analysts.targetHigh.toFixed(0)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 p-0.5 relative flex items-center">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-sky-400"
                  style={{ width: `${Math.min(100, Math.max(20, ((fundamentals.analysts.targetMean - fundamentals.analysts.targetLow) / (fundamentals.analysts.targetHigh - fundamentals.analysts.targetLow || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating & Solvency Metrics */}
        <div
          className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4" style={{ color: currentTheme.accent }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.textPrimary }}>
                Margins & Return On Capital
              </h3>
            </div>
            <span className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>Annualized</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Gross Margin</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {fundamentals.financials.grossMargin.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Operating Margin</div>
              <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                {fundamentals.financials.operatingMargin.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Return on Equity (ROE)</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {fundamentals.financials.roe.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Revenue YoY Growth</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                +{fundamentals.financials.revenueGrowthYoy.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Debt / Equity</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {fundamentals.financials.debtToEquity.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Free Cash Flow</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {fundamentals.financials.freeCashFlowFormatted}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Catalysts & Risk Factors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl border p-5 shadow-sm space-y-3"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Primary Bullish Catalysts
            </h4>
          </div>
          <ul className="space-y-2 text-xs" style={{ color: currentTheme.textSecondary }}>
            {fundamentals.catalysts.map((cat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold font-mono">▸</span>
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm space-y-3"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Key Downside Risks & Challenges
            </h4>
          </div>
          <ul className="space-y-2 text-xs" style={{ color: currentTheme.textSecondary }}>
            {fundamentals.keyRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold font-mono">▸</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
