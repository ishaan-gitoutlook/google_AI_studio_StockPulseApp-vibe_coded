import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ArrowUpDown,
  Grid,
  List,
  Layers,
  Bot,
  Bookmark,
  Star,
} from 'lucide-react';
import { StockQuote, ThemeConfig } from '../../types';
import { formatCurrency, formatLargeNumber } from '../../utils/marketEngine';
import { useAuth } from '../../context/AuthContext';

interface QuotesMatrixWidgetProps {
  stocks: StockQuote[];
  filteredStocks: StockQuote[];
  totalAdvancers: number;
  totalDecliners: number;
  currentTheme: ThemeConfig;
  selectedStock: StockQuote | null;
  setSelectedStock: (stock: StockQuote | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: 'all' | 'gainers' | 'losers' | 'watchlist';
  setFilterType: (filter: 'all' | 'gainers' | 'losers' | 'watchlist') => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  sortField: 'changePercent' | 'price' | 'volume' | 'marketCap' | 'symbol';
  sortDirection: 'asc' | 'desc';
  handleSort: (field: 'changePercent' | 'price' | 'volume' | 'marketCap' | 'symbol') => void;
  flashingSymbols: Record<string, 'gain' | 'loss'>;
  onOpenAddModal: () => void;
  onNavigateToFundamentals: (symbol: string) => void;
  onAskCopilot: (prompt: string) => void;
}

export const QuotesMatrixWidget: React.FC<QuotesMatrixWidgetProps> = ({
  stocks,
  filteredStocks,
  totalAdvancers,
  totalDecliners,
  currentTheme,
  selectedStock,
  setSelectedStock,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  viewMode,
  setViewMode,
  sortField,
  sortDirection,
  handleSort,
  flashingSymbols,
  onOpenAddModal,
  onNavigateToFundamentals,
  onAskCopilot,
}) => {
  const { userProfile, toggleWatchlist } = useAuth();

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Filters, Sort, View Modes, Add Custom Stock */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: currentTheme.textMuted }}
          />
          <input
            id="stock-search-input"
            type="text"
            placeholder="Search symbol, company name, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border outline-none transition-all shadow-xs"
            style={{
              backgroundColor: currentTheme.bg,
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
          <div
            className="flex items-center gap-1 p-1 rounded-lg border"
            style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.bg }}
          >
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
              Gainers ({totalAdvancers})
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
              Decliners ({totalDecliners})
            </button>

            <button
              id="filter-watchlist-btn"
              onClick={() => setFilterType('watchlist')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                filterType === 'watchlist' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: filterType === 'watchlist' ? `${currentTheme.accent}30` : 'transparent',
                color: filterType === 'watchlist' ? currentTheme.accent : currentTheme.textPrimary,
              }}
              title="Filter by your Cloud Watchlist stored in Firestore"
            >
              <Bookmark className="w-3 h-3" />
              <span>Watchlist ({userProfile?.watchlist?.length || 0})</span>
            </button>
          </div>

          {/* Table / Grid Switcher */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg border"
            style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.bg }}
          >
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
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform hover:scale-102 active:scale-98"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Stock Table View */}
      {viewMode === 'table' && (
        <div
          id="stock-quotes-table-container"
          className="rounded-xl border overflow-hidden shadow-xs transition-all"
          style={{
            backgroundColor: currentTheme.bg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: currentTheme.cardBorder, backgroundColor: `${currentTheme.cardBg}80` }}
                >
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
                  <th
                    className="p-3.5 font-bold text-center hidden md:table-cell"
                    style={{ color: currentTheme.textSecondary }}
                  >
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
                  <th className="p-3.5 font-bold text-center" style={{ color: currentTheme.textSecondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: currentTheme.cardBorder }}>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center" style={{ color: currentTheme.textMuted }}>
                      No constituents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <StockTableRow
                      key={stock.symbol}
                      stock={stock}
                      isSelected={selectedStock?.symbol === stock.symbol}
                      flash={flashingSymbols[stock.symbol]}
                      isStarred={Boolean(userProfile?.watchlist?.includes(stock.symbol.toUpperCase()))}
                      currentTheme={currentTheme}
                      onSelect={setSelectedStock}
                      onToggleWatchlist={toggleWatchlist}
                      onNavigateToFundamentals={onNavigateToFundamentals}
                      onAskCopilot={onAskCopilot}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Cards Grid View */}
      {viewMode === 'cards' && (
        <div id="stock-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStocks.map((stock) => (
            <StockGridCard
              key={stock.symbol}
              stock={stock}
              isSelected={selectedStock?.symbol === stock.symbol}
              flash={flashingSymbols[stock.symbol]}
              isStarred={Boolean(userProfile?.watchlist?.includes(stock.symbol.toUpperCase()))}
              currentTheme={currentTheme}
              onSelect={setSelectedStock}
              onToggleWatchlist={toggleWatchlist}
              onNavigateToFundamentals={onNavigateToFundamentals}
              onAskCopilot={onAskCopilot}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MEMOIZED SUB-COMPONENTS FOR TICK-STREAMING PERFORMANCE
// -------------------------------------------------------------

interface StockTableRowProps {
  stock: StockQuote;
  isSelected: boolean;
  flash?: 'gain' | 'loss';
  isStarred: boolean;
  currentTheme: ThemeConfig;
  onSelect: (stock: StockQuote) => void;
  onToggleWatchlist: (symbol: string) => void;
  onNavigateToFundamentals: (symbol: string) => void;
  onAskCopilot: (prompt: string) => void;
}

const StockTableRow = React.memo<StockTableRowProps>(({
  stock,
  isSelected,
  flash,
  isStarred,
  currentTheme,
  onSelect,
  onToggleWatchlist,
  onNavigateToFundamentals,
  onAskCopilot,
}) => {
  const isGain = stock.change >= 0;

  // Memoize sparkline point calculations
  const sparklinePoints = React.useMemo(() => {
    if (!stock.sparkline || stock.sparkline.length < 2) return '';
    const min = Math.min(...stock.sparkline);
    const max = Math.max(...stock.sparkline);
    const range = max - min || 1;
    return stock.sparkline
      .map((val, idx) => {
        const x = (idx / (stock.sparkline.length - 1)) * 100;
        const y = 26 - ((val - min) / range) * 22;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [stock.sparkline]);

  return (
    <tr
      onClick={() => onSelect(stock)}
      className={`cursor-pointer transition-colors hover:bg-white/5 ${
        isSelected ? 'bg-sky-500/10' : ''
      } ${
        flash === 'gain'
          ? 'bg-emerald-500/20'
          : flash === 'loss'
          ? 'bg-rose-500/20'
          : ''
      }`}
    >
      {/* Symbol & Name */}
      <td className="p-3.5">
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-extrabold text-sm"
            style={{ color: currentTheme.textPrimary }}
          >
            {stock.symbol}
          </span>
          {stock.isCustom && (
            <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
              User Added
            </span>
          )}
        </div>
        <div className="text-[11px] truncate max-w-[160px]" style={{ color: currentTheme.textMuted }}>
          {stock.name} • <span className="opacity-75">{stock.exchange}</span>
        </div>
      </td>

      {/* Price */}
      <td className="p-3.5 text-right font-mono font-bold" style={{ color: currentTheme.textPrimary }}>
        {formatCurrency(stock.price, stock.currency)}
      </td>

      {/* Change & ChangePercent */}
      <td className="p-3.5 text-right">
        <span
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold"
          style={{
            backgroundColor: isGain ? `${currentTheme.gainColor}20` : `${currentTheme.lossColor}20`,
            color: isGain ? currentTheme.gainColor : currentTheme.lossColor,
          }}
        >
          {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isGain ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
        <div className="text-[11px] font-mono mt-0.5" style={{ color: isGain ? currentTheme.gainColor : currentTheme.lossColor }}>
          {isGain ? '+' : ''}{formatCurrency(stock.change, stock.currency)}
        </div>
      </td>

      {/* Mini Sparkline SVG */}
      <td className="p-3.5 hidden md:table-cell">
        <div className="w-24 h-7 mx-auto flex items-center justify-center">
          {sparklinePoints && (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
              <polyline
                fill="none"
                stroke={isGain ? currentTheme.gainColor : currentTheme.lossColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          )}
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

      {/* Action Buttons */}
      <td className="p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleWatchlist(stock.symbol)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isStarred ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'hover:bg-white/10'
            }`}
            style={{
              borderColor: isStarred ? undefined : currentTheme.cardBorder,
              color: isStarred ? undefined : currentTheme.textMuted,
            }}
            title={isStarred ? 'Remove from Cloud Watchlist' : 'Save to Cloud Watchlist (Firestore)'}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
          </button>

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
});

StockTableRow.displayName = 'StockTableRow';

interface StockGridCardProps {
  stock: StockQuote;
  isSelected: boolean;
  flash?: 'gain' | 'loss';
  isStarred: boolean;
  currentTheme: ThemeConfig;
  onSelect: (stock: StockQuote) => void;
  onToggleWatchlist: (symbol: string) => void;
  onNavigateToFundamentals: (symbol: string) => void;
  onAskCopilot: (prompt: string) => void;
}

const StockGridCard = React.memo<StockGridCardProps>(({
  stock,
  isSelected,
  flash,
  isStarred,
  currentTheme,
  onSelect,
  onToggleWatchlist,
  onNavigateToFundamentals,
  onAskCopilot,
}) => {
  const isGain = stock.change >= 0;

  return (
    <div
      onClick={() => onSelect(stock)}
      className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs hover:shadow-md ${
        isSelected ? 'ring-2' : ''
      } ${
        flash === 'gain'
          ? 'bg-emerald-500/20'
          : flash === 'loss'
          ? 'bg-rose-500/20'
          : ''
      }`}
      style={{
        backgroundColor: currentTheme.bg,
        borderColor: isSelected ? currentTheme.accent : currentTheme.cardBorder,
        ...(isSelected ? { ringColor: currentTheme.accent } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-extrabold font-mono" style={{ color: currentTheme.textPrimary }}>
              {stock.symbol}
            </h3>
            {stock.isCustom && (
              <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300">Custom</span>
            )}
          </div>
          <p className="text-xs truncate max-w-[150px]" style={{ color: currentTheme.textMuted }}>
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

      <div className="flex items-baseline justify-between pt-2 border-t" style={{ borderColor: currentTheme.cardBorder }}>
        <span className="text-sm font-mono font-bold" style={{ color: currentTheme.textPrimary }}>
          {formatCurrency(stock.price, stock.currency)}
        </span>
        <span className="text-[11px] font-mono" style={{ color: currentTheme.textMuted }}>
          {formatLargeNumber(stock.volume)} vol
        </span>
      </div>

      {/* Quick Actions Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t" style={{ borderColor: currentTheme.cardBorder }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(stock.symbol);
          }}
          className={`p-1.5 rounded-lg border transition-colors ${
            isStarred ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'hover:bg-white/10'
          }`}
          style={{
            borderColor: isStarred ? undefined : currentTheme.cardBorder,
            color: isStarred ? undefined : currentTheme.textMuted,
          }}
          title="Watchlist"
        >
          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
        </button>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onNavigateToFundamentals(stock.symbol)}
            className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
            title="Fundamentals"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAskCopilot(`Analyze key drivers and risk profile for ${stock.name} (${stock.symbol})`)}
            className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.accent }}
            title="Ask AI Copilot"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

StockGridCard.displayName = 'StockGridCard';
