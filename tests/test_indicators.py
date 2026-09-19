import pytest
from backend.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    get_technical_summary,
)


def test_sma_calculation():
    prices = [10.0, 20.0, 30.0, 40.0, 50.0]
    sma_3 = calculate_sma(prices, 3)
    assert len(sma_3) == 5
    assert sma_3[0] is None
    assert sma_3[1] is None
    assert sma_3[2] == 20.0  # (10+20+30)/3
    assert sma_3[3] == 30.0  # (20+30+40)/3
    assert sma_3[4] == 40.0  # (30+40+50)/3


def test_ema_calculation():
    prices = [10.0, 11.0, 12.0, 13.0, 14.0, 15.0]
    ema_3 = calculate_ema(prices, 3)
    assert len(ema_3) == 6
    assert ema_3[0] is None
    assert ema_3[1] is None
    assert ema_3[2] == 11.0  # Initial SMA (10+11+12)/3
    assert ema_3[3] > 11.0


def test_rsi_calculation_bounds():
    # Uptrend prices should produce high RSI
    uptrend = [float(i) for i in range(1, 25)]
    rsi_up = calculate_rsi(uptrend, 14)
    assert 0.0 <= rsi_up["rsi"] <= 100.0
    assert rsi_up["rsi"] > 70.0
    assert rsi_up["condition"] == "OVERBOUGHT"

    # Downtrend prices should produce low RSI
    downtrend = [float(50 - i) for i in range(1, 25)]
    rsi_down = calculate_rsi(downtrend, 14)
    assert 0.0 <= rsi_down["rsi"] <= 100.0
    assert rsi_down["rsi"] < 30.0
    assert rsi_down["condition"] == "OVERSOLD"


def test_macd_calculation():
    prices = [100.0 + i * 1.5 for i in range(35)]
    macd = calculate_macd(prices)
    assert "macd" in macd
    assert "signal" in macd
    assert "histogram" in macd
    assert "trend" in macd


def test_bollinger_bands_calculation():
    prices = [100.0, 102.0, 98.0, 101.0, 99.0, 103.0, 97.0, 100.0] * 3
    bb = calculate_bollinger_bands(prices, period=20)
    assert bb["upper"] > bb["middle"]
    assert bb["middle"] > bb["lower"]
    assert bb["bandwidthPct"] > 0
    assert 0.0 <= bb["percentB"] <= 1.0


def test_technical_summary_composite():
    prices = [120.0, 122.0, 121.5, 123.0, 125.0, 127.0, 126.5, 129.0, 130.0] * 3
    summary = get_technical_summary(prices)
    assert 0.0 <= summary["compositeScore"] <= 100.0
    assert summary["signal"] in ["STRONG_BUY", "BUY", "NEUTRAL", "SELL"]
    assert "rsi" in summary
    assert "macd" in summary
    assert "bollingerBands" in summary
