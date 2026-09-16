import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.engine import calculate_breadth, simulate_tick, get_or_create_fundamentals
from backend.data import INITIAL_STOCKS, UNIVERSES_META, STOCK_FUNDAMENTALS
from backend.models import StockQuote

client = TestClient(app)


# -------------------------------------------------------------
# 1. API Endpoints & Health Tests
# -------------------------------------------------------------
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "StockPulse"
    assert "FastAPI" in data["framework"]


def test_get_universes_list():
    response = client.get("/api/v1/universes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 7
    assert any(u["id"] == "global-megacaps" for u in data["universes"])


def test_get_quotes_default():
    response = client.get("/api/v1/quotes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["universe"] == "global-megacaps"
    assert len(data["quotes"]) > 0
    assert "breadth" in data


def test_get_quotes_by_symbols():
    response = client.get("/api/v1/quotes?symbols=NVDA,AAPL,CUSTOMTICKER")
    assert response.status_code == 200
    data = response.json()
    assert len(data["quotes"]) == 3
    symbols = [q["symbol"] for q in data["quotes"]]
    assert "NVDA" in symbols
    assert "CUSTOMTICKER" in symbols


def test_get_research_preset():
    response = client.get("/api/v1/research?symbol=NVDA")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["symbol"] == "NVDA"
    assert data["data"]["stabilityScore"]["total"] >= 90


def test_get_research_dynamic():
    response = client.get("/api/v1/research?symbol=XYZCORP")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["symbol"] == "XYZCORP"
    assert data["data"]["valuation"]["peRatio"] > 0


def test_chat_endpoint_valid():
    response = client.post(
        "/api/v1/chat",
        json={"message": "Analyze NVDA valuation multiples", "universe": "global-megacaps"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "NVIDIA" in data["message"] or "NVDA" in data["message"]


def test_chat_endpoint_empty_message():
    response = client.post("/api/v1/chat", json={"message": "", "universe": "global-megacaps"})
    assert response.status_code == 400


# -------------------------------------------------------------
# 2. Mathematical Engine & Breadth Calculations
# -------------------------------------------------------------
def test_calculate_breadth_normal():
    stocks = INITIAL_STOCKS["global-megacaps"]
    breadth = calculate_breadth(stocks)
    assert breadth.total == len(stocks)
    assert breadth.advancers + breadth.decliners + breadth.unchanged == len(stocks)
    assert breadth.advanceDeclineRatio > 0
    assert breadth.totalVolume > 0


def test_calculate_breadth_empty():
    breadth = calculate_breadth([])
    assert breadth.total == 0
    assert breadth.advanceDeclineRatio == 1.0


def test_simulate_tick_preserves_attributes():
    stock = INITIAL_STOCKS["global-megacaps"][0]
    updated = simulate_tick(stock)
    assert updated.symbol == stock.symbol
    assert updated.name == stock.name
    assert updated.price > 0
    assert len(updated.sparkline) >= len(stock.sparkline)
    assert updated.high >= updated.price
    assert updated.low <= updated.price


# -------------------------------------------------------------
# 3. Solvency & Valuation Normalizers
# -------------------------------------------------------------
def test_fundamentals_builder():
    dummy_quote = StockQuote(
        symbol="TEST",
        name="Test Inc",
        exchange="NASDAQ",
        currency="USD",
        price=100.0,
        change=1.0,
        changePercent=1.0,
        open=99.0,
        high=101.0,
        low=98.5,
        previousClose=99.0,
        volume=100000,
        avgVolume=100000,
        marketCap=1000000000,
        marketCapFormatted="$1.0 B",
        week52High=120.0,
        week52Low=80.0,
        sector="Technology",
        industry="Software",
        lastUpdated="Live",
    )
    fund = get_or_create_fundamentals(dummy_quote)
    assert fund.symbol == "TEST"
    assert fund.valuation.peRatio is not None
    assert fund.stabilityScore.total > 0
    assert fund.analysts.targetMean > 0
