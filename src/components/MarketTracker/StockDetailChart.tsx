import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Bot,
  Maximize2,
  Calendar,
  Volume2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { StockQuote, ThemeConfig } from '../../types';
import { formatCurrency, formatLargeNumber, generateHistoricalChartData } from '../../utils/marketEngine';

interface StockDetailChartProps {
  stock: StockQuote;
  currentTheme: ThemeConfig;
  onClose?: () => void;
  onNavigateToFundamentals: (symbol: string) => void;
  onAskCopilot: (prompt: string) => void;
}

export const StockDetailChart: React.FC<StockDetailChartProps> = ({
  stock,
  currentTheme,
  onClose,
  onNavigateToFundamentals,
  onAskCopilot,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | '5Y'>('1D');
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [showMA, setShowMA] = useState(true);
  const [hoverPoint, setHoverPoint] = useState<{
    time: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    x: number;
    y: number;
  } | null>(null);

  const chartData = useMemo(() => {
    return generateHistoricalChartData(stock.symbol, stock.price, timeframe);
  }, [stock.symbol, stock.price, timeframe]);

  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVol: 1000 };
    }
    const prices = chartData.map((d) => [d.low, d.high, d.close, d.open]).flat();
    const min = Math.min(...prices) * 0.995;
    const max = Math.max(...prices) * 1.005;
    const maxV = Math.max(...chartData.map((d) => d.volume));
    return { minPrice: min, maxPrice: max, maxVol: maxV };
  }, [chartData]);

  const svgWidth = 800;
  const svgHeight = 280;
  const volumeHeight = 60;
  const mainChartHeight = svgHeight - volumeHeight - 20;

  // Coordinate scales
  const getX = (index: number) => {
    return (index / (chartData.length - 1)) * (svgWidth - 60) + 40;
  };

  const getY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return mainChartHeight - ((price - minPrice) / range) * (mainChartHeight - 20);
  };

  const getVolY = (vol: number) => {
    const vHeight = (vol / (maxVol || 1)) * volumeHeight;
    return svgHeight - vHeight;
  };

  // Build SVG Path for Area Chart
  const pathD = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point.close);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData, minPrice, maxPrice]);

  const areaD = useMemo(() => {
    if (chartData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartData.length - 1);
    return `${pathD} L ${lastX} ${mainChartHeight} L ${firstX} ${mainChartHeight} Z`;
  }, [pathD, chartData]);

  // Build Moving Average Paths
  const ma20Path = useMemo(() => {
    if (!showMA) return '';
    const validPoints = chartData
      .map((d, i) => ({ val: d.ma20, i }))
      .filter((p) => p.val !== undefined) as Array<{ val: number; i: number }>;
    if (validPoints.length === 0) return '';
    return validPoints.reduce((acc, pt, idx) => {
      const x = getX(pt.i);
      const y = getY(pt.val);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData, showMA, minPrice, maxPrice]);

  const isGain = stock.change >= 0;
  const strokeColor = isGain ? currentTheme.gainColor : currentTheme.lossColor;

  return (
    <div
      id="stock-detail-chart-panel"
      className="rounded-2xl border p-4 sm:p-6 shadow-xl transition-all mb-6 animate-in fade-in"
      style={{
        backgroundColor: currentTheme.cardBg,
        borderColor: currentTheme.cardBorder,
      }}
    >
      {/* Header with Asset Info & Close Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: currentTheme.cardBorder }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border"
            style={{
              backgroundColor: `${currentTheme.accent}15`,
              borderColor: `${currentTheme.accent}30`,
              color: currentTheme.accent,
            }}
          >
            {stock.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                {stock.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10" style={{ color: currentTheme.textSecondary }}>
                {stock.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
                {stock.exchange}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: currentTheme.textMuted }}>
              {stock.sector} • {stock.industry} • Cur: {stock.currency}
            </p>
          </div>
        </div>

        {/* Current Price and Day Movement */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight" style={{ color: currentTheme.textPrimary }}>
              {formatCurrency(stock.price, stock.currency)}
            </div>
            <div
              className="flex items-center justify-end gap-1 text-xs font-bold font-mono"
              style={{ color: isGain ? currentTheme.gainColor : currentTheme.lossColor }}
            >
              {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isGain ? '+' : ''}{stock.change.toFixed(2)} ({isGain ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close chart panel"
            >
              <X className="w-5 h-5" style={{ color: currentTheme.textSecondary }} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-black/10" style={{ borderColor: currentTheme.cardBorder }}>
          {(['1D', '5D', '1M', '6M', '1Y', '5Y'] as const).map((tf) => (
            <button
              key={tf}
              id={`tf-btn-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
                timeframe === tf ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: timeframe === tf ? currentTheme.accent : 'transparent',
                color: timeframe === tf ? '#ffffff' : currentTheme.textPrimary,
              }}
            >
              {tf}
            </button>
          ))}
          <span id="active-timeframe-badge" className="sr-only">{timeframe}</span>
        </div>

        {/* Chart View Toggles */}
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: currentTheme.textSecondary }}>
          <button
            onClick={() => setChartType(chartType === 'area' ? 'candles' : 'area')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border hover:bg-white/5 transition-colors"
            style={{ borderColor: currentTheme.cardBorder }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mode: {chartType === 'area' ? 'Area Curve' : 'OHLC Candles'}</span>
          </button>

          <button
            onClick={() => setShowMA(!showMA)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
              showMA ? 'font-bold' : 'opacity-50'
            }`}
            style={{
              borderColor: currentTheme.cardBorder,
              backgroundColor: showMA ? `${currentTheme.accent}15` : 'transparent',
              color: showMA ? currentTheme.accent : currentTheme.textSecondary,
            }}
          >
            <span>MA (20/50)</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full overflow-hidden my-2 rounded-xl bg-black/20 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-72 cursor-crosshair select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            const index = Math.min(
              chartData.length - 1,
              Math.max(0, Math.round(((mouseX - 40) / (svgWidth - 60)) * (chartData.length - 1)))
            );
            const pt = chartData[index];
            if (pt) {
              setHoverPoint({
                ...pt,
                x: getX(index),
                y: getY(pt.close),
              });
            }
          }}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = mainChartHeight * ratio;
            const priceVal = maxPrice - (ratio * (maxPrice - minPrice));
            return (
              <g key={ratio}>
                <line
                  x1="40"
                  y1={y}
                  x2={svgWidth - 20}
                  y2={y}
                  stroke={currentTheme.cardBorder}
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
                <text
                  x="35"
                  y={y + 3}
                  textAnchor="end"
                  fill={currentTheme.textMuted}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume Histogram Sub-chart */}
          {chartData.map((d, i) => {
            const x = getX(i) - 2;
            const y = getVolY(d.volume);
            const height = svgHeight - y;
            const isCandleUp = d.close >= d.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={y}
                width={Math.max(2, (svgWidth - 60) / chartData.length - 2)}
                height={Math.max(2, height)}
                fill={isCandleUp ? `${currentTheme.gainColor}40` : `${currentTheme.lossColor}40`}
              />
            );
          })}

          {/* Area Chart Mode */}
          {chartType === 'area' && (
            <>
              <path d={areaD} fill={`url(#grad-${stock.symbol})`} />
              <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candles' &&
            chartData.map((d, i) => {
              const x = getX(i);
              const yOpen = getY(d.open);
              const yClose = getY(d.close);
              const yHigh = getY(d.high);
              const yLow = getY(d.low);
              const isUp = d.close >= d.open;
              const candleColor = isUp ? currentTheme.gainColor : currentTheme.lossColor;
              const bodyY = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="1" />
                  {/* Body */}
                  <rect
                    x={x - 3}
                    y={bodyY}
                    width="6"
                    height={bodyHeight}
                    fill={candleColor}
                    stroke={candleColor}
                    strokeWidth="0.5"
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Moving Average Line (MA20) */}
          {showMA && ma20Path && (
            <path d={ma20Path} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
          )}

          {/* Crosshair & Hover Tooltip on SVG */}
          {hoverPoint && (
            <g>
              {/* Vertical crosshair */}
              <line
                x1={hoverPoint.x}
                y1="10"
                x2={hoverPoint.x}
                y2={svgHeight}
                stroke="#ffffff"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              {/* Horizontal crosshair */}
              <line
                x1="40"
                y1={hoverPoint.y}
                x2={svgWidth - 20}
                y2={hoverPoint.y}
                stroke="#ffffff"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              {/* Glowing dot */}
              <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill={strokeColor} stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Data Bubble */}
        {hoverPoint && (
          <div
            className="absolute top-4 left-12 px-3 py-2 rounded-lg text-xs font-mono border shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in"
            style={{
              backgroundColor: `${currentTheme.cardBg}f0`,
              borderColor: currentTheme.accent,
              color: currentTheme.textPrimary,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold pb-1 border-b" style={{ borderColor: currentTheme.cardBorder }}>
              <span>Time: {hoverPoint.time}</span>
              <span className="text-sky-400">Vol: {formatLargeNumber(hoverPoint.volume)}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
              <div>Close: <strong className="text-white">{formatCurrency(hoverPoint.close, stock.currency)}</strong></div>
              <div>Open: <span style={{ color: currentTheme.textSecondary }}>{formatCurrency(hoverPoint.open, stock.currency)}</span></div>
              <div>High: <span className="text-emerald-400">{formatCurrency(hoverPoint.high, stock.currency)}</span></div>
              <div>Low: <span className="text-rose-400">{formatCurrency(hoverPoint.low, stock.currency)}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-3">
        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Day Range</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {stock.low.toFixed(2)} - {stock.high.toFixed(2)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>52W Range</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {stock.week52Low.toFixed(2)} - {stock.week52High.toFixed(2)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Volume</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {formatLargeNumber(stock.volume)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Market Cap</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {stock.marketCapFormatted}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>P/E Ratio</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : 'N/A'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}80`, borderColor: currentTheme.cardBorder }}>
          <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Div Yield</div>
          <div className="text-xs font-bold font-mono mt-0.5" style={{ color: currentTheme.textPrimary }}>
            {stock.dividendYield > 0 ? `${(stock.dividendYield * 100).toFixed(2)}%` : '0.00%'}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: currentTheme.cardBorder }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.textMuted }}>
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.gainColor }} />
          <span>Last sync: {stock.lastUpdated}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToFundamentals(stock.symbol)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:bg-white/10"
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.accent,
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fundamentals Deep Dive</span>
          </button>

          <button
            onClick={() => onAskCopilot(`Conduct a valuation and technical outlook analysis for ${stock.name} (${stock.symbol})`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
            style={{
              backgroundColor: currentTheme.accent,
            }}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Analyze with AI Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
