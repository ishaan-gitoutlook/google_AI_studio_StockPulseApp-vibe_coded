"""
StockPulse Technical Indicators Service
Provides calculation algorithms for RSI, MACD, Bollinger Bands, and Moving Averages.
"""

from typing import List, Dict, Any, Optional
import math


def calculate_sma(prices: List[float], period: int) -> List[Optional[float]]:
    """Calculates Simple Moving Average (SMA) over a sliding window."""
    if not prices or period <= 0:
        return []
    
    sma_series: List[Optional[float]] = []
    for i in range(len(prices)):
        if i < period - 1:
            sma_series.append(None)
        else:
            window = prices[i - period + 1 : i + 1]
            sma_series.append(round(sum(window) / period, 2))
    return sma_series


def calculate_ema(prices: List[float], period: int) -> List[Optional[float]]:
    """Calculates Exponential Moving Average (EMA) with multiplier k = 2 / (period + 1)."""
    if not prices or period <= 0:
        return []

    ema_series: List[Optional[float]] = [None] * len(prices)
    if len(prices) < period:
        return ema_series

    initial_sma = sum(prices[:period]) / period
    ema_series[period - 1] = round(initial_sma, 2)
    multiplier = 2.0 / (period + 1)

    prev_ema = initial_sma
    for i in range(period, len(prices)):
        current_ema = (prices[i] - prev_ema) * multiplier + prev_ema
        ema_series[i] = round(current_ema, 2)
        prev_ema = current_ema

    return ema_series


def calculate_rsi(prices: List[float], period: int = 14) -> Dict[str, Any]:
    """Calculates Relative Strength Index (RSI) using Wilder's smoothed averages."""
    if len(prices) < period + 1:
        return {
            "rsi": 50.0,
            "condition": "NEUTRAL",
            "period": period,
            "series": [50.0] * len(prices),
        }

    deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [max(0.0, d) for d in deltas]
    losses = [max(0.0, -d) for d in deltas]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    rsi_series: List[Optional[float]] = [None] * period

    if avg_loss == 0:
        first_rsi = 100.0
    else:
        rs = avg_gain / avg_loss
        first_rsi = round(100.0 - (100.0 / (1.0 + rs)), 2)
    rsi_series.append(first_rsi)

    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            rsi_val = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi_val = round(100.0 - (100.0 / (1.0 + rs)), 2)
        rsi_series.append(rsi_val)

    current_rsi = rsi_series[-1] if rsi_series[-1] is not None else 50.0
    condition = "OVERBOUGHT" if current_rsi >= 70.0 else "OVERSOLD" if current_rsi <= 30.0 else "NEUTRAL"

    return {
        "rsi": current_rsi,
        "condition": condition,
        "period": period,
        "series": [val if val is not None else current_rsi for val in rsi_series],
    }


def calculate_macd(
    prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9
) -> Dict[str, Any]:
    """Calculates Moving Average Convergence Divergence (MACD)."""
    if len(prices) < slow:
        return {
            "macd": 0.0,
            "signal": 0.0,
            "histogram": 0.0,
            "trend": "NEUTRAL",
        }

    fast_ema = calculate_ema(prices, fast)
    slow_ema = calculate_ema(prices, slow)

    valid_macd_values: List[float] = []
    for f, s in zip(fast_ema, slow_ema):
        if f is not None and s is not None:
            val = round(f - s, 2)
            valid_macd_values.append(val)

    signal_series = calculate_ema(valid_macd_values, signal) if valid_macd_values else []

    current_macd = valid_macd_values[-1] if valid_macd_values else 0.0
    current_signal = signal_series[-1] if signal_series and signal_series[-1] is not None else 0.0
    histogram = round(current_macd - current_signal, 2)

    trend = (
        "BULLISH_EXPANSION" if histogram > 0 and current_macd > 0
        else "BEARISH_CONTRACTION" if histogram < 0
        else "CONSOLIDATING"
    )

    return {
        "macd": current_macd,
        "signal": current_signal,
        "histogram": histogram,
        "trend": trend,
    }


def calculate_bollinger_bands(
    prices: List[float], period: int = 20, num_std: float = 2.0
) -> Dict[str, Any]:
    """Calculates Bollinger Bands (Upper, Middle, Lower, Bandwidth, %B)."""
    if len(prices) < period:
        current_price = prices[-1] if prices else 100.0
        return {
            "upper": round(current_price * 1.05, 2),
            "middle": round(current_price, 2),
            "lower": round(current_price * 0.95, 2),
            "bandwidthPct": 10.0,
            "percentB": 0.5,
        }

    window = prices[-period:]
    middle = sum(window) / period
    variance = sum((p - middle) ** 2 for p in window) / period
    std_dev = math.sqrt(variance)

    upper = round(middle + (num_std * std_dev), 2)
    lower = round(middle - (num_std * std_dev), 2)
    middle = round(middle, 2)

    bandwidth = round(((upper - lower) / (middle or 1.0)) * 100, 2)
    current_price = prices[-1]
    denom = upper - lower
    percent_b = round((current_price - lower) / denom, 2) if denom > 0 else 0.5

    return {
        "upper": upper,
        "middle": middle,
        "lower": lower,
        "bandwidthPct": bandwidth,
        "percentB": percent_b,
    }


def get_technical_summary(prices: List[float]) -> Dict[str, Any]:
    """Synthesizes comprehensive multi-timeframe technical indicator profile."""
    rsi_data = calculate_rsi(prices)
    macd_data = calculate_macd(prices)
    bb_data = calculate_bollinger_bands(prices)

    sma_20 = calculate_sma(prices, 20)
    sma_50 = calculate_sma(prices, 50)
    ema_20 = calculate_ema(prices, 20)

    current_price = prices[-1] if prices else 0.0

    score = 50.0
    if rsi_data["rsi"] > 50:
        score += 15.0
    if macd_data["histogram"] > 0:
        score += 15.0
    if bb_data["percentB"] > 0.5:
        score += 10.0
    if ema_20 and ema_20[-1] and current_price > ema_20[-1]:
        score += 10.0

    signal = "STRONG_BUY" if score >= 80 else "BUY" if score >= 60 else "NEUTRAL" if score >= 40 else "SELL"

    return {
        "currentPrice": current_price,
        "compositeScore": min(100.0, max(0.0, score)),
        "signal": signal,
        "rsi": rsi_data,
        "macd": macd_data,
        "bollingerBands": bb_data,
        "movingAverages": {
            "sma20": sma_20[-1] if sma_20 else None,
            "sma50": sma_50[-1] if sma_50 else None,
            "ema20": ema_20[-1] if ema_20 else None,
        },
    }
