# 📈 StockPulse — Enterprise Financial Intelligence & AI QA Platform

[![Python](https://img.shields.io/badge/Python-3.14%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.1-38b2ac.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-f9a03c.svg?logo=d3.js&logoColor=white)](https://d3js.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 2.5](https://img.shields.io/badge/AI%20Copilot-Gemini%202.5%20Flash-8e75ff.svg?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-ffca28.svg?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Pytest](https://img.shields.io/badge/Pytest-21%20Passing-success.svg?logo=pytest&logoColor=white)](https://docs.pytest.org/)

**StockPulse** is a modern, production-grade financial tracking ecosystem, quantitative equity analytics dashboard, and autonomous QA testing platform. Built with a **Python-First Full-Stack Architecture**, it couples a high-performance **Python 3.14 + FastAPI** quantitative engine with a sleek **React 19 + TypeScript + Vite + TailwindCSS v4 + D3.js** single-page application, an interactive **Python Terminal CLI**, and a resilient **Node.js Express reverse proxy**.

---

## 📑 Table of Contents

- [🏛️ System Architecture](#️-system-architecture)
- [🐍 Python-First Engine Capabilities](#-python-first-engine-capabilities)
  - [1. Quantitative Technical Indicators Engine](#1-quantitative-technical-indicators-engine)
  - [2. Monte Carlo Risk & Solvency Engine](#2-monte-carlo-risk--solvency-engine)
  - [3. Python Gemini 2.5 Flash Copilot](#3-python-gemini-25-flash-copilot)
  - [4. Interactive Python Terminal CLI (`cli.py`)](#4-interactive-python-terminal-cli-clipy)
- [✨ Web Dashboard Capabilities](#-web-dashboard-capabilities)
  - [1. Multi-Market Watchlists & Global Universes](#1-multi-market-watchlists--global-universes)
  - [2. High-Performance Quotes Matrix & Sparklines](#2-high-performance-quotes-matrix--sparklines)
  - [3. D3.js Sector Treemap & Breadth Distribution](#3-d3js-sector-treemap--breadth-distribution)
  - [4. In-Depth Fundamentals Research](#4-in-depth-fundamentals-research)
  - [5. 7 Ergonomic Color Palettes](#5-7-ergonomic-color-palettes)
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

StockPulse is designed around an enterprise dual-engine pattern with Python as the primary quant and algorithmic engine, fronted by an Express reverse proxy and Vite SPA:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT ACCESS INTERFACES                        │
│                                                                        │
│   React 19 Web Dashboard (:3000)       Python Terminal CLI (cli.py)    │
│   - Quotes Matrix (Table/Grid)         - Live Streaming ASCII Tables   │
│   - D3.js Sector Treemap               - Monte Carlo Visualizer        │
│   - D3.js Breadth Distribution         - Technical Indicators Profile  │
│   - Fundamentals & Notes               - Terminal AI Copilot Chat      │
│   - 7 Ergonomic Color Themes           - Pytest Runner                 │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
         HTTP / REST│                               │ Direct Python Ingestion
                    ▼                               ▼
┌────────────────────────────────────────┐  ┌────────────────────────────┐
│      NODE.JS EXPRESS REVERSE PROXY     │  │    CORE PYTHON FASTAPI     │
│         (server.ts / :3000)            │  │     BACKEND (:8000)        │
│   - Reverse-proxies /api/v1/* to Python│  │   - Pydantic v2 Models     │
│   - Automatic local fallback if offline│◄─┼───- GBM Tick Simulator     │
│   - High-performance Gzip / Brotli     │  │   - Indicators Engine      │
│   - In-memory research cache (<1ms)    │  │   - Monte Carlo & VaR      │
│   - Hosts production SPA (/dist)       │  │   - Gemini 2.5 Copilot     │
└───────────────────┬────────────────────┘  │   - Programmatic Pytest    │
                    │                       └────────────────────────────┘
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

## 🐍 Python-First Engine Capabilities

### 1. Quantitative Technical Indicators Engine
Pure Python implementations in `backend/indicators.py`:
* **RSI (Relative Strength Index)**: 14-period Wilder smoothing with overbought/oversold boundaries.
* **MACD**: 12/26-period EMA with 9-period Signal line and trend histogram.
* **Bollinger Bands**: 20-period SMA with $2\sigma$ upper/lower bands and $\%B$ positioning.
* **Moving Averages**: 20 and 50-period SMA and EMA.
* **Composite Technical Score**: Multi-factor 0-100 indicator momentum score.

### 2. Monte Carlo Risk & Solvency Engine
Quantitative risk analytics in `backend/analytics.py`:
* **Geometric Brownian Motion**: 1,000 price path iterations projecting over 30, 90, and 252 days.
* **Value-at-Risk (VaR)**: Maximum statistical loss at **95%** and **99%** confidence intervals.
* **Expected Shortfall (CVaR)**: Conditional tail-risk loss expectation.
* **Altman Z-Score**: Evaluates financial solvency across 5 operational ratios (Safe, Grey, Distress).
* **DuPont 3-Way ROE Decomposition**: Breaks down ROE into Profit Margin $\times$ Asset Turnover $\times$ Leverage.

### 3. Python Gemini 2.5 Flash Copilot
In `backend/copilot.py`:
* Powered by Google's official `google-genai` Python SDK.
* Real-time **Google Search Grounding** for live news and earnings releases.
* Resilient dual fallbacks: `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ Quantitative Heuristics.

### 4. Interactive Python Terminal CLI (`cli.py`)
Launch the terminal tracker using Python's `rich` library:
```powershell
python cli.py                       # Interactive console menu
python cli.py --quotes              # Instant quotes matrix
python cli.py --symbol NVDA         # Fundamentals valuation
python cli.py --symbol NVDA --monte-carlo  # Run Monte Carlo risk engine
python cli.py --symbol NVDA --indicators   # View RSI, MACD, Bollinger Bands
```

---

## ✨ Web Dashboard Capabilities

### 1. Multi-Market Watchlists & Global Universes
Track blue-chip indices across 7 global benchmarks:
* 🇮🇳 **NIFTY 500 & BSE Sensex 30** (NSE & BSE India)
* 🇺🇸 **S&P 500 & NASDAQ 100** (US Large Cap & Tech Leaders)
* 🇬🇧 **FTSE 100** (London Stock Exchange)
* 🇩🇪 **DAX 40** (Deutsche Börse XETRA)
* 🌐 **Global Megacaps** (Apple, Microsoft, Alphabet, Nvidia, Reliance, etc.)
* ⭐ **Personal Watchlists**: Star and sync tickers in real-time to Cloud Firestore.

### 2. High-Performance Quotes Matrix & Sparklines
* **Dual Presentation**: Dense sortable financial table or modular grid cards.
* **Precomputed SVG Sparklines**: Zero runtime math overhead on price updates.
* **Granular Filtering**: Filter by Technology, Financials, Healthcare, Consumer, Energy, and more.

### 3. D3.js Sector Treemap & Breadth Distribution
* **Sector Treemap**: Sized by market cap with dynamic heatmapping (+3% green to -3% red) using in-place DOM updates (zero canvas teardown).
* **Market Breadth**: Distribution histogram and Advance/Decline ratio donut chart.

### 4. In-Depth Fundamentals Research
* Valuation multiples: Trailing/Forward P/E, PEG, Price-to-Book, EV/EBITDA, Dividend Yield.
* Solvency ratios: Debt-to-Equity, Operating Margins, ROE, ROA.
* Interactive markdown research notes attached to each stock symbol.

### 5. 7 Ergonomic Color Palettes
* 🌙 **Midnight Navy**: Default dark mode with slate cards and cyan accents.
* ☀️ **Clean Light**: Glare-free off-white palette for bright offices.
* 🖤 **Obsidian Noir**: High-contrast true black for OLED power savings.
* 🌲 **Emerald Wealth**: Forest green and gold palette for a wealth terminal feel.
* ❄️ **Arctic Frost**: Minimalist cool-steel blue and frosted cyan.
* 🌇 **Crimson Sunset**: Twilight slate with warm coral and amber hues.
* 💻 **Solarized Dark**: Developer classic with low-contrast teal accents.

---

## ⚡ Performance & Optimization Highlights

| Optimization Area | Technique Implemented | Benchmark Result |
| :--- | :--- | :--- |
| **JS Bundle Size** | Rollup `manualChunks` (`vendor-d3`, `vendor-firebase`, `vendor-react`) | **`248.85 kB`** main bundle (**~80% reduction**) |
| **Component Rendering** | `React.memo` row extraction + precomputed sparklines | **~96% fewer component re-renders** |
| **D3 Canvas DOM** | In-place attribute and text transitions (`prevLayoutKeyRef`) | **Zero DOM canvas teardowns**; smooth 60 FPS |
| **Battery / CPU** | Page Visibility API (`document.visibilityState`) | **Live ticks auto-paused** when tab is hidden |
| **Network Payloads** | Express HTTP Gzip / Brotli `compression` | **Up to 75% smaller transfer size** |
| **API Latency** | Bounded in-memory Map cache (`researchCache`) | **<1ms instant cache hits** on repeat queries |
| **Dual-Engine Proxy** | Node-to-Python delegation bridge | **Seamless proxy with zero-downtime fallback** |

---

## 🤖 3-Tier Testing & QA Suite

```
┌────────────────────────────────────────────────────────────────────────┐
│ Level 3: Autonomous AI QA Suite (Playwright + MCP + Gemini)            │
│          - Evaluates accessibility ARIA tree, outputs pass/fail reports│
├────────────────────────────────────────────────────────────────────────┤
│ Level 2: Playwright End-to-End UI Tests (TypeScript/Node.js)           │
│          - 16 specs verifying UI rendering, selectors, and themes      │
├────────────────────────────────────────────────────────────────────────┤
│ Level 1: Python Pytest Suite (Python 3.14)                             │
│          - 21 passing test cases verifying indicators, Monte Carlo,    │
│            quote math, breadth, and API endpoints                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
google_AI_studio_StockPulseApp-vibe_coded/
├── backend/                           # Core Python FastAPI Engine
│   ├── analytics.py                   # Monte Carlo (1,000 runs), VaR, Altman Z-Score
│   ├── copilot.py                     # Python Gemini 2.5 Copilot + Search Grounding
│   ├── data.py                        # Universes and quote catalogs
│   ├── engine.py                      # GBM tick simulator & breadth calculations
│   ├── indicators.py                  # Pure Python RSI, MACD, Bollinger Bands
│   ├── main.py                        # FastAPI REST application (Port 8000)
│   └── models.py                      # Pydantic v2 domain schemas
├── src/                               # Frontend React 19 Application
│   ├── components/                    # Modular UI components (Tracker, D3 Treemap, etc.)
│   ├── lib/                           # Firebase initialization & utilities
│   ├── App.tsx                        # Main application container & state
│   ├── index.css                      # TailwindCSS v4 and 7 ergonomic themes
│   └── main.tsx                       # React DOM entrypoint
├── tests/                             # Comprehensive test suites
│   ├── test_analytics.py              # Monte Carlo & solvency tests
│   ├── test_backend.py                # FastAPI endpoint tests
│   └── test_indicators.py             # RSI, MACD, Bollinger Bands unit tests
├── scripts/                           # Python developer tooling
│   └── benchmark.py                   # API latency and throughput benchmark
├── dev.py                             # Master Python development orchestrator
├── cli.py                             # Interactive Python Terminal CLI
├── server.ts                          # Production Express reverse proxy & host
├── requirements.txt                   # Python backend dependencies
├── package.json                       # Node scripts and dependencies
├── vite.config.ts                     # Vite build configuration with Rollup chunking
├── IMPLEMENTATION_PLAN.md             # Enterprise implementation plan & roadmap
├── WALKTHROUGH.md                     # Complete platform walkthrough guide
└── README.md                          # Project documentation
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
* **Python**: v3.10 or higher (v3.14 tested)
* **Node.js**: v18.0 or higher (v20+ recommended)

### 2. Installation
```powershell
# Clone the repository
git clone https://github.com/ishaan-gitoutlook/google_AI_studio_StockPulseApp-vibe_coded.git
cd google_AI_studio_StockPulseApp-vibe_coded

# Install Node.js dependencies
npm install

# Setup Python Virtual Environment and install dependencies
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

### 3. Run the Application

#### Option A: Unified Dev Cluster (Recommended)
```powershell
python dev.py
```
* Concurrently launches the Python FastAPI backend on `http://localhost:8000` and the Node/Vite frontend on `http://localhost:3000`.

#### Option B: Terminal CLI Tracker
```powershell
python cli.py
```

#### Option C: Production Mode
```powershell
npm run build
npm start
```

---

## 🌐 REST API Reference

| Method | Endpoint | Description | Powered By |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health status and active capabilities | FastAPI / Express |
| `GET` | `/api/v1/universes` | Available global market universes | FastAPI Engine |
| `GET` | `/api/v1/quotes` | Real-time quotes, price changes, and breadth | FastAPI Engine |
| `GET` | `/api/v1/research?symbol=NVDA` | Valuation multiples and company profile | In-memory cache (<1ms) |
| `GET` | `/api/v1/analytics/indicators?symbol=NVDA` | RSI, MACD, Bollinger Bands | Python Indicators Engine |
| `GET` | `/api/v1/analytics/monte-carlo?symbol=NVDA` | 1,000-iteration Monte Carlo & VaR | Python Analytics Engine |
| `GET` | `/api/v1/analytics/solvency?symbol=NVDA` | Altman Z-Score & DuPont ROE | Python Analytics Engine |
| `POST` | `/api/v1/chat` | AI Copilot (Gemini 2.5 Flash + Search Grounding) | Python GenAI SDK |
| `GET` | `/api/v1/tests/unit` | Live programmatic pytest execution | Pytest Runner |

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the project root:

```ini
# Server Configuration
PORT=3000
PYTHON_BACKEND_URL=http://127.0.0.1:8000

# Google AI Studio (Gemini 2.5 Flash Copilot)
GEMINI_API_KEY=your_google_ai_studio_key_here

# Firebase Configuration (Optional - for Cloud Watchlists & Notes)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📄 Educational Disclaimer

*StockPulse is developed exclusively for educational, quantitative research, and demonstration purposes. Financial market data and live price simulations are subject to exchange delays and modeling variance. The built-in AI Copilot does not provide registered financial, investment, tax, or legal advice. Always conduct your own independent due diligence before placing live market trades.*
