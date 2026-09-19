"""
StockPulse Quantitative Portfolio Risk & Solvency Analytics (Pure Python)
Features Monte Carlo Price Path Simulation (Geometric Brownian Motion),
Value-at-Risk (VaR), Expected Shortfall, Altman Z-Score, and DuPont ROE Decomposition.
"""

from typing import List, Dict, Any, Optional
import math
import random


def run_monte_carlo_simulation(
    current_price: float,
    sparkline: Optional[List[float]] = None,
    days: int = 30,
    num_simulations: int = 1000,
    annual_volatility: Optional[float] = None,
    annual_drift: float = 0.08,
) -> Dict[str, Any]:
    """
    Simulates price paths using Geometric Brownian Motion (GBM):
    dS = mu * S * dt + sigma * S * dW
    Returns expected price, distribution percentiles, VaR 95%, VaR 99%, and sample paths.
    """
    if current_price <= 0:
        current_price = 100.0

    # Calculate historical daily volatility from sparkline if available
    if annual_volatility is None:
        if sparkline and len(sparkline) >= 3:
            returns = [
                math.log(sparkline[i] / sparkline[i - 1])
                for i in range(1, len(sparkline))
                if sparkline[i - 1] > 0 and sparkline[i] > 0
            ]
            if returns:
                mean_ret = sum(returns) / len(returns)
                var_ret = sum((r - mean_ret) ** 2 for r in returns) / len(returns)
                daily_vol = math.sqrt(var_ret)
                annual_volatility = max(0.12, min(0.95, daily_vol * math.sqrt(252)))
            else:
                annual_volatility = 0.28
        else:
            annual_volatility = 0.28

    dt = 1.0 / 252.0  # Daily time-step
    drift_step = (annual_drift - 0.5 * (annual_volatility**2)) * dt
    vol_step = annual_volatility * math.sqrt(dt)

    final_prices: List[float] = []
    sample_paths: List[List[float]] = []

    # Store up to 5 representative paths for visual charting
    record_paths_indices = {0, num_simulations // 4, num_simulations // 2, (3 * num_simulations) // 4, num_simulations - 1}

    for sim in range(num_simulations):
        price = current_price
        path = [round(price, 2)] if sim in record_paths_indices else []

        for _ in range(days):
            # Box-Muller transform for standard normal random variate
            u1 = max(1e-9, random.random())
            u2 = random.random()
            z = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)

            price *= math.exp(drift_step + vol_step * z)
            if path:
                path.append(round(price, 2))

        final_prices.append(price)
        if path:
            sample_paths.append(path)

    final_prices.sort()

    p5_idx = int(0.05 * num_simulations)
    p50_idx = int(0.50 * num_simulations)
    p95_idx = int(0.95 * num_simulations)
    p99_loss_idx = int(0.01 * num_simulations)

    expected_price = round(sum(final_prices) / num_simulations, 2)
    median_price = round(final_prices[p50_idx], 2)
    p5_price = round(final_prices[p5_idx], 2)
    p95_price = round(final_prices[p95_idx], 2)

    # Value-at-Risk (maximum expected loss at 95% and 99% confidence)
    var_95_dollar = round(max(0.0, current_price - p5_price), 2)
    var_95_pct = round((var_95_dollar / current_price) * 100, 2)

    p1_price = final_prices[p99_loss_idx]
    var_99_dollar = round(max(0.0, current_price - p1_price), 2)
    var_99_pct = round((var_99_dollar / current_price) * 100, 2)

    # Expected Shortfall (CVaR: average loss beyond 95th percentile)
    tail_losses = [current_price - p for p in final_prices[:p5_idx] if current_price - p > 0]
    expected_shortfall = round(sum(tail_losses) / len(tail_losses), 2) if tail_losses else var_95_dollar

    return {
        "currentPrice": current_price,
        "daysProjected": days,
        "simulationsCount": num_simulations,
        "annualizedVolatility": round(annual_volatility * 100, 2),
        "expectedPrice": expected_price,
        "medianPrice": median_price,
        "percentile5th": p5_price,
        "percentile95th": p95_price,
        "var95": {"dollarAmount": var_95_dollar, "percentage": var_95_pct},
        "var99": {"dollarAmount": var_99_dollar, "percentage": var_99_pct},
        "expectedShortfall": expected_shortfall,
        "samplePaths": sample_paths,
    }


def calculate_altman_z_score(
    working_capital: float,
    total_assets: float,
    retained_earnings: float,
    ebit: float,
    market_equity: float,
    total_liabilities: float,
    sales: float,
) -> Dict[str, Any]:
    """
    Computes Edward Altman's Z-Score for public manufacturing / non-financial corporations:
    Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5
    Zones: Safe (Z > 2.99), Grey (1.81 <= Z <= 2.99), Distress (Z < 1.81).
    """
    assets = max(1.0, total_assets)
    liabilities = max(1.0, total_liabilities)

    x1 = working_capital / assets
    x2 = retained_earnings / assets
    x3 = ebit / assets
    x4 = market_equity / liabilities
    x5 = sales / assets

    z_score = round(1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5, 2)

    if z_score >= 2.99:
        zone = "SAFE_ZONE"
        description = "Minimal probability of financial distress over the next 24 months."
    elif z_score >= 1.81:
        zone = "GREY_ZONE"
        description = "Moderate solvency buffer. Requires continuous margin monitoring."
    else:
        zone = "DISTRESS_ZONE"
        description = "High probability of liquidity strain or capital restructuring."

    return {
        "zScore": z_score,
        "zone": zone,
        "description": description,
        "factors": {
            "liquidityX1": round(x1, 3),
            "retainedEarningsX2": round(x2, 3),
            "operatingProfitabilityX3": round(x3, 3),
            "marketLeverageX4": round(x4, 3),
            "assetTurnoverX5": round(x5, 3),
        },
    }


def calculate_dupont_analysis(
    net_income: float,
    revenue: float,
    total_assets: float,
    shareholder_equity: float,
) -> Dict[str, Any]:
    """
    Decomposes Return on Equity (ROE) using the 3-Step DuPont Method:
    ROE = Net Profit Margin * Asset Turnover * Equity Multiplier
    """
    rev = max(1.0, revenue)
    assets = max(1.0, total_assets)
    equity = max(1.0, shareholder_equity)

    net_profit_margin = net_income / rev
    asset_turnover = rev / assets
    equity_multiplier = assets / equity

    roe = round(net_profit_margin * asset_turnover * equity_multiplier * 100, 2)

    return {
        "returnOnEquityPct": roe,
        "components": {
            "netProfitMarginPct": round(net_profit_margin * 100, 2),
            "assetTurnover": round(asset_turnover, 2),
            "financialLeverageMultiplier": round(equity_multiplier, 2),
        },
        "efficiencyAssessment": (
            "High Operating Leverage" if equity_multiplier > 3.0
            else "Balanced Organic Quality" if net_profit_margin > 0.20
            else "Volume / Turnover Driven"
        ),
    }
