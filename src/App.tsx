import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MarketUniverseId, StockQuote, ThemeId } from './types';
import { applyThemeToDocument, getStoredTheme, saveTheme, THEMES } from './utils/theme';
import { INITIAL_STOCKS } from './data/universes';
import { calculateBreadth, simulateTickUpdate } from './utils/marketEngine';
import { Header, BreadcrumbNav } from './components/common';
import { MarketTracker } from './components/MarketTracker/MarketTracker';
import { FundamentalsView } from './components/Fundamentals/FundamentalsView';
import { AICopilot } from './components/AICopilot/AICopilot';
import { QAStudio } from './components/QAStudio/QAStudio';
import { ApiExplorer } from './components/ApiExplorer/ApiExplorer';
import { DocViewer } from './components/DocViewer/DocViewer';
import { usePageVisibility } from './hooks/usePageVisibility';

export function App() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<'tracker' | 'fundamentals' | 'copilot' | 'qa' | 'api' | 'docs'>('tracker');

  // Active market universe state
  const [activeUniverse, setActiveUniverse] = useState<MarketUniverseId>('global-megacaps');

  // Quotes data state per universe (allows custom stock persistence)
  const [universeQuotes, setUniverseQuotes] = useState<Record<MarketUniverseId, StockQuote[]>>(() => {
    return { ...INITIAL_STOCKS };
  });

  // Selected stock for deep dive/charting
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);

  // Active sector filter/expanded state
  const [activeSector, setActiveSector] = useState<string | null>(null);

  // Reset sector expansion when universe changes
  useEffect(() => {
    setActiveSector(null);
  }, [activeUniverse]);

  // Focus symbol for Fundamentals tab
  const [fundamentalsFocusSymbol, setFundamentalsFocusSymbol] = useState<string>('NVDA');

  // Injected prompt for Copilot tab
  const [copilotPrompt, setCopilotPrompt] = useState<string | null>(null);

  // Live tick streaming controls & Page Visibility optimization
  const [isStreaming, setIsStreaming] = useState(true);
  const isTabVisible = usePageVisibility();
  const [streamSpeed, setStreamSpeed] = useState(3000); // 3 seconds default
  const [lastTickInfo, setLastTickInfo] = useState<{ symbol: string; isGain: boolean; time: string } | null>(null);
  const [flashingSymbols, setFlashingSymbols] = useState<Record<string, 'gain' | 'loss'>>({});

  // Theme application on mount & change
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  const handleSetThemeId = useCallback((themeId: ThemeId) => {
    const nextTheme = THEMES[themeId];
    if (nextTheme) {
      setCurrentTheme(nextTheme);
      saveTheme(themeId);
    }
  }, []);

  // Active stock quotes for current universe
  const activeStocks = useMemo(() => {
    return universeQuotes[activeUniverse] || INITIAL_STOCKS['global-megacaps'];
  }, [universeQuotes, activeUniverse]);

  // Memoized market breadth calculation (avoids recalculating unless activeStocks reference changes)
  const breadth = useMemo(() => {
    return calculateBreadth(activeStocks);
  }, [activeStocks]);

  // Optimized live tick streamer loop with Page Visibility & Tab awareness
  useEffect(() => {
    // Pause streaming when turned off, when tab is hidden, or when in static documentation / testing views
    if (!isStreaming || !isTabVisible) return;

    // Throttle tick rate if on non-market tabs (e.g. docs, qa, api)
    const effectiveInterval = (activeTab === 'tracker' || activeTab === 'fundamentals') ? streamSpeed : streamSpeed * 2.5;

    const interval = setInterval(() => {
      setUniverseQuotes((prev) => {
        const currentList = prev[activeUniverse] || INITIAL_STOCKS[activeUniverse];
        if (!currentList || currentList.length === 0) return prev;

        const randomIndex = Math.floor(Math.random() * currentList.length);
        const targetStock = currentList[randomIndex];
        const updatedStock = simulateTickUpdate(targetStock);

        const isGain = updatedStock.price >= targetStock.price;
        setLastTickInfo({
          symbol: updatedStock.symbol,
          isGain,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });

        // Trigger flash animation
        setFlashingSymbols((f) => ({
          ...f,
          [updatedStock.symbol]: isGain ? 'gain' : 'loss',
        }));

        setTimeout(() => {
          setFlashingSymbols((f) => {
            if (!f[updatedStock.symbol]) return f;
            const next = { ...f };
            delete next[updatedStock.symbol];
            return next;
          });
        }, 800);

        const updatedList = [...currentList];
        updatedList[randomIndex] = updatedStock;

        // If currently selected stock was updated, sync it
        if (selectedStock && selectedStock.symbol === updatedStock.symbol) {
          setSelectedStock(updatedStock);
        }

        return {
          ...prev,
          [activeUniverse]: updatedList,
        };
      });
    }, effectiveInterval);

    return () => clearInterval(interval);
  }, [isStreaming, isTabVisible, streamSpeed, activeUniverse, activeTab, selectedStock]);

  // Add custom ticker to active universe (memoized)
  const handleAddCustomStock = useCallback((newStockData: Partial<StockQuote>) => {
    const symbol = newStockData.symbol || 'CUSTOM';
    const baseStock: StockQuote = {
      symbol,
      name: newStockData.name || `${symbol} Corp`,
      exchange: newStockData.exchange || 'NASDAQ',
      currency: newStockData.currency || 'USD',
      price: newStockData.price || 150.0,
      change: newStockData.change || 1.2,
      changePercent: newStockData.changePercent || 0.8,
      open: newStockData.open || 149.0,
      high: newStockData.high || 152.0,
      low: newStockData.low || 148.5,
      previousClose: newStockData.previousClose || 148.8,
      volume: newStockData.volume || 1200000,
      avgVolume: newStockData.avgVolume || 1500000,
      marketCap: newStockData.marketCap || 15000000000,
      marketCapFormatted: newStockData.marketCapFormatted || '$15.0 B',
      peRatio: newStockData.peRatio || 24.5,
      eps: newStockData.eps || 6.0,
      dividendYield: newStockData.dividendYield || 0.015,
      week52High: newStockData.week52High || 170.0,
      week52Low: newStockData.week52Low || 110.0,
      sparkline: newStockData.sparkline || [148, 149, 148.5, 150, 151, 150],
      sector: newStockData.sector || 'Technology',
      industry: newStockData.industry || 'Custom Asset',
      lastUpdated: 'User Added',
      isCustom: true,
    };

    setUniverseQuotes((prev) => {
      const currentList = prev[activeUniverse] || [];
      return {
        ...prev,
        [activeUniverse]: [baseStock, ...currentList],
      };
    });

    setSelectedStock(baseStock);
  }, [activeUniverse]);

  // Navigation callbacks (memoized)
  const handleNavigateToFundamentals = useCallback((symbol: string) => {
    setFundamentalsFocusSymbol(symbol);
    setActiveTab('fundamentals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAskCopilot = useCallback((prompt: string) => {
    setCopilotPrompt(prompt);
    setActiveTab('copilot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleManualRefresh = useCallback(() => {
    setUniverseQuotes((prev) => {
      const currentList = prev[activeUniverse] || [];
      const refreshed = currentList.map((s) => simulateTickUpdate(s));
      return {
        ...prev,
        [activeUniverse]: refreshed,
      };
    });
  }, [activeUniverse]);

  return (
    <div
      id="stockpulse-app-root"
      className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textPrimary,
      }}
    >
      {/* 1. Universal Top Header & Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUniverse={activeUniverse}
        setActiveUniverse={setActiveUniverse}
        currentTheme={currentTheme}
        setThemeId={handleSetThemeId}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        streamSpeed={streamSpeed}
        setStreamSpeed={setStreamSpeed}
        lastTickInfo={lastTickInfo}
        onRefreshManual={handleManualRefresh}
      />

      {/* 2. Global Breadcrumb Navigation Trail */}
      <BreadcrumbNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSector={activeSector}
        onClearSector={() => setActiveSector(null)}
        currentTheme={currentTheme}
        activeUniverse={activeUniverse}
        totalAssets={activeStocks.length}
      />

      {/* 3. Main Tab Body */}
      <main id="main-content-viewport" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'tracker' && (
          <MarketTracker
            stocks={activeStocks}
            breadth={breadth}
            activeUniverse={activeUniverse}
            currentTheme={currentTheme}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            onAddCustomStock={handleAddCustomStock}
            onNavigateToFundamentals={handleNavigateToFundamentals}
            onAskCopilot={handleAskCopilot}
            flashingSymbols={flashingSymbols}
            selectedSectorFilter={activeSector}
            onSelectSectorFilter={setActiveSector}
          />
        )}

        {activeTab === 'fundamentals' && (
          <FundamentalsView
            stocks={activeStocks}
            initialSymbol={fundamentalsFocusSymbol || (selectedStock ? selectedStock.symbol : 'NVDA')}
            currentTheme={currentTheme}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilot
            currentTheme={currentTheme}
            activeUniverse={activeUniverse}
            stocks={activeStocks}
            selectedStock={selectedStock}
            initialPrompt={copilotPrompt}
            onClearInitialPrompt={() => setCopilotPrompt(null)}
          />
        )}

        {activeTab === 'qa' && (
          <QAStudio currentTheme={currentTheme} />
        )}

        {activeTab === 'api' && (
          <ApiExplorer currentTheme={currentTheme} />
        )}

        {activeTab === 'docs' && (
          <DocViewer currentTheme={currentTheme} />
        )}
      </main>

      {/* 3. Global Status Footer */}
      <footer
        id="stockpulse-global-footer"
        className="border-t py-3 px-4 sm:px-6 text-xs transition-colors"
        style={{
          borderColor: currentTheme.cardBorder,
          backgroundColor: `${currentTheme.bg}ee`,
          color: currentTheme.textMuted,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.gainColor }} />
            <span className="font-semibold text-white">StockPulse</span>
            <span className="opacity-50">•</span>
            <span>Market Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Universe: <strong className="text-white">{activeUniverse}</strong></span>
            <span className="opacity-40">•</span>
            <span>Theme: <strong>{currentTheme.name}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
