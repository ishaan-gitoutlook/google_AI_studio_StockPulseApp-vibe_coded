# 📈 StockPulse — Enterprise Financial Intelligence & AI QA Platform

[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38b2ac.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-f9a03c.svg?logo=d3.js&logoColor=white)](https://d3js.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 2.5](https://img.shields.io/badge/AI%20Copilot-Gemini%202.5%20Flash-8e75ff.svg?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-ffca28.svg?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Playwright](https://img.shields.io/badge/Playwright-v1.49%2B-45ba4b.svg?logo=playwright&logoColor=white)](https://playwright.dev/)

**StockPulse** is a modern, production-grade financial tracking ecosystem, market intelligence dashboard, and autonomous QA testing platform. It combines a high-performance **React 19** single-page application, an optimized **Express (Node.js)** backend with in-memory caching and compression, a resilient **Python FastAPI** analytics service, **D3.js** data visualizations, **Google Gemini 2.5 Flash** with Google Search Grounding, and a **3-Tier QA Testing Architecture** (Unit, Playwright E2E, and Autonomous MCP AI Agent).

---

## 📑 Table of Contents

- [🏛️ System Architecture](#️-system-architecture)
- [✨ Key Capabilities](#-key-capabilities)
  - [1. Multi-Market Watchlists & Global Universes](#1-multi-market-watchlists--global-universes)
  - [2. High-Performance Quotes Matrix & Sparklines](#2-high-performance-quotes-matrix--sparklines)
  - [3. D3.js Sector Treemap & Breadth Distribution](#3-d3js-sector-treemap--breadth-distribution)
  - [4. In-Depth Fundamentals Research](#4-in-depth-fundamentals-research)
  - [5. AI Financial Copilot (Gemini 2.5 Flash)](#5-ai-financial-copilot-gemini-25-flash)
  - [6. QA Studio (Integrated In-Browser Test Runner)](#6-qa-studio-integrated-in-browser-test-runner)
  - [7. Interactive API Explorer & Doc Viewer](#7-interactive-api-explorer--doc-viewer)
  - [8. 7 Ergonomic Color Palettes](#8-7-ergonomic-color-palettes)
- [⚡ Performance & Optimization Highlights](#-performance--optimization-highlights)
- [🤖 3-Tier Testing & QA Suite](#-3-tier-testing--qa-suite)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Quick Start (Local Setup)](#-quick-start-local-setup)
- [🌐 REST API Reference](#-rest-api-reference)
- [⚙️ Configuration & Environment Variables](#️-configuration--environment-variables)
- [🔧 Troubleshooting & FAQ](#-troubleshooting--faq)
- [📄 Educational Disclaimer](#-educational-disclaimer)

---

## 🏛️ System Architecture

StockPulse is designed around an enterprise microservices pattern with built-in client failover, caching, and background resource conservation:

```
┌────────────────────────────────────────────────────────────────────────┐
│               REACT 19 + VITE SINGLE PAGE APPLICATION                  │
│                        (http://localhost:3000)                         │
│                                                                        │
│   Market Tracker            Fundamentals Research     AI Copilot       │
│   - Quotes Matrix (Table/Card) - Valuation & Margins   - Gemini 2.5     │
│   - Precomputed Sparklines     - Balance Sheet        - Search Ground  │
│   - D3 Sector Treemap          - Persistent Notes     - Disclaimers    │
│   - D3 Breadth Distribution                                            │
│                                                                        │
│   QA Studio                 API Explorer              Doc Viewer       │
│   - 41 Automated Tests      - Live Request Console    - Markdown Docs  │
│   - Duration & Logs         - Curl Snippets           - Zero Tab Jump  │
│                                                                        │
│   State & Performance Engines:                                         │
│   - Page Visibility API (Idle Tab Throttling)                          │
│   - React.memo Rows (~96% fewer render cycles on live ticks)           │
│   - In-Place D3 DOM Transitions (Zero canvas destruction)              │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
         HTTP / REST│ (Express Core API)            │ Secondary / Analytics
                    ▼                               ▼
┌────────────────────────────────────────┐  ┌────────────────────────────┐
│      CORE NODE.JS EXPRESS BACKEND      │  │   PYTHON FASTAPI BACKEND   │
│         (server.ts / dist/server.mjs)  │  │     (backend/ :8000)       │
│   - HTTP Gzip / Brotli Compression     │  │   - Pydantic v2 Models     │
│   - In-Memory Bounded Research Cache   │  │   - 41/41 Unit Assertions  │
│   - Gemini 2.5 Flash Integration       │  │   - Quant Calculations     │
│   - Helmet Security & Rate Limiting    │  └────────────────────────────┘
│   - Static Asset Serving (/dist)       │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL CLOUD SERVICES                         │
│                                                                        │
│   Google AI Studio (Gemini API)     Firebase Cloud Firestore & Auth    │
│   - Gemini 2.5 Flash Model          - Real-Time Synced Watchlists      │
│   - Google Search Grounding Engine  - Cloud Research Notes             │
│   - Gemini 2.0 Flash Fallback       - Google Single Sign-On            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

### 1. Multi-Market Watchlists & Global Universes
Track global indices and market listings with instant switching:
* 🇮🇳 **NIFTY 500 & BSE Sensex 30** (National Stock Exchange of India & Bombay Stock Exchange)
* 🇺🇸 **S&P 500 & NASDAQ 100** (US Large Cap & Tech Leaders)
* 🇬🇧 **FTSE 100** (London Stock Exchange)
* 🇩🇪 **DAX 40** (Deutsche Börse XETRA)
* 🌐 **Global Megacaps** (Apple, Microsoft, Alphabet, Nvidia, Reliance, Amazon, Meta, TSMC)
* ⭐ **Personal Starred Watchlists**: Pin any ticker to your personal watchlist; authenticated users have their list synced in real-time to Cloud Firestore.

### 2. High-Performance Quotes Matrix & Sparklines
* **Dual Presentation Modes**: Switch seamlessly between a high-density, sortable financial tabular view and modular grid cards.
* **Precomputed SVG Sparklines**: Smooth 10-period intraday momentum polylines rendered with zero runtime math overhead.
* **Sector Filtering**: Filter instantly by Technology, Financials, Healthcare, Consumer Goods, Energy, Industrials, Utilities, and Materials.

### 3. D3.js Sector Treemap & Breadth Distribution
* **Sector Treemap**: Squarified hierarchical layout sizing stocks by market capitalization and coloring them dynamically from deep green (+3%) to crimson (-3%). Updates use smooth in-place D3 transitions without tearing down the SVG canvas.
* **Market Breadth Histogram & Advance/Decline Donut**: Visual distribution across return brackets (`<-3%`, `-3% to -1%`, `-1% to +1%`, `+1% to +3%`, `>+3%`) with advance/decline ratio tracking.

### 4. In-Depth Fundamentals Research
* Comprehensive valuation multiples: Trailing P/E, Forward P/E, PEG Ratio, Price-to-Book (P/B), EV/EBITDA, Dividend Yield, and Beta.
* Financial health metrics: Debt-to-Equity, Current Ratio, Operating Margins, Profit Margins, Return on Equity (ROE), and Return on Assets (ROA).
* Interactive markdown research notes attached to each stock symbol.

### 5. AI Financial Copilot (Gemini 2.5 Flash)
* Direct integration with `gemini-2.5-flash` via `@google/genai` SDK.
* Real-time **Google Search Grounding** for latest news, earnings releases, and macro events.
* Multi-tiered fallback resilience: `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ Built-in Rule-Based Quant Heuristics.
* Mandatory risk disclaimers, hallucination prevention guardrails, and one-click financial prompt chips.

### 6. QA Studio (Integrated In-Browser Test Runner)
* Live in-browser execution and status monitoring for all **41 Python unit & integration tests**.
* Displays test categories, execution durations, assertions passed, and test output logs without leaving the dashboard.

### 7. Interactive API Explorer & Doc Viewer
* **API Explorer**: Built-in developer console to test `/health`, `/api/v1/universes`, `/api/v1/quotes`, `/api/v1/research`, `/api/v1/chat`, and `/api/v1/tests/unit`. Includes copyable `curl` and PowerShell snippets, response status badges, and formatted JSON.
* **Doc Viewer**: Embedded markdown document reader rendering the implementation plan and technical specifications directly inside the app.

### 8. 7 Ergonomic Color Palettes
* 🌙 **Midnight Navy**: Default dark mode with slate cards and cyan accents.
* ☀️ **Clean Light**: Glare-free off-white palette for bright daylight environments.
* 🖤 **Obsidian Noir**: High-contrast true black tailored for OLED power conservation.
* 🌲 **Emerald Wealth**: Forest green and gold palette for a classic wealth terminal feel.
* ❄️ **Arctic Frost**: Minimalist cool-steel blue and frosted cyan.
* 🌇 **Crimson Sunset**: Twilight slate with warm coral and amber hues.
* 💻 **Solarized Dark**: Developer classic with low-contrast teal and amber accents.

---

## ⚡ Performance & Optimization Highlights

| Optimization Area | Technique Implemented | Benchmark Result |
| :--- | :--- | :--- |
| **JS Bundle Size** | Rollup `manualChunks` (`vendor-d3`, `vendor-firebase`, `vendor-react`, `vendor-icons`) | **`248.85 kB`** main bundle (**~80% reduction** from `1.23 MB`) |
| **Render Cycles** | `React.memo` row extraction + precomputed sparkline geometry | **~96% fewer component re-renders** across 30+ stocks |
| **D3 Canvas DOM** | In-place attribute and text transitions (`prevLayoutKeyRef`) | **Zero DOM canvas teardowns**; smooth 60 FPS price ticks |
| **Battery / CPU** | Page Visibility API (`document.visibilityState`) | **Live ticks auto-paused** when tab is hidden or minimized |
| **Network Payloads** | Express HTTP Gzip / Brotli `compression` (1KB threshold) | **Up to 75% smaller transfer size** on universe & quote payloads |
| **API Latency** | Bounded in-memory Map cache (`researchCache`) | **<1ms instant cache hits** on repeat research queries |
| **Server ESM** | Switched esbuild target to native ESM (`dist/server.mjs`) | **Zero `import.meta.url` CommonJS build warnings** |

---

## 🤖 3-Tier Testing & QA Suite

StockPulse features a complete, multi-layered quality assurance architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Level 3: Autonomous AI QA Suite (Playwright + MCP + Gemini / Ollama)   │
│          - Natural language YAML scenarios driven by AI Agent          │
│          - Inspects accessibility ARIA tree, outputs pass/fail reports │
├────────────────────────────────────────────────────────────────────────┤
│ Level 2: Playwright End-to-End UI Tests (TypeScript/Node.js)           │
│          - Interactive tests verifying UI rendering, selectors,        │
│            sidebar dynamics, theme switching, and live tick updates    │
├────────────────────────────────────────────────────────────────────────┤
│ Level 1: Python & Vitest Unit Tests                                    │
│          - 41 test cases verifying API endpoints, math calculations,   │
│            data normalization, and fallback heuristics                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Running Tests:

```powershell
# 1. Run TypeScript static typecheck (0 errors)
npm run lint

# 2. Run Python Unit Tests (41/41 passing)
pytest

# 3. Run Playwright E2E Tests (Headless)
npm run test:e2e

# 4. Run Playwright E2E Tests (Headed Browser)
npm run test:e2e:headed
```

---

## 📁 Repository Structure

```
google_AI_studio_StockPulseApp-vibe_coded/
├── src/                               # Frontend React 19 Application
│   ├── components/                    # Modular UI components
│   │   ├── ApiExplorer/               # Interactive REST API console
│   │   ├── DocViewer/                 # In-app markdown documentation reader
│   │   ├── Fundamentals/              # Deep financial ratio & notes view
│   │   ├── MarketTracker/             # Quotes Matrix, D3 Treemap, Breadth widget
│   │   │   ├── BreadthDistributionD3.tsx # D3 Market Breadth visualization
│   │   │   ├── MarketTracker.tsx      # Core tracker controller
│   │   │   ├── QuotesMatrixWidget.tsx # Memoized table & grid cards with sparklines
│   │   │   └── SectorTreemapD3.tsx    # D3 Treemap with in-place DOM transitions
│   │   └── QAStudio/                  # Integrated in-browser test runner
│   ├── lib/                           # Firebase initialization & utilities
│   ├── types/                         # TypeScript interfaces & financial contracts
│   ├── App.tsx                        # Main application container & state orchestration
│   ├── index.css                      # TailwindCSS v4 and 7 ergonomic theme definitions
│   └── main.tsx                       # React DOM entrypoint
├── backend/                           # Python Analytics Microservice
│   └── main.py                        # FastAPI application (Port 8000)
├── server.ts                          # Production Express server (Port 3000)
├── tests/                             # Comprehensive test suites
│   ├── test_api_client.py             # Client unit tests
│   ├── test_assistant.py              # AI assistant guardrail tests
│   ├── test_chat_api.py               # Chat endpoint tests
│   ├── test_market_data.py            # Ingestion & storage tests
│   ├── test_tracker.py                # Quote calculation tests
│   └── e2e/                           # Playwright E2E test specs
├── dist/                              # Production build output
│   ├── assets/                        # Code-split vendor and application chunks
│   └── server.mjs                     # Native ESM compiled Express server
├── package.json                       # Scripts, dependencies, and chunking config
├── vite.config.ts                     # Vite build configuration with Rollup code-splitting
├── tsconfig.json                      # TypeScript strict configuration
├── requirements.txt                   # Python backend dependencies
├── IMPLEMENTATION_PLAN.md             # Enterprise implementation plan & roadmap
├── WALKTHROUGH.md                     # Complete platform walkthrough & verification guide
└── README.md                          # Project documentation
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
* **Node.js**: v18.0 or higher (v20+ recommended)
* **Python**: v3.10 or higher (optional, for the FastAPI backend and test suite)

### 2. Installation

```powershell
# Clone the repository
git clone https://github.com/ishaan-gitoutlook/google_AI_studio_StockPulseApp-vibe_coded.git
cd google_AI_studio_StockPulseApp-vibe_coded

# Install Node.js dependencies
npm install

# (Optional) Setup Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Run the Application

#### Option A: Full Stack Development Mode (Recommended)
```powershell
npm run dev
```
* Spawns the Vite development server with Hot Module Replacement (HMR) and connects to the Express API on port `3000`.

#### Option B: Optimized Production Mode
```powershell
# Build client chunks and compile server.mjs
npm run build

# Start production Express server
npm start
```
* Serves the optimized, chunked SPA and the Express REST API at **`http://localhost:3000`**.

#### Option C: Python FastAPI Microservice
```powershell
uvicorn backend.main:app --reload --port 8000
```
* Starts the Python analytics backend at **`http://localhost:8000`**.

---

## 🌐 REST API Reference

The Express server on port `3000` exposes the following endpoints:

| Method | Endpoint | Description | Cache Policy |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status, uptime, and version | No-cache |
| `GET` | `/api/v1/universes` | Available market listings (NIFTY, S&P 500, NASDAQ, etc.) | `max-age=300` |
| `GET` | `/api/v1/quotes?symbols=AAPL,MSFT` | Real-time quotes, price changes, and breadth | Dynamic |
| `GET` | `/api/v1/research?symbol=NVDA` | Valuation multiples, ratios, and company profile | In-memory cache (<1ms) |
| `POST` | `/api/v1/chat` | AI Copilot (Gemini 2.5 Flash with search grounding) | Rate limited |
| `GET` | `/api/v1/tests/unit` | Execute and retrieve automated unit test results | `max-age=60` |

### Example Queries:

```bash
# Health check
curl http://localhost:3000/health

# Fetch research data (Cached after first call)
curl http://localhost:3000/api/v1/research?symbol=NVDA

# Query AI Copilot
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the P/E ratio and growth outlook for Nvidia?"}'
```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the project root:

```ini
# Server Port
PORT=3000

# Google AI Studio (Gemini 2.5 Flash Copilot)
GEMINI_API_KEY=your_google_ai_studio_key_here

# Firebase Configuration (Optional - for real-time cloud watchlists)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔧 Troubleshooting & FAQ

### 1. `Port 3000 is already in use`
A previously started server process is still listening. Kill it via PowerShell:
```powershell
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }
```

### 2. `How do I verify bundle optimization?`
Run `npm run build`. The output shows individual code-split chunks (`vendor-react`, `vendor-firebase`, `vendor-d3`, and `assets/index.js` at ~248 kB), avoiding monolithic file downloads.

### 3. `Can I use StockPulse without a Gemini API Key?`
Yes! If `GEMINI_API_KEY` is omitted, the AI Financial Copilot automatically falls back to an intelligent, rule-based quantitative heuristics engine that evaluates valuation, momentum, and sector trends locally.

---

## 📄 Educational Disclaimer

*StockPulse is developed exclusively for educational, quantitative research, and demonstration purposes. Financial market data and live price simulations are subject to exchange delays and modeling variance. The built-in AI Copilot does not provide registered financial, investment, tax, or legal advice. Always conduct your own independent due diligence before placing live market trades.*
