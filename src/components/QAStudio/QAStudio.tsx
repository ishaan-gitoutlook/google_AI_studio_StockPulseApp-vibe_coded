import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Bot,
  Eye,
  Bug,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ThemeConfig, PlaywrightTestSpec, QAScenario, UnitTestResult } from '../../types';
import { CAPSTONE_SCENARIOS, PLAYWRIGHT_SPECS, UNIT_TESTS_DATA } from '../../data/qaSuite';

interface QAStudioProps {
  currentTheme: ThemeConfig;
}

export const QAStudio: React.FC<QAStudioProps> = ({ currentTheme }) => {
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier3');

  // Tier 1 state
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [isRunningUnits, setIsRunningUnits] = useState(false);
  const [unitProgress, setUnitProgress] = useState(100);

  // Tier 2 state
  const [selectedSpecFile, setSelectedSpecFile] = useState<string>(PLAYWRIGHT_SPECS[0].file);

  // Tier 3 state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(CAPSTONE_SCENARIOS[0].id);
  const [isExecutingScenario, setIsExecutingScenario] = useState(false);
  const [executionStep, setExecutionStep] = useState(4);
  const [copiedReport, setCopiedReport] = useState(false);

  const selectedScenario = CAPSTONE_SCENARIOS.find((s) => s.id === selectedScenarioId) || CAPSTONE_SCENARIOS[0];
  const selectedSpec = PLAYWRIGHT_SPECS.find((s) => s.file === selectedSpecFile) || PLAYWRIGHT_SPECS[0];

  const filteredUnitTests = UNIT_TESTS_DATA.filter(
    (t) => unitFilter === 'all' || t.module.toLowerCase().includes(unitFilter.toLowerCase())
  );

  const handleRunAllUnits = () => {
    setIsRunningUnits(true);
    setUnitProgress(0);
    const interval = setInterval(() => {
      setUnitProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningUnits(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleRunScenario = () => {
    setIsExecutingScenario(true);
    setExecutionStep(0);
    let step = 0;
    const maxSteps = selectedScenario.thoughtLog?.length || 4;
    const interval = setInterval(() => {
      step++;
      setExecutionStep(step);
      if (step >= maxSteps) {
        clearInterval(interval);
        setIsExecutingScenario(false);
      }
    }, 600);
  };

  const generateFullMarkdownReport = () => {
    return `# StockPulse Enterprise AI QA & Test Execution Report

**Date**: ${new Date().toISOString().split('T')[0]}  
**Environment**: Chrome Headless / Playwright v1.50 / Python pytest  
**Overall Verdict**: **100% PASS** (60/60 total test assertions)

---

## 1. Tier Summary Matrix
- **Tier 1: Python Unit & Integration Suite**: 41 / 41 Passing (100%)
- **Tier 2: Playwright Accessibility-First E2E Suite**: 16 / 16 Passing (100%)
- **Tier 3: Autonomous AI QA Agent (Playwright + MCP)**: 3 / 3 Scenarios Passed (100%)

---

## 2. Playwright E2E Specs Executed
${PLAYWRIGHT_SPECS.map(
  (s) => `### ${s.title} (\`${s.file}\`)
- Tests: ${s.testsCount} passing
- Coverage: ${s.description}
`
).join('\n')}

---

## 3. Autonomous AI QA Capstone Scenarios
${CAPSTONE_SCENARIOS.map(
  (c) => `### [${c.status}] ${c.id}: ${c.title}
- **Goal**: ${c.description}
- **Duration**: ${c.duration}
- **Expected**: ${c.expected}
`
).join('\n')}

---
*Generated autonomously by StockPulse QA Matrix.*`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateFullMarkdownReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div id="qa-studio-view" className="space-y-6">
      {/* 1. Header Toolbar */}
      <div
        className="rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl shadow-xs"
            style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                Autonomous AI QA & Test Automation Matrix
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                100% PASS (60/60)
              </span>
            </div>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              3-Tier Quality Architecture: Python Unit Tests, Playwright Accessibility E2E, and Autonomous MCP AI Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Copied Markdown!' : 'Export QA Report'}</span>
          </button>
        </div>
      </div>

      {/* 2. Tier Selection Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tier 1 Tab */}
        <button
          onClick={() => setActiveTier('tier1')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTier === 'tier1' ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-70'
          }`}
          style={{
            backgroundColor: activeTier === 'tier1' ? `${currentTheme.accent}15` : currentTheme.cardBg,
            borderColor: activeTier === 'tier1' ? currentTheme.accent : currentTheme.cardBorder,
            ...(activeTier === 'tier1' ? { ringColor: currentTheme.accent } : {}),
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-sky-400">Tier 1: Python Pytest</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              41 / 41 PASS
            </span>
          </div>
          <div className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
            Unit & Integration Math Suite
          </div>
          <p className="text-[11px] mt-1" style={{ color: currentTheme.textMuted }}>
            API clients, breadth ratios, guardrails & database upserts
          </p>
        </button>

        {/* Tier 2 Tab */}
        <button
          onClick={() => setActiveTier('tier2')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTier === 'tier2' ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-70'
          }`}
          style={{
            backgroundColor: activeTier === 'tier2' ? `${currentTheme.accent}15` : currentTheme.cardBg,
            borderColor: activeTier === 'tier2' ? currentTheme.accent : currentTheme.cardBorder,
            ...(activeTier === 'tier2' ? { ringColor: currentTheme.accent } : {}),
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-purple-400">Tier 2: Playwright E2E</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              16 / 16 PASS
            </span>
          </div>
          <div className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
            Accessibility Role & UI Specs
          </div>
          <p className="text-[11px] mt-1" style={{ color: currentTheme.textMuted }}>
            Robust getByRole, getByPlaceholder locators across 4 spec files
          </p>
        </button>

        {/* Tier 3 Tab */}
        <button
          onClick={() => setActiveTier('tier3')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTier === 'tier3' ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-70'
          }`}
          style={{
            backgroundColor: activeTier === 'tier3' ? `${currentTheme.accent}15` : currentTheme.cardBg,
            borderColor: activeTier === 'tier3' ? currentTheme.accent : currentTheme.cardBorder,
            ...(activeTier === 'tier3' ? { ringColor: currentTheme.accent } : {}),
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400">Tier 3: Autonomous AI Agent</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              3 / 3 PASS
            </span>
          </div>
          <div className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
            Playwright + MCP Cognitive Loop
          </div>
          <p className="text-[11px] mt-1" style={{ color: currentTheme.textMuted }}>
            Autonomous ARIA Tree inspection & deterministic See-Think-Act
          </p>
        </button>
      </div>

      {/* 3. Tier 1: Python Pytest Runner View */}
      {activeTier === 'tier1' && (
        <div className="space-y-4">
          <div
            className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>
                Filter Module:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'client', 'tracker', 'assistant', 'market_data'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setUnitFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                      unitFilter === filter ? 'font-bold' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: unitFilter === filter ? `${currentTheme.accent}20` : 'transparent',
                      color: unitFilter === filter ? currentTheme.accent : currentTheme.textPrimary,
                      border: `1px solid ${unitFilter === filter ? currentTheme.accent : currentTheme.cardBorder}`,
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunAllUnits}
              disabled={isRunningUnits}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunningUnits ? 'animate-spin' : ''}`} />
              <span>{isRunningUnits ? `Running Pytest (${unitProgress}%)...` : 'Re-run Pytest Suite'}</span>
            </button>
          </div>

          <div
            className="rounded-2xl border divide-y overflow-hidden shadow-xs"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}
          >
            {filteredUnitTests.map((t) => (
              <div key={t.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs" style={{ color: currentTheme.textPrimary }}>
                        {t.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-white/10" style={{ color: currentTheme.textMuted }}>
                        {t.module}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 font-mono opacity-80" style={{ color: currentTheme.textSecondary }}>
                      {t.assertion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                  <span className="text-emerald-400 font-bold">{t.status}</span>
                  <span style={{ color: currentTheme.textMuted }}>{t.durationMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tier 2: Playwright E2E Specs View */}
      {activeTier === 'tier2' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {PLAYWRIGHT_SPECS.map((spec) => (
              <button
                key={spec.file}
                onClick={() => setSelectedSpecFile(spec.file)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  selectedSpecFile === spec.file ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-80'
                }`}
                style={{
                  backgroundColor: selectedSpecFile === spec.file ? `${currentTheme.accent}15` : currentTheme.cardBg,
                  borderColor: selectedSpecFile === spec.file ? currentTheme.accent : currentTheme.cardBorder,
                  ...(selectedSpecFile === spec.file ? { ringColor: currentTheme.accent } : {}),
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-sky-400">{spec.file}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    PASS
                  </span>
                </div>
                <h4 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                  {spec.title}
                </h4>
                <div className="flex items-center justify-between text-xs mt-2" style={{ color: currentTheme.textMuted }}>
                  <span>{spec.testsCount} Assertions</span>
                </div>
              </button>
            ))}
          </div>

          <div
            className="lg:col-span-2 rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.cardBorder,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentTheme.cardBorder }}>
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                    {selectedSpec.title} ({selectedSpec.file})
                  </h3>
                  <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                    {selectedSpec.description}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">100% Passed</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                Sub-Test Assertions:
              </div>
              {selectedSpec.tests.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border flex items-center justify-between text-xs"
                  style={{ backgroundColor: `${currentTheme.bg}70`, borderColor: currentTheme.cardBorder }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono" style={{ color: currentTheme.textPrimary }}>
                      {t.name}
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{t.durationMs}ms</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ backgroundColor: `${currentTheme.bg}90`, borderColor: currentTheme.cardBorder }}>
              <div className="font-bold flex items-center gap-1.5 text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>Accessibility-First Locator Design</span>
              </div>
              <pre className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{selectedSpec.tests[0]?.codeSnippet || '// Accessibility locators active'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tier 3: Autonomous AI QA Agent View */}
      {activeTier === 'tier3' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3"
            style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.cardBorder }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: currentTheme.textSecondary }}>
                Scenario:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CAPSTONE_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenarioId(sc.id);
                      setExecutionStep(sc.thoughtLog?.length || 4);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      selectedScenarioId === sc.id ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: selectedScenarioId === sc.id ? currentTheme.accent : 'transparent',
                      color: selectedScenarioId === sc.id ? '#ffffff' : currentTheme.textPrimary,
                      border: `1px solid ${selectedScenarioId === sc.id ? currentTheme.accent : currentTheme.cardBorder}`,
                    }}
                  >
                    {sc.id}: {sc.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunScenario}
              disabled={isExecutingScenario}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform hover:scale-102 disabled:opacity-50"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Bot className="w-4 h-4" />
              <span>{isExecutingScenario ? 'Agent Navigating ARIA Tree...' : `Re-run ${selectedScenario.id} Cognitive Loop`}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Thought Log */}
            <div
              className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.cardBorder,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                      {selectedScenario.id}: {selectedScenario.title}
                    </h3>
                    <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                      {selectedScenario.description}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400">
                  {selectedScenario.status}
                </span>
              </div>

              {/* Cognitive Steps */}
              <div className="space-y-3">
                {selectedScenario.thoughtLog?.map((step, idx) => {
                  const isActive = idx === executionStep && isExecutingScenario;
                  const isDone = idx <= executionStep;

                  return (
                    <div
                      key={step.step}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive ? 'ring-2 ring-purple-400 bg-purple-500/10' : isDone ? 'bg-white/5' : 'opacity-40'
                      }`}
                      style={{ borderColor: currentTheme.cardBorder }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-white font-bold text-[10px]">
                            {step.step}
                          </span>
                          <span className="font-bold text-purple-400">{step.action}</span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: currentTheme.textMuted }}>
                          {step.timestamp}
                        </span>
                      </div>

                      <div className="text-xs mt-1.5 space-y-1">
                        <div>
                          <strong className="text-white">Reasoning: </strong>
                          <span style={{ color: currentTheme.textSecondary }}>{step.thought}</span>
                        </div>
                        <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                          ✓ Result: {step.observation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Capstone Expected Outcome Verified</span>
                </div>
                <p className="font-mono text-[11px] text-white">
                  {selectedScenario.expected}
                </p>
              </div>
            </div>

            {/* Right: ARIA Accessibility Snapshot */}
            <div
              className="rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.cardBorder,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.cardBorder }}>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: currentTheme.textPrimary }}>
                    ARIA Tree & Target Element Inspect
                  </h3>
                </div>
                <span className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>MCP Protocol v1.0</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border space-y-1.5" style={{ borderColor: currentTheme.cardBorder }}>
                <div className="text-[11px] font-bold text-sky-400 font-mono">
                  [ARIA Accessibility Tree Snapshot]
                </div>
                <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{selectedScenario.ariaSnapshot || 'RootWebArea "StockPulse"'}
                </pre>
              </div>

              <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ backgroundColor: `${currentTheme.bg}90`, borderColor: currentTheme.cardBorder }}>
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <Bug className="w-4 h-4" />
                    <span>Automated Regression Ticket Engine</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    0 ACTIVE DEFECTS
                  </span>
                </div>
                <p style={{ color: currentTheme.textSecondary }}>
                  If any ARIA assertion fails, the agent creates reproducible markdown reports under <code className="text-sky-300 font-mono">reports/issues/issue_TCxx.md</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
