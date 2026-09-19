import React, { useState, useMemo, useEffect } from 'react';
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
  Bookmark,
  Star,
  RotateCcw,
  LayoutGrid,
  GripHorizontal,
} from 'lucide-react';
import {
  MarketBreadth,
  MarketUniverseId,
  StockQuote,
  ThemeConfig,
  TrackerWidgetConfig,
  TrackerWidgetId,
} from '../../types';
import { StockDetailChart } from './StockDetailChart';
import { BreadthDistributionD3 } from './BreadthDistributionD3';
import { WidgetContainer } from './WidgetContainer';
import { BreadthRadarWidget } from './BreadthRadarWidget';
import { QuotesMatrixWidget } from './QuotesMatrixWidget';
import { SectorTreemapD3 } from './SectorTreemapD3';
import { formatCurrency, formatLargeNumber } from '../../utils/marketEngine';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_WIDGET_CONFIGS: TrackerWidgetConfig[] = [
  {
    id: 'breadth_radar',
    title: 'Market Breadth & Momentum Radar',
    description: 'Advance/Decline dynamics, ratio, and aggregate universe momentum',
    colSpan: 'full',
  },
  {
    id: 'sector_treemap',
    title: 'Sector & Market Cap Treemap',
    description: 'D3 interactive market cap tree map with sector grouping, performance shading, and sector filters',
    colSpan: 'full',
  },
  {
    id: 'd3_distribution',
    title: 'Breadth Distribution Analytics',
    description: 'D3 quantitative return histogram, radial donut, and constituent spread',
    colSpan: 'full',
    isCollapsed: true,
  },
  {
    id: 'detail_chart',
    title: 'Constituent Deep-Dive Chart',
    description: 'HD interactive candlestick/area price action, volume, and moving averages',
    colSpan: 'full',
  },
  {
    id: 'quotes_matrix',
    title: 'Market Quotes Matrix & Screener',
    description: 'Real-time multi-asset quotes table and card screener',
    colSpan: 'full',
  },
];

