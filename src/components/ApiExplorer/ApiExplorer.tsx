import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Check,
  Copy,
  Layers,
  Code,
  Zap,
  Globe,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { ThemeConfig } from '../../types';

interface ApiExplorerProps {
  currentTheme: ThemeConfig;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultParams?: Record<string, string>;
  defaultBody?: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    description: 'Health check, service capabilities, node version, and uptime',
  },
  {
    id: 'universes',
    method: 'GET',
    path: '/api/v1/universes',
    description: 'Retrieve metadata and constituent counts for all 7 market universes',
  },
  {
    id: 'quotes',
    method: 'GET',
    path: '/api/v1/quotes',
    description: 'Fetch live quotes and calculate market breadth for an active universe',
    defaultParams: { universe: 'global-megacaps' },
  },
  {
    id: 'research',
    method: 'GET',
    path: '/api/v1/research',
    description: 'Fetch deep balance sheet stability, valuation multiples, and price targets',
    defaultParams: { symbol: 'NVDA' },
  },
  {
    id: 'chat',
    method: 'POST',
    path: '/api/v1/chat',
    description: 'AI Financial Copilot conversational query with market context',
    defaultBody: JSON.stringify(
      {
        message: 'Analyze NVDA valuation multiples and Blackwell architecture catalysts',
        universe: 'global-megacaps',
      },
      null,
      2
    ),
  },
  {
    id: 'tests-unit',
    method: 'GET',
    path: '/api/v1/tests/unit',
    description: 'Retrieve 41 Python unit & integration test results',
  },
  {
    id: 'tests-playwright',
    method: 'GET',
    path: '/api/v1/tests/playwright',
    description: 'Retrieve 16 Playwright E2E test specs and execution status',
  },
  {
    id: 'tests-scenarios',
    method: 'GET',
    path: '/api/v1/tests/scenarios',
    description: 'Retrieve 3 Autonomous AI QA agent capstone scenarios',
  },
];

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ currentTheme }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>(selectedEndpoint.defaultParams || {});
  const [body, setBody] = useState<string>(selectedEndpoint.defaultBody || '');
  const [responseJson, setResponseJson] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setParams(ep.defaultParams || {});
    setBody(ep.defaultBody || '');
    setResponseJson(null);
    setStatusCode(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      let url = selectedEndpoint.path;
      if (selectedEndpoint.method === 'GET' && Object.keys(params).length > 0) {
        const queryStr = new URLSearchParams(params).toString();
        url += `?${queryStr}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (selectedEndpoint.method === 'POST' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setStatusCode(res.status);
      setResponseJson(data);
    } catch (err: any) {
      setStatusCode(500);
      setResponseJson({ error: err.message || 'Network error' });
    } finally {
      setLatency(Math.round(performance.now() - start));
      setIsLoading(false);
    }
  };

  const generateCurlCommand = () => {
    let url = `${window.location.origin}${selectedEndpoint.path}`;
    if (selectedEndpoint.method === 'GET' && Object.keys(params).length > 0) {
      const queryStr = new URLSearchParams(params).toString();
      url += `?${queryStr}`;
    }

    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${url}" \\
  -H "Accept: application/json"`;
    } else {
      return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${body.replace(/\n/g, '')}'`;
    }
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div id="rest-api-explorer-view" className="space-y-6">
      {/* Overview Banner */}
      <div
        className="rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shadow-xs" style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}>
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                Interactive REST API Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                Live Server
              </span>
            </div>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              Execute live HTTP calls directly against the StockPulse Express engine
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCurl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border hover:bg-white/10 transition-colors"
          style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
        >
          {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCurl ? 'cURL Copied!' : 'Copy cURL Snippet'}</span>
        </button>
      </div>

      {/* Main Grid: Endpoint Selector on Left, Request/Response on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint Selector List */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: currentTheme.textMuted }}>
            Available Endpoints ({ENDPOINTS.length})
          </div>
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                  isSelected ? 'shadow-md ring-2' : 'hover:bg-white/5 opacity-80'
                }`}
                style={{
                  backgroundColor: isSelected ? `${currentTheme.accent}15` : currentTheme.cardBg,
                  borderColor: isSelected ? currentTheme.accent : currentTheme.cardBorder,
                  ...(isSelected ? { ringColor: currentTheme.accent } : {}),
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                      ep.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: currentTheme.textPrimary }}>
                    {ep.path}
                  </span>
                </div>
                <p className="text-[11px] line-clamp-1" style={{ color: currentTheme.textMuted }}>
                  {ep.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Request Formulation & JSON Response */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5 sm:p-6 shadow-sm space-y-4"
          style={{
            backgroundColor: currentTheme.cardBg,
            borderColor: currentTheme.cardBorder,
          }}
        >
          {/* Request Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: currentTheme.cardBorder }}>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span
                className={`px-2 py-1 rounded font-bold ${
                  selectedEndpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="font-bold text-sm" style={{ color: currentTheme.textPrimary }}>
                {selectedEndpoint.path}
              </span>
            </div>

            <button
              id="execute-api-call-btn"
              onClick={handleExecute}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform hover:scale-102 disabled:opacity-50"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Sending...' : 'Execute Request'}</span>
            </button>
          </div>

          {/* Parameters or Body Input */}
          {selectedEndpoint.method === 'GET' && Object.keys(params).length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                Query Parameters
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(params).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs font-mono w-24 shrink-0" style={{ color: currentTheme.textMuted }}>
                      {key}:
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border outline-none"
                      style={{
                        backgroundColor: currentTheme.bg,
                        borderColor: currentTheme.cardBorder,
                        color: currentTheme.textPrimary,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedEndpoint.method === 'POST' && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                Request Body (JSON)
              </div>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-mono border outline-none resize-none"
                style={{
                  backgroundColor: currentTheme.bg,
                  borderColor: currentTheme.cardBorder,
                  color: currentTheme.textPrimary,
                }}
              />
            </div>
          )}

          {/* Response Box */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textSecondary }}>
                Server Response
              </span>
              {statusCode !== null && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                  {latency !== null && <span style={{ color: currentTheme.textMuted }}>{latency}ms</span>}
                </div>
              )}
            </div>

            <div
              className="p-4 rounded-xl bg-black/60 border font-mono text-xs max-h-72 overflow-y-auto"
              style={{ borderColor: currentTheme.cardBorder }}
            >
              {responseJson ? (
                <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(responseJson, null, 2)}
                </pre>
              ) : (
                <span style={{ color: currentTheme.textMuted }}>
                  Click "Execute Request" to test endpoint live and view server JSON output.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
