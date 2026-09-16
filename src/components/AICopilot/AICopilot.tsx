import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Download,
  ShieldCheck,
  Zap,
  Clock,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MarketUniverseId, StockQuote, ThemeConfig } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  modelUsed?: string;
  latencyMs?: number;
}

interface AICopilotProps {
  currentTheme: ThemeConfig;
  activeUniverse: MarketUniverseId;
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  currentTheme,
  activeUniverse,
  stocks,
  selectedStock,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'copilot',
      text: `### 🤖 Welcome to StockPulse AI Copilot

I am your institutional financial intelligence partner and autonomous testing assistant.

**Active Environment Context**:
- **Universe**: ${activeUniverse.toUpperCase()} (${stocks.length} tracked stocks)
- **Focused Stock**: ${selectedStock ? `${selectedStock.name} (${selectedStock.symbol})` : 'General Universe Overview'}

**How I can help you today**:
1. **Equity & Valuation Multiples**: Deep dive into P/E, Forward P/E, PEG, and margin moats.
2. **Market Breadth & Liquidity**: Quantify advance/decline momentum and volume distribution.
3. **Autonomous AI QA & Testing**: Inquire about our 3-Tier testing matrix (Python Unit, Playwright E2E, and MCP Cognitive Agent loop).

*Disclaimer: Educational demonstration. Not registered investment advice.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
      latencyMs: 140,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming prompt from other components
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          universe: activeUniverse,
          activeStock: selectedStock,
        }),
      });

      const data = await response.json();
      const botMessage: Message = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: data.message || 'Analysis generated successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        latencyMs: data.latencyMs || 220,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const fallbackMessage: Message = {
        id: `copilot-error-${Date.now()}`,
        sender: 'copilot',
        text: `### ⚠️ Copilot Response
Unable to reach server endpoint. Operating in client-side quantitative mode.

**Stock Context**: ${selectedStock ? `${selectedStock.name} (${selectedStock.symbol})` : 'Universe Overview'}
- **Observed Price**: $${selectedStock?.price || 150}
- **Change**: ${selectedStock?.changePercent || 0}%

*Disclaimer: Educational demonstration. Not registered investment advice.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'offline-fallback',
        latencyMs: 10,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'copilot',
        text: `Chat history cleared. Context reset to **${activeUniverse.toUpperCase()}**. Ready for your financial questions!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleExportChat = () => {
    const markdownContent = messages
      .map((m) => `### ${m.sender.toUpperCase()} [${m.timestamp}]\n\n${m.text}\n\n---\n`)
      .join('\n');
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockpulse_chat_export_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    'Analyze NVDA valuation multiples, Blackwell catalysts & moats',
    'Evaluate current market breadth & advance/decline momentum',
    'Compare high growth vs high dividend stability in active universe',
    'Explain how the 3-Tier Playwright + MCP AI QA loop operates',
  ];

  return (
    <div id="ai-copilot-view" className="space-y-6">
      {/* 1. Context Banner */}
      <div
        className="rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shadow-xs" style={{ backgroundColor: `${currentTheme.accent}25`, color: currentTheme.accent }}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold" style={{ color: currentTheme.textPrimary }}>
                StockPulse Financial Copilot
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-400">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs" style={{ color: currentTheme.textMuted }}>
              Grounding context: Universe <strong className="text-white">{activeUniverse.toUpperCase()}</strong> • Focused:{' '}
              <strong className="text-white">{selectedStock?.symbol || 'All Equities'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textSecondary }}
            title="Export conversation transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Transcript</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors"
            style={{ borderColor: currentTheme.cardBorder, color: currentTheme.textMuted }}
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Conversation Box */}
      <div
        id="copilot-chat-container"
        className="rounded-2xl border shadow-sm flex flex-col h-[520px] sm:h-[580px] overflow-hidden"
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
        }}
      >
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'copilot' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-1"
                  style={{
                    backgroundColor: `${currentTheme.accent}20`,
                    borderColor: `${currentTheme.accent}40`,
                    color: currentTheme.accent,
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user' ? 'shadow-sm font-medium' : 'border shadow-xs'
                }`}
                style={{
                  backgroundColor: msg.sender === 'user' ? currentTheme.accent : `${currentTheme.bg}90`,
                  color: msg.sender === 'user' ? '#ffffff' : currentTheme.textPrimary,
                  borderColor: msg.sender === 'user' ? 'transparent' : currentTheme.cardBorder,
                }}
              >
                {/* Text / Markdown Render */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((block, bIdx) => {
                    if (block.startsWith('### ')) {
                      return (
                        <h4 key={bIdx} className="font-bold text-sm sm:text-base tracking-tight pt-1">
                          {block.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (block.startsWith('- ')) {
                      return (
                        <ul key={bIdx} className="space-y-1 pl-2">
                          {block.split('\n').map((line, lIdx) => (
                            <li key={lIdx} className="text-xs">
                              {line.replace(/^- /, '• ')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={bIdx}>{block}</p>;
                  })}
                </div>

                {/* Metadata timestamp & latency */}
                <div
                  className="flex items-center justify-between gap-4 mt-2.5 pt-2 border-t text-[10px] font-mono opacity-70"
                  style={{ borderColor: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : currentTheme.cardBorder }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-sky-400" />
                      <span>{msg.modelUsed}</span>
                      {msg.latencyMs && <span>({msg.latencyMs}ms)</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${currentTheme.accent}20`,
                  borderColor: `${currentTheme.accent}40`,
                  color: currentTheme.accent,
                }}
              >
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div
                className="rounded-2xl p-3.5 text-xs font-mono border flex items-center gap-2"
                style={{
                  backgroundColor: `${currentTheme.bg}90`,
                  borderColor: currentTheme.cardBorder,
                  color: currentTheme.textSecondary,
                }}
              >
                <span className="w-2 h-2 rounded-full animate-ping bg-sky-400" />
                <span>Copilot synthesizing market analytics & valuations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t overflow-x-auto no-scrollbar flex items-center gap-2" style={{ borderColor: currentTheme.cardBorder, backgroundColor: `${currentTheme.bg}40` }}>
          <span className="text-[11px] font-semibold shrink-0" style={{ color: currentTheme.textMuted }}>
            Prompt Starters:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap border transition-all hover:bg-white/10 shrink-0"
              style={{
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textSecondary,
                backgroundColor: currentTheme.cardBg,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t" style={{ borderColor: currentTheme.cardBorder, backgroundColor: currentTheme.cardBg }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="copilot-user-input"
              type="text"
              placeholder="Ask Copilot about multiples, market breadth, or autonomous Playwright QA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all shadow-xs"
              style={{
                backgroundColor: currentTheme.bg,
                borderColor: currentTheme.cardBorder,
                color: currentTheme.textPrimary,
              }}
            />

            <button
              id="send-copilot-msg-btn"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