const STORAGE_KEY = 'stockpulse_tracker_widgets_v1';


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
  selectedSectorFilter?: string | null;
  onSelectSectorFilter?: (sector: string | null) => void;
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
  selectedSectorFilter: externalSectorFilter,
  onSelectSectorFilter: externalOnSelectSectorFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'changePercent' | 'price' | 'volume' | 'marketCap' | 'symbol'>('changePercent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers' | 'watchlist'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [internalSectorFilter, setInternalSectorFilter] = useState<string | null>(null);

  const selectedSectorFilter = externalSectorFilter !== undefined ? externalSectorFilter : internalSectorFilter;
  const handleSelectSector = externalOnSelectSectorFilter || setInternalSectorFilter;

  const { user, userProfile, toggleWatchlist } = useAuth();

  // New stock form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('150.00');
  const [newExchange, setNewExchange] = useState('NASDAQ');
  const [newSector, setNewSector] = useState('Technology');

  // Filter & sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (selectedSectorFilter) {
      result = result.filter((s) => s.sector === selectedSectorFilter);
    }

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
    } else if (filterType === 'watchlist') {
      const starred = userProfile?.watchlist || [];
      result = result.filter((s) => starred.includes(s.symbol.toUpperCase()));
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
  }, [stocks, selectedSectorFilter, searchQuery, filterType, sortField, sortDirection, userProfile?.watchlist]);

  const handleSort = React.useCallback((field: typeof sortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      } else {
        setSortDirection('desc');
        return field;
      }
    });
  }, []);

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

  // -------------------------------------------------------------
  // Grid-based Drag-and-Drop State & Customization for Modules
  // -------------------------------------------------------------
  const [widgets, setWidgets] = useState<TrackerWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TrackerWidgetConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify all required widget IDs exist; merge if needed
          const existingIds = new Set(parsed.map((w) => w.id));
          const missing = DEFAULT_WIDGET_CONFIGS.filter((w) => !existingIds.has(w.id));
          return [...parsed, ...missing];
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_WIDGET_CONFIGS;
  });

  // Save layout changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (e) {
      console.warn('Failed to save widget layout', e);
    }
  }, [widgets]);

  // Drag and drop tracking
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving container
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedWidgetId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    setWidgets((prev) => {
      const sourceIndex = prev.findIndex((w) => w.id === sourceId);
      const targetIndex = prev.findIndex((w) => w.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    setWidgets((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleToggleCollapse = (widgetId: TrackerWidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, isCollapsed: !w.isCollapsed } : w))
    );
  };

  const handleToggleWidth = (widgetId: TrackerWidgetId) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w;
        return {
          ...w,
          colSpan: w.colSpan === 'full' ? 'half' : 'full',
        };
      })
    );
  };

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGET_CONFIGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const renderWidgetContent = (widgetId: TrackerWidgetId) => {
    switch (widgetId) {
      case 'breadth_radar':
        return <BreadthRadarWidget breadth={breadth} currentTheme={currentTheme} />;
      case 'sector_treemap':
        return (
          <SectorTreemapD3
            stocks={stocks}
            currentTheme={currentTheme}
            selectedStock={selectedStock}
            onSelectStock={setSelectedStock}
            selectedSectorFilter={selectedSectorFilter}
            onSelectSectorFilter={handleSelectSector}
          />
        );
      case 'd3_distribution':
        return (
          <BreadthDistributionD3
            stocks={stocks}
            breadth={breadth}
            currentTheme={currentTheme}
            onSelectStock={setSelectedStock}
            selectedSymbol={selectedStock?.symbol}
          />
        );
      case 'detail_chart':
        return selectedStock ? (
          <StockDetailChart
            stock={selectedStock}
            currentTheme={currentTheme}
            onClose={() => setSelectedStock(null)}
            onNavigateToFundamentals={onNavigateToFundamentals}
            onAskCopilot={onAskCopilot}
          />
        ) : null;
      case 'quotes_matrix':
        return (
          <QuotesMatrixWidget
            stocks={stocks}
            filteredStocks={filteredStocks}
            totalAdvancers={breadth.advancers}
            totalDecliners={breadth.decliners}
            currentTheme={currentTheme}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            flashingSymbols={flashingSymbols}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateToFundamentals={onNavigateToFundamentals}
            onAskCopilot={onAskCopilot}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="market-tracker-view" className="space-y-5">
      {/* Minimal Module Status & Toggle Bar */}
      <div
        id="tracker-layout-controls"
        className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs opacity-75" style={{ color: currentTheme.textSecondary }}>
            Market Modules
          </span>
          <span className="text-[11px] font-mono opacity-40">•</span>
          <span className="text-[11px] font-mono opacity-60" style={{ color: currentTheme.textMuted }}>
            {widgets.filter((w) => !w.isCollapsed).length} of {widgets.length} active
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {widgets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleToggleCollapse(w.id)}
              className="px-2 py-0.5 rounded-md border font-mono transition-all text-[11px]"
              style={{
                backgroundColor: !w.isCollapsed ? `${currentTheme.accent}15` : 'transparent',
                borderColor: !w.isCollapsed ? `${currentTheme.accent}40` : currentTheme.cardBorder,
                color: !w.isCollapsed ? currentTheme.accent : currentTheme.textMuted,
              }}
              title={`Toggle ${w.title} visibility`}
            >
              {w.title.split(' ')[0]}
            </button>
          ))}

          <button
            onClick={handleResetLayout}
            className="px-2 py-0.5 rounded-md border font-mono transition-all text-[11px] opacity-40 hover:opacity-100"
            style={{
              borderColor: currentTheme.cardBorder,
              color: currentTheme.textMuted,
            }}
            title="Reset to default dashboard modules"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid of Dynamic Widgets */}
      <div className="grid grid-cols-12 gap-5">
        {widgets.map((widget, index) => {
          // If it is the selectedStock detail card and no stock is selected, don't show empty container
          if (widget.id === 'detail_chart' && !selectedStock) {
            return null;
          }

          return (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              index={index}
              totalWidgets={widgets.length}
              currentTheme={currentTheme}
              isDragging={draggedWidgetId === widget.id}
              isDragOver={dragOverWidgetId === widget.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onMoveUp={() => handleMoveWidget(index, 'up')}
              onMoveDown={() => handleMoveWidget(index, 'down')}
              onToggleCollapse={() => handleToggleCollapse(widget.id)}
              onToggleWidth={() => handleToggleWidth(widget.id)}
            >
              {renderWidgetContent(widget.id)}
            </WidgetContainer>
          );
        })}
      </div>

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
