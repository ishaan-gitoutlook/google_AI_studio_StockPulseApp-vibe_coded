import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ArrowUpDown,
  BarChart2,
  Grid,
  List,
  Sparkles,
  Layers,
  Bot,
  Percent,
  DollarSign,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { MarketBreadth, MarketUniverseId, StockQuote, ThemeConfig } from '../../types';
import { StockDetailChart } from './StockDetailChart';
import { BreadthDistributionD3 } from './BreadthDistributionD3';
import { formatCurrency, formatLargeNumber } from '../../utils/marketEngine';

interface MarketTrackerProps {
  stocks: StockQuote[];
  breadth: MarketBreadth;
  activeUniverse: MarketUniverseId;
  currentTheme: ThemeConfig;
  selectedStock: StockQuote | null;
  setSelectedStock: (stock: StockQuote | null) => void;
  onAddCustomStock: (stock: Partial<StockQuote>) => void;
  onNavigateToFundamentals: (symbol: string) => void;
  onAskCopilot: (prompt: string) => void;
  flashingSymbols: Record<string, 'gain' | 'loss'>;
}

export const MarketTracker: React.FC<MarketTrackerProps> = ({
  stocks,
  breadth,
  activeUniverse,
  currentTheme,
  selectedStock,
  setSelectedStock,
  onAddCustomStock,
  onNavigateToFundamentals,
  onAskCopilot,
  flashingSymbols,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'changePercent' | 'price' | 'volume' | 'marketCap' | 'symbol'>('changePercent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New stock form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('150.00');
  const [newExchange, setNewExchange] = useState('NASDAQ');
  const [newSector, setNewSector] = useState('Technology');

  // Filter & sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    if (filterType === 'gainers') {
      result = result.filter((s) => s.changePercent > 0);
    } else if (filterType === 'losers') {
      result = result.filter((s) => s.changePercent < 0);
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [stocks, searchQuery, filterType, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSaveCustomStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    const baseP = parseFloat(newPrice) || 150.0;
    onAddCustomStock({
      symbol: newSymbol.toUpperCase().trim(),
      name: newName.trim() || `${newSymbol.toUpperCase().trim()} Corp`,
      price: baseP,
      exchange: newExchange,
      sector: newSector,
      change: 1.25,
      changePercent: 0.85,
      open: baseP * 0.99,
      high: baseP * 1.02,
      low: baseP * 0.985,
      previousClose: baseP * 0.992,
      volume: 1540000,
      avgVolume: 2000000,
      marketCap: baseP * 1000000000,
      marketCapFormatted: `$${((baseP * 1000000000) / 1e9).toFixed(1)} B`,
      peRatio: 24.5,
      eps: baseP / 24.5,
      dividendYield: 0.012,
      week52High: baseP * 1.25,
      week52Low: baseP * 0.75,
      sparkline: [baseP * 0.96, baseP * 0.98, baseP * 0.97, baseP * 0.99, baseP * 1.01, baseP],
      currency: newExchange.includes('NSE') || newExchange.includes('BSE') ? 'INR' : 'USD',
      isCustom: true,
      lastUpdated: 'User Added',
    });

    setIsAddModalOpen(false);
    setNewSymbol('');
    setNewName('');
  };

  const advancerPct = breadth.total > 0 ? (breadth.advancers / breadth.total) * 100 : 50;

  return (
    <div id="market-tracker-view" className="space-y-6">
      {/* 1. Market Breadth & Sentiment Radar Card */}
      <div
        id="breadth-meter-card"
        className="rounded-2xl border p-4 sm:p-6 shadow-sm transition-all"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
            >
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                Market Breadth & Momentum Radar
              </h2>
              <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                Real-time Advance/Decline ratio across {breadth.total} active universe constituents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs uppercase font-mono tracking-wider" style={{ color: currentTheme.textMuted }}>
                A/D Ratio
              </span>
              <div
                className="text-lg font-black font-mono"
                style={{
                  color: breadth.advanceDeclineRatio >= 1.0 ? currentTheme.gainColor : currentTheme.lossColor,
                }}
              >
                {breadth.advanceDeclineRatio} : 1.0
              </div>
            </div>
          </div>
        </div>

        {/* Visual Breadth Meter Bar */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-800/40 p-0.5 border" style={{ borderColor: currentTheme.cardBorder }}>
            <div
              className="h-full rounded-l-full transition-all duration-500 ease-out flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
              style={{
                width: `${advancerPct}%`,
                backgroundColor: currentTheme.gainColor,
              }}
              title={`Advancers: ${breadth.advancers} (${advancerPct.toFixed(0)}%)`}
            />
            <div
              className="h-full rounded-r-full transition-all duration-500 ease-out flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
              style={{
                width: `${100 - advancerPct}%`,
                backgroundColor: currentTheme.lossColor,
              }}
              title={`Decliners: ${breadth.decliners}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <div className="flex items-center gap-1.5" style={{ color: currentTheme.gainColor }}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-bold">Advancers: {breadth.advancers}</span>
              <span className="text-[11px] opacity-75">({advancerPct.toFixed(1)}%)</span>
            </div>

            <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>
              Unchanged: {breadth.unchanged}
            </div>

            <div className="flex items-center gap-1.5" style={{ color: currentTheme.lossColor }}>
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="font-bold">Decliners: {breadth.decliners}</span>
              <span className="text-[11px] opacity-75">({(100 - advancerPct).toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Aggregate Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t" style={{ borderColor: currentTheme.cardBorder }}>
          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}>
            <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Top Outperformer</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold font-mono" style={{ color: currentTheme.textPrimary }}>
                {breadth.topGainer.symbol}
              </span>
              <span className="text-xs font-bold font-mono" style={{ color: currentTheme.gainColor }}>
                +{breadth.topGainer.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}>
            <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Top Underperformer</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold font-mono" style={{ color: currentTheme.textPrimary }}>
                {breadth.topLoser.symbol}
              </span>
              <span className="text-xs font-bold font-mono" style={{ color: currentTheme.lossColor }}>
                {breadth.topLoser.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}>
            <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Aggregate Volume</div>
            <div className="text-xs font-bold font-mono mt-1" style={{ color: currentTheme.textPrimary }}>
              {formatLargeNumber(breadth.totalVolume)} shares
            </div>
          </div>

          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${currentTheme.bg}60`, borderColor: currentTheme.cardBorder }}>
            <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>Avg Movement</div>
            <div
              className="text-xs font-bold font-mono mt-1"
              style={{
                color: breadth.avgChangePercent >= 0 ? currentTheme.gainColor : currentTheme.lossColor,
              }}
            >
              {breadth.avgChangePercent >= 0 ? '+' : ''}{breadth.avgChangePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time D3.js Breadth Distribution Widget */}
      <BreadthDistributionD3
        stocks={stocks}
        breadth={breadth}
        currentTheme={currentTheme}
        onSelectStock={setSelectedStock}
        selectedSymbol={selectedStock?.symbol}
      />

      {/* 3. Selected Stock Interactive HD Chart */}
      {selectedStock && (
        <StockDetailChart
          stock={selectedStock}
          currentTheme={currentTheme}
          onClose={() => setSelectedStock(null)}
          onNavigateToFundamentals={onNavigateToFundamentals}
          onAskCopilot={onAskCopilot}
        />
      )}

      {/* 3. Toolbar: Search, Filters, Sort, View Modes, Add Custom Stock */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: currentTheme.textMuted }} />
          <input
            id="stock-search-input"
            type="text"
            placeholder="Search symbol, company name, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition-all shadow-xs"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips & View Mode */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.cardBg }}>
            <button
              id="filter-all-btn"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                filterType === 'all' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterType === 'all' ? currentTheme.accent : 'transparent',
                color: filterType === 'all' ? '#ffffff' : currentTheme.textPrimary,
              }}
            >
              All ({stocks.length})
            </button>

            <button
              id="filter-gainers-btn"
              onClick={() => setFilterType('gainers')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                filterType === 'gainers' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterType === 'gainers' ? `${currentTheme.gainColor}25` : 'transparent',
                color: filterType === 'gainers' ? currentTheme.gainColor : currentTheme.textPrimary,
              }}
            >
              Gainers ({breadth.advancers})
            </button>

            <button
              id="filter-losers-btn"
              onClick={() => setFilterType('losers')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                filterType === 'losers' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterType === 'losers' ? `${currentTheme.lossColor}25` : 'transparent',
                color: filterType === 'losers' ? currentTheme.lossColor : currentTheme.textPrimary,
              }}
            >
              Decliners ({breadth.decliners})
            </button>
          </div>

          {/* Table / Grid Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.cardBg }}>
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'opacity-100' : 'opacity-40'}`}
              style={{ backgroundColor: viewMode === 'table' ? `${currentTheme.accent}20` : 'transparent' }}
              title="Table View"
            >
              <List className="w-4 h-4" style={{ color: currentTheme.textPrimary }} />
            </button>
            <button
              id="view-cards-btn"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-all ${viewMode === 'cards' ? 'opacity-100' : 'opacity-40'}`}
              style={{ backgroundColor: viewMode === 'cards' ? `${currentTheme.accent}20` : 'transparent' }}
              title="Cards Grid View"
            >
              <Grid className="w-4 h-4" style={{ color: currentTheme.textPrimary }} />
            </button>
          </div>

          {/* Add Custom Stock Button */}
          <button
            id="add-custom-stock-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform hover:scale-102 active:scale-98"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* 4. Stock Table View */}
      {viewMode === 'table' && (
        <div
          id="stock-quotes-table-container"
          className="rounded-2xl border overflow-hidden shadow-sm transition-all"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: currentTheme.cardBorder, backgroundColor: `${currentTheme.bg}60` }}>
                  <th
                    className="p-3.5 font-bold cursor-pointer select-none"
                    style={{ color: currentTheme.textSecondary }}
                    onClick={() => handleSort('symbol')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Ticker & Asset</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 font-bold text-right cursor-pointer select-none"
                    style={{ color: currentTheme.textSecondary }}
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 font-bold text-right cursor-pointer select-none"
                    style={{ color: currentTheme.textSecondary }}
                    onClick={() => handleSort('changePercent')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>24h Change</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="p-3.5 font-bold text-center hidden md:table-cell" style={{ color: currentTheme.textSecondary }}>
                    Intraday Sparkline
                  </th>
                  <th
                    className="p-3.5 font-bold text-right hidden sm:table-cell cursor-pointer select-none"
                    style={{ color: currentTheme.textSecondary }}
                    onClick={() => handleSort('volume')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Volume</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 font-bold text-right hidden lg:table-cell cursor-pointer select-none"
                    style={{ color: currentTheme.textSecondary }}
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Market Cap</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="p-3.5 font-bold text-right hidden xl:table-cell" style={{ color: currentTheme.textSecondary }}>
                    P/E
                  </th>
                  <th className="p-3.5 font-bold text-center" style={{ color: currentTheme.textSecondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: currentTheme.cardBorder }}>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center" style={{ color: currentTheme.textMuted }}>
                      No stocks found matching "{searchQuery}". Click "+ Add Stock" to track custom assets.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isGain = stock.change >= 0;
                    const flash = flashingSymbols[stock.symbol];
                    const isSelected = selectedStock?.symbol === stock.symbol;

                    return (
                      <tr
                        key={stock.symbol}
                        id={`stock-row-${stock.symbol}`}
                        onClick={() => setSelectedStock(stock)}
                        className={`group cursor-pointer transition-all duration-300 ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        } ${
                          flash === 'gain'
                            ? 'bg-emerald-500/20'
                            : flash === 'loss'
                            ? 'bg-rose-500/20'
                            : ''
                        }`}
                      >
                        {/* Ticker & Name */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0"
                              style={{
                                backgroundColor: `${currentTheme.accent}10`,
                                borderColor: `${currentTheme.accent}30`,
                                color: currentTheme.accent,
                              }}
                            >
                              {stock.symbol.slice(0, 3)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold font-mono text-xs sm:text-sm" style={{ color: currentTheme.textPrimary }}>
                                  {stock.symbol}
                                </span>
                                {stock.isCustom && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] truncate max-w-[150px] sm:max-w-[200px]" style={{ color: currentTheme.textMuted }}>
                                {stock.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="p-3.5 text-right font-mono font-bold text-xs sm:text-sm" style={{ color: currentTheme.textPrimary }}>
                          {formatCurrency(stock.price, stock.currency)}
                        </td>

                        {/* 24h Change */}
                        <td className="p-3.5 text-right">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono"
                            style={{
                              backgroundColor: isGain ? `${currentTheme.gainColor}18` : `${currentTheme.lossColor}18`,
                              color: isGain ? currentTheme.gainColor : currentTheme.lossColor,
                            }}
                          >
                            {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isGain ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Mini Sparkline */}
                        <td className="p-3.5 text-center hidden md:table-cell">
                          <div className="w-24 h-7 mx-auto">
                            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                              {(() => {
                                const pts = stock.sparkline;
                                if (!pts || pts.length < 2) return null;
                                const min = Math.min(...pts);
                                const max = Math.max(...pts);
                                const range = max - min || 1;
                                const polyPts = pts
                                  .map((val, idx) => {
                                    const x = (idx / (pts.length - 1)) * 100;
                                    const y = 28 - ((val - min) / range) * 24;
                                    return `${x},${y}`;
                                  })
                                  .join(' ');
                                return (
                                  <polyline
                                    fill="none"
                                    stroke={isGain ? currentTheme.gainColor : currentTheme.lossColor}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={polyPts}
                                  />
                                );
                              })()}
                            </svg>
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="p-3.5 text-right font-mono hidden sm:table-cell" style={{ color: currentTheme.textSecondary }}>
                          {formatLargeNumber(stock.volume)}
                        </td>

                        {/* Market Cap */}
                        <td className="p-3.5 text-right font-mono font-medium hidden lg:table-cell" style={{ color: currentTheme.textSecondary }}>
                          {stock.marketCapFormatted}
                        </td>

                        {/* P/E Ratio */}
                        <td className="p-3.5 text-right font-mono hidden xl:table-cell" style={{ color: currentTheme.textMuted }}>
                          {stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : '-'}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onNavigateToFundamentals(stock.symbol)}
                              className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors"
                              style={{ borderColor: currentTheme.cardBorder }}
                              title="View Fundamentals Research"
                            >
                              <Layers className="w-3.5 h-3.5" style={{ color: currentTheme.textSecondary }} />
                            </button>

                            <button
                              onClick={() => onAskCopilot(`Analyze key drivers and risk profile for ${stock.name} (${stock.symbol})`)}
                              className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors"
                              style={{ borderColor: currentTheme.cardBorder }}
                              title="Ask AI Copilot"
                            >
                              <Bot className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Stock Cards Grid View */}
      {viewMode === 'cards' && (
        <div id="stock-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => {
            const isGain = stock.change >= 0;
            const flash = flashingSymbols[stock.symbol];
            const isSelected = selectedStock?.symbol === stock.symbol;

            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected ? 'ring-2' : ''
                } ${
                  flash === 'gain'
                    ? 'bg-emerald-500/20'
                    : flash === 'loss'
                    ? 'bg-rose-500/20'
                    : ''
                }`}
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: isSelected ? currentTheme.accent : currentTheme.cardBorder,
                  ...(isSelected ? { ringColor: currentTheme.accent } : {}),
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold font-mono" style={{ color: currentTheme.textPrimary }}>
                        {stock.symbol}
                      </h3>
                      {stock.isCustom && (
                        <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300">Custom</span>
                      )}
                    </div>
                    <p className="text-xs truncate max-w-[170px]" style={{ color: currentTheme.textMuted }}>
                      {stock.name}
                    </p>
                  </div>

                  <span
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold font-mono"
                    style={{
                      backgroundColor: isGain ? `${currentTheme.gainColor}20` : `${currentTheme.lossColor}20`,
                      color: isGain ? currentTheme.gainColor : currentTheme.lossColor,
                    }}
                  >
                    {isGain ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Price & Day Range */}
                <div className="mb-3">
                  <div className="text-xl font-black font-mono" style={{ color: currentTheme.textPrimary }}>
                    {formatCurrency(stock.price, stock.currency)}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: currentTheme.textMuted }}>
                    Range: {stock.low.toFixed(1)} - {stock.high.toFixed(1)}
                  </div>
                </div>

                {/* Sparkline Canvas */}
                <div className="h-10 w-full my-2">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    {(() => {
                      const pts = stock.sparkline;
                      if (!pts || pts.length < 2) return null;
                      const min = Math.min(...pts);
                      const max = Math.max(...pts);
                      const range = max - min || 1;
                      const polyPts = pts
                        .map((val, idx) => {
                          const x = (idx / (pts.length - 1)) * 100;
                          const y = 28 - ((val - min) / range) * 24;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polyline
                          fill="none"
                          stroke={isGain ? currentTheme.gainColor : currentTheme.lossColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={polyPts}
                        />
                      );
                    })()}
                  </svg>
                </div>

                {/* Card Quick Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px] font-mono" style={{ borderColor: currentTheme.cardBorder }}>
                  <div>
                    <span style={{ color: currentTheme.textMuted }}>Cap: </span>
                    <span style={{ color: currentTheme.textSecondary }}>{stock.marketCapFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span style={{ color: currentTheme.textMuted }}>Vol: </span>
                    <span style={{ color: currentTheme.textSecondary }}>{formatLargeNumber(stock.volume)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Modal: Add Custom Stock Ticker */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            id="add-stock-modal"
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textPrimary,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add Custom Stock Ticker</h3>
                  <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                    Inject symbol into tracking radar & AI Copilot context
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomStock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                  Ticker Symbol (e.g. NVDA, TSLA, INFY.NS)
                </label>
                <input
                  type="text"
                  required
                  placeholder="NVDA"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border font-mono font-bold outline-none"
                  style={{
                    backgroundColor: currentTheme.bg,
                    borderColor: currentTheme.cardBorder,
                    color: currentTheme.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="NVIDIA Corporation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none"
                  style={{
                    backgroundColor: currentTheme.bg,
                    borderColor: currentTheme.cardBorder,
                    color: currentTheme.textPrimary,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                    Initial Base Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border font-mono outline-none"
                    style={{
                      backgroundColor: currentTheme.bg,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                    Exchange
                  </label>
                  <select
                    value={newExchange}
                    onChange={(e) => setNewExchange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.bg,
                      borderColor: currentTheme.cardBorder,
                      color: currentTheme.textPrimary,
                    }}
                  >
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="NYSE">NYSE</option>
                    <option value="NSE India">NSE India</option>
                    <option value="BSE India">BSE India</option>
                    <option value="LSE London">LSE London</option>
                    <option value="XETRA">XETRA Germany</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: currentTheme.textSecondary }}>
                  Sector Classification
                </label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border outline-none cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.bg,
                    borderColor: currentTheme.cardBorder,
                    color: currentTheme.textPrimary,
                  }}
                >
                  <option value="Technology">Technology</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Consumer Cyclical">Consumer Cyclical</option>
                  <option value="Energy">Energy</option>
                  <option value="Communication Services">Communication Services</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: currentTheme.cardBorder }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
                  style={{ color: currentTheme.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  id="save-ticker-submit-btn"
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
                  style={{ backgroundColor: currentTheme.accent }}
                >
                  Save Ticker to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
