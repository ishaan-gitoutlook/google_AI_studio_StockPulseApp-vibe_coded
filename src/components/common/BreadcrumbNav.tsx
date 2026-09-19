import React from 'react';
import { ThemeConfig, MarketUniverseId } from '../../types';
import { Home, ChevronRight, BarChart2, FolderOpen, X, RotateCcw } from 'lucide-react';

interface BreadcrumbNavProps {
  activeTab: 'tracker' | 'fundamentals' | 'copilot' | 'qa' | 'api' | 'docs';
  setActiveTab: (tab: 'tracker' | 'fundamentals' | 'copilot' | 'qa' | 'api' | 'docs') => void;
  activeSector: string | null;
  onClearSector: () => void;
  currentTheme: ThemeConfig;
  activeUniverse: MarketUniverseId;
  totalAssets: number;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  activeTab,
  setActiveTab,
  activeSector,
  onClearSector,
  currentTheme,
}) => {
  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'tracker':
        return 'Market Tracker';
      case 'fundamentals':
        return 'Fundamentals';
      case 'copilot':
        return 'AI Copilot';
      case 'qa':
        return 'QA Studio';
      case 'api':
        return 'API Explorer';
      case 'docs':
        return 'Architecture Docs';
      default:
        return 'Market Tracker';
    }
  };

  const isTrackerTab = activeTab === 'tracker';

  return (
    <nav
      id="stockpulse-breadcrumb-bar"
      aria-label="Breadcrumb Navigation"
      className="w-full border-b transition-colors duration-200"
      style={{
        backgroundColor: `${currentTheme.bg}cc`,
        borderColor: currentTheme.cardBorder,
      }}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 text-xs">
        {/* Left: Breadcrumb Trail Nodes */}
        <ol className="flex items-center gap-1.5 flex-wrap font-mono font-medium list-none p-0 m-0">
          {/* Node 1: Home */}
          <li className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('tracker');
                onClearSector();
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors opacity-75 hover:opacity-100 cursor-pointer"
              style={{ color: currentTheme.textSecondary }}
              title="Navigate to Home"
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </button>
          </li>

          {/* Separator 1 */}
          <li className="flex items-center opacity-30 select-none" aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </li>

          {/* Node 2: Market Tracker (or active tab) */}
          <li className="flex items-center">
            {isTrackerTab ? (
              activeSector ? (
                // Clickable button to navigate back to global view
                <button
                  type="button"
                  onClick={onClearSector}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors opacity-75 hover:opacity-100 hover:underline cursor-pointer"
                  style={{ color: currentTheme.textSecondary }}
                  title="Click to collapse sector and return to global view"
                >
                  <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Market Tracker</span>
                </button>
              ) : (
                // Terminal leaf: Market Tracker (Global View)
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold"
                  style={{ color: currentTheme.textPrimary }}
                  aria-current="page"
                >
                  <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Market Tracker</span>
                </span>
              )
            ) : (
              // If on another tab
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tracker');
                  onClearSector();
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors opacity-75 hover:opacity-100 hover:underline cursor-pointer"
                style={{ color: currentTheme.textSecondary }}
                title="Switch to Market Tracker"
              >
                <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                <span>Market Tracker</span>
              </button>
            )}
          </li>

          {/* Node 3: If on non-tracker tab */}
          {!isTrackerTab && (
            <>
              <li className="flex items-center opacity-30 select-none" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </li>
              <li className="flex items-center">
                <span
                  className="px-1.5 py-0.5 rounded font-semibold"
                  style={{ color: currentTheme.textPrimary }}
                  aria-current="page"
                >
                  {getTabLabel(activeTab)}
                </span>
              </li>
            </>
          )}

          {/* Node 3: If on tracker tab AND a sector is expanded */}
          {isTrackerTab && activeSector && (
            <>
              <li className="flex items-center opacity-30 select-none" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </li>
              <li className="flex items-center">
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold"
                  style={{
                    backgroundColor: `${currentTheme.accent}15`,
                    borderColor: `${currentTheme.accent}40`,
                    color: currentTheme.accent,
                  }}
                  aria-current="page"
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeSector}</span>
                  <button
                    type="button"
                    onClick={onClearSector}
                    className="ml-0.5 p-0.5 rounded hover:bg-black/20 transition-colors"
                    title="Clear sector and return to global view"
                    aria-label={`Close ${activeSector} sector view`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </li>
            </>
          )}
        </ol>

        {/* Right: Quick Action to Return to Global View (only when sector is expanded) */}
        {isTrackerTab && activeSector && (
          <button
            type="button"
            onClick={onClearSector}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium transition-all shadow-xs hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: `${currentTheme.accent}15`,
              borderColor: currentTheme.accent,
              color: currentTheme.accent,
            }}
            title="Reset sector filter and return to global view"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Return to Global View</span>
          </button>
        )}
      </div>
    </nav>
  );
};
