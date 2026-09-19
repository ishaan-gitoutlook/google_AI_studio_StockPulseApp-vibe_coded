import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Play,
  Pause,
  Terminal,
  BookOpen,
  Bot,
  FlaskConical,
  BarChart3,
  RefreshCw,
  User,
  LogIn,
} from 'lucide-react';
import { MarketUniverseId, ThemeConfig, ThemeId } from '../../types';
import { THEMES } from '../../utils/theme';
import { UNIVERSES_META } from '../../data/universes';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  activeTab: 'tracker' | 'fundamentals' | 'copilot' | 'qa' | 'api' | 'docs';
  setActiveTab: (tab: 'tracker' | 'fundamentals' | 'copilot' | 'qa' | 'api' | 'docs') => void;
  activeUniverse: MarketUniverseId;
  setActiveUniverse: (u: MarketUniverseId) => void;
  currentTheme: ThemeConfig;
  setThemeId: (t: ThemeId) => void;
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  lastTickInfo: { symbol: string; isGain: boolean; time: string } | null;
  onRefreshManual: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeUniverse,
  setActiveUniverse,
  currentTheme,
  setThemeId,
  isStreaming,
  setIsStreaming,
  streamSpeed,
  setStreamSpeed,
  lastTickInfo,
  onRefreshManual,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      id="stockpulse-header"
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: `${currentTheme.bg}ee`,
        borderColor: currentTheme.cardBorder,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Banner: Brand Logo & Global Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Minimalist Live Indicator */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-container"
            className="flex items-center justify-center w-8 h-8 rounded-lg shadow-xs transition-transform"
            style={{
              backgroundColor: `${currentTheme.accent}20`,
              border: `1px solid ${currentTheme.accent}40`,
            }}
          >
            <Activity className="w-4 h-4" style={{ color: currentTheme.accent }} />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 id="app-title-heading" className="text-lg font-bold tracking-tight">
              Stock<span style={{ color: currentTheme.accent }}>Pulse</span>
            </h1>
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border"
              style={{
                backgroundColor: `${currentTheme.gainColor}15`,
                borderColor: `${currentTheme.gainColor}35`,
                color: currentTheme.gainColor,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.gainColor }} />
              <span>Live Market</span>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          {/* Compact Stream Controller */}
          <div
            id="streaming-controls-panel"
            className="flex items-center gap-1 p-1 rounded-lg text-xs font-mono border"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.cardBorder,
            }}
          >
            <button
              id="toggle-live-stream-btn"
              onClick={() => setIsStreaming(!isStreaming)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: isStreaming ? `${currentTheme.gainColor}20` : 'transparent',
                color: isStreaming ? currentTheme.gainColor : currentTheme.textSecondary,
              }}
              title={isStreaming ? 'Click to pause stream' : 'Click to resume stream'}
            >
              {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden md:inline">{isStreaming ? 'Live' : 'Paused'}</span>
            </button>

            {isStreaming && (
              <select
                id="stream-speed-select"
                aria-label="Streaming Tick Rate"
                value={streamSpeed}
                onChange={(e) => setStreamSpeed(Number(e.target.value))}
                className="bg-transparent text-[11px] font-mono outline-none border-0 cursor-pointer pr-1"
                style={{ color: currentTheme.textSecondary }}
              >
                <option value={1000} className="bg-slate-900 text-white">1s</option>
                <option value={3000} className="bg-slate-900 text-white">3s</option>
                <option value={5000} className="bg-slate-900 text-white">5s</option>
              </select>
            )}

            {lastTickInfo && (
              <span
                id="last-tick-indicator"
                className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium"
                style={{
                  color: lastTickInfo.isGain ? currentTheme.gainColor : currentTheme.lossColor,
                }}
              >
                {lastTickInfo.symbol} {lastTickInfo.isGain ? '▲' : '▼'}
              </span>
            )}

            <button
              id="manual-refresh-quote-btn"
              onClick={onRefreshManual}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Manual Market Refresh"
            >
              <RefreshCw className="w-3 h-3" style={{ color: currentTheme.textSecondary }} />
            </button>
          </div>

          {/* Universe Selector Dropdown */}
          <div className="relative">
            <select
              id="market-universe-select"
              aria-label="Market Universe"
              value={activeUniverse}
              onChange={(e) => setActiveUniverse(e.target.value as MarketUniverseId)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border outline-none cursor-pointer shadow-xs transition-all"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textPrimary,
              }}
            >
              {Object.values(UNIVERSES_META).map((meta) => (
                <option key={meta.id} value={meta.id} className="bg-slate-900 text-white">
                  {meta.flag} {meta.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Palette Picker */}
          <div className="relative">
            <button
              id="theme-switcher-btn"
              aria-label="Theme Palette Switcher"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs transition-all hover:opacity-90"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textPrimary,
              }}
            >
              <span
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ backgroundColor: currentTheme.accent }}
              />
              <span className="hidden sm:inline">{currentTheme.name}</span>
            </button>

            {isThemeOpen && (
              <div
                id="theme-dropdown-menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderColor: currentTheme.cardBorder,
                }}
              >
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: currentTheme.textMuted }}>
                  7 Ergonomic Color Palettes
                </div>
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    onClick={() => {
                      setThemeId(theme.id);
                      setIsThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      currentTheme.id === theme.id ? 'font-bold' : 'hover:bg-white/5'
                    }`}
                    style={{
                      color: currentTheme.id === theme.id ? currentTheme.accent : currentTheme.textPrimary,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span>{theme.name}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                      {theme.tag.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Firebase Auth & Google Sign-In Profile Button */}
          <button
            id="firebase-auth-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs transition-all hover:scale-102"
            style={{
              backgroundColor: user ? `${currentTheme.accent}20` : currentTheme.cardBg,
              borderColor: user ? currentTheme.accent : currentTheme.cardBorder,
              color: user ? currentTheme.accent : currentTheme.textPrimary,
            }}
            title={user ? `Signed in as ${user.email}` : 'Sign in with Google (Firebase)'}
          >
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full border border-white/20"
                  />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span className="max-w-[90px] truncate">{user.displayName?.split(' ')[0] || 'Account'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Google Sign-In</span>
                <span className="sm:hidden">Login</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auth & Firestore Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentTheme={currentTheme}
      />

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav
          id="main-nav-tabs"
          aria-label="Dashboard Views"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1"
        >
          <button
            id="tab-market-tracker"
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'tracker'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'tracker' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'tracker' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'tracker' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Market Tracker</span>
          </button>

          <button
            id="tab-fundamentals-research"
            onClick={() => setActiveTab('fundamentals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'fundamentals'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'fundamentals' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'fundamentals' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'fundamentals' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <Layers className="w-4 h-4" />
            <span>Fundamentals Research</span>
          </button>

          <button
            id="tab-ai-copilot"
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'copilot'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'copilot' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'copilot' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'copilot' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>

          <button
            id="tab-qa-test-studio"
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'qa'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'qa' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'qa' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'qa' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="flex items-center gap-1">
              3-Tier QA Studio
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">100% PASS</span>
            </span>
          </button>

          <button
            id="tab-rest-api-explorer"
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'api'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'api' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'api' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'api' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <Terminal className="w-4 h-4" />
            <span>REST API</span>
          </button>

          <button
            id="tab-documentation-viewer"
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'docs'
                ? 'shadow-xs'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'docs' ? `${currentTheme.accent}20` : 'transparent',
              color: activeTab === 'docs' ? currentTheme.accent : currentTheme.textPrimary,
              borderBottom: activeTab === 'docs' ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Docs & Roadmap</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
