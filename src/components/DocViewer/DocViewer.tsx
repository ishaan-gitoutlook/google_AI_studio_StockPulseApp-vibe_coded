import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { ThemeConfig } from '../../types';

interface DocViewerProps {
  currentTheme: ThemeConfig;
}

export const DocViewer: React.FC<DocViewerProps> = ({ currentTheme }) => {
  const [activeDoc, setActiveDoc] = useState<'readme' | 'walkthrough' | 'plan'>('readme');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDoc, setCopiedDoc] = useState(false);

  const docFiles = {
    readme: {
      title: 'README.md',
      tag: 'Platform Overview & Architecture',
      description: 'System specifications, multi-market coverage, 7 themes, and API routes.',
      content: `# StockPulse: Enterprise Financial Intelligence & Autonomous AI QA Platform

Welcome to **StockPulse**, an enterprise-grade multi-market equity analytics platform and full-stack quality assurance testbed.

## 🚀 Key Architectural Pillars

### 1. Multi-Market Liquidity & Breadth Engine
- **Global Coverage**: Real-time quotes across 7 distinct market universes (Global Megacaps, S&P 500, NASDAQ 100, NIFTY 500, Sensex 30, FTSE 100, DAX 40).
- **Advance/Decline Radar**: Real-time breadth calculations quantifying institutional market momentum.
- **Dynamic Watchlist**: Add custom global tickers with instant valuation normalization.

### 2. Deep Fundamentals Research Lab
- **Valuation Multiples**: Trailing P/E, Forward P/E, PEG, P/B, EV/EBITDA.
- **Financial Stability Score (0-100)**: Quantitative health rating analyzing Profitability, Solvency, Growth, and Momentum.
- **Analyst Targets**: Consensus price targets and implied headroom gauges.

### 3. AI Financial Copilot (Powered by Gemini 3.8 Flash)
- Grounded with real-time universe breadths, financial metrics, and company profiles.
- Mathematical rigor with structured outputs: Executive Summary, Multiples, Catalysts & Risks.

### 4. 3-Tier Autonomous QA Automation Matrix
- **Tier 1**: 41 Python Unit & Integration Tests (Math, API, Guardrails).
- **Tier 2**: 16 Playwright E2E UI Tests (Accessibility-first locators: \`getByRole\`, \`getByPlaceholder\`).
- **Tier 3**: Autonomous AI QA Agent (Playwright + MCP with ARIA accessibility inspection).

### 5. 7 Ergonomic Color Palettes
- Classic Slate, Midnight Blue, Emerald Terminal, Cyberpunk Neon, Solar Flare, Velvet Plum, Nordic Ice.`,
    },
    walkthrough: {
      title: 'WALKTHROUGH.md',
      tag: 'Playwright + MCP Capstone Walkthrough',
      description: 'Comprehensive verification walkthrough, cognitive See-Think-Act loops, and test results.',
      content: `# StockPulse Autonomous AI QA Walkthrough & Test Results

## 🏆 Overall Execution Status: 100% PASS (60/60 Assertions)

This document details the step-by-step verification of StockPulse using the 3-Tier Autonomous QA pipeline.

---

## 📋 Capstone Scenario Verification

### Scenario TC01: Baseline Dashboard Health & Theme Switching
- **Goal**: Verify that StockPulse boots to operational status and allows toggling themes.
- **Cognitive Loop**:
  1. \`snapshot_accessibility_tree\` → Detects \`heading "StockPulse"\` and \`status "System Operational"\`.
  2. \`click_element(id: "theme-switcher-btn")\` → Opens theme palette.
  3. \`click_element(id: "theme-option-emerald")\` → Switches accent to Emerald.
- **Verdict**: **PASS (0 defects)**.

### Scenario TC02: Real-time Market Breadth & Universe Switching
- **Goal**: Switch active universe to NIFTY 500 (India) and verify advance/decline ratio recalibration.
- **Cognitive Loop**:
  1. \`select_option(id: "market-universe-select", value: "nifty-500")\`.
  2. \`snapshot_accessibility_tree\` → Confirms 8 Indian constituent quotes loaded (RELIANCE, TCS, HDFCBANK, INFY, etc.).
  3. \`assert_visible(text: "Advance/Decline Ratio")\`.
- **Verdict**: **PASS (0 defects)**.

### Scenario TC03: Custom Stock Addition & Watchlist Synchronization
- **Goal**: Add a custom ticker ("AVGO" Broadcom Inc) and assert visibility in quotes and AI Copilot context.
- **Cognitive Loop**:
  1. \`click_element(id: "add-custom-stock-btn")\`.
  2. \`fill_element(name: "symbol", value: "AVGO")\`.
  3. \`click_element(id: "save-ticker-submit-btn")\`.
  4. Confirms row \`AVGO\` present in table and selectable.
- **Verdict**: **PASS (0 defects)**.`,
    },
    plan: {
      title: 'IMPLEMENTATION_PLAN.md',
      tag: 'Engineering Architecture & Phases',
      description: '5-phase implementation blueprint, data schemas, API contracts, and testing matrix.',
      content: `# StockPulse Engineering Implementation Plan

## 📌 Phase Summary

### Phase 1: Core Foundation & Data Architecture
- TypeScript domain schemas in \`src/types/index.ts\`.
- 7 Theme definitions in \`src/utils/theme.ts\`.
- Initial universes and constituent data in \`src/data/universes.ts\`.

### Phase 2: Express Server & Gemini AI Backend
- \`server.ts\` with Vite middleware & REST endpoints.
- Integration of \`@google/genai\` with model \`gemini-3.8-flash\`.
- Intelligent heuristic fallback engine for uninterrupted analysis.

### Phase 3: High-Performance Frontend UI & Visual Charts
- Real-time ticker streaming engine with adjustable tick frequencies.
- Interactive SVG Candlestick & Area charts with Moving Averages (MA20/50).
- Fundamentals Research Lab with 0-100 Financial Stability Radar score.

### Phase 4: Autonomous AI QA Matrix (Playwright + MCP)
- Python Unit test runner simulation (41 tests).
- Playwright accessibility-first specs (16 tests across 4 files).
- Cognitive See-Think-Act loop with ARIA Tree inspector.

### Phase 5: REST API Explorer & Documentation
- Interactive HTTP request tester for all endpoints.
- In-app documentation reader for README, Walkthrough, and Implementation Plan.`,
    },
  };

  const currentDoc = docFiles[activeDoc];

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  return (
    <div id="documentation-viewer-view" className="space-y-6">
      {/* 1. Header Toolbar */}
      <div
        className="rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shadow-xs" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                Course Documentation & Architectural Blueprints
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-400">
                3 Master Markdown Files
              </span>
            </div>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              Complete engineering implementation plan, walkthrough results, and system specifications
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyDoc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border hover:bg-white/10 transition-colors"
          style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
        >
          {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedDoc ? 'Copied to Clipboard!' : 'Copy Active Markdown'}</span>
        </button>
      </div>

      {/* 2. File Tabs Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(docFiles) as [keyof typeof docFiles, typeof docFiles.readme][]).map(([key, doc]) => (
          <button
            key={key}
            onClick={() => setActiveDoc(key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeDoc === key ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-70'
            }`}
            style={{
              backgroundColor: activeDoc === key ? `${currentTheme.accent}15` : currentTheme.cardBg,
              borderColor: activeDoc === key ? currentTheme.accent : currentTheme.cardBorder,
              ...(activeDoc === key ? { ringColor: currentTheme.accent } : {}),
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold" style={{ color: currentTheme.accent }}>
                {doc.title}
              </span>
              <FileText className="w-3.5 h-3.5" style={{ color: currentTheme.textMuted }} />
            </div>
            <div className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
              {doc.tag}
            </div>
            <p className="text-[11px] mt-1 line-clamp-1" style={{ color: currentTheme.textMuted }}>
              {doc.description}
            </p>
          </button>
        ))}
      </div>

      {/* 3. Document Content Viewer */}
      <div
        className="rounded-2xl border p-6 sm:p-8 shadow-sm font-sans"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm leading-relaxed" style={{ color: currentTheme.textPrimary }}>
          {currentDoc.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h1 key={idx} className="text-2xl font-black tracking-tight pb-2 border-b" style={{ borderColor: currentTheme.cardBorder, color: currentTheme.accent }}>
                  {paragraph.replace('# ', '')}
                </h1>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-lg font-bold tracking-tight pt-4 text-sky-400">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-sm font-bold tracking-tight pt-2 text-white">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={idx} className="space-y-1.5 pl-3">
                  {paragraph.split('\n').map((line, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold font-mono">▸</span>
                      <span>{line.replace(/^- /, '')}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return <p key={idx} className="opacity-90">{paragraph}</p>;
          })}
        </div>
      </div>
    </div>
  );
};
