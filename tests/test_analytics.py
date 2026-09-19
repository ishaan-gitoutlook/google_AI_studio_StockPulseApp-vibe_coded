import pytest
from backend.analytics import (
    run_monte_carlo_simulation,
    calculate_altman_z_score,
    calculate_dupont_analysis,
)


def test_monte_carlo_simulation_defaults():
    res = run_monte_carlo_simulation(
        current_price=100.0,
        sparkline=[95.0, 97.0, 99.0, 101.0, 100.0],
        days=20,
        num_simulations=500,
    )
    assert res["currentPrice"] == 100.0
    assert res["daysProjected"] == 20
    assert res["simulationsCount"] == 500
    assert res["percentile5th"] < res["expectedPrice"]
    assert res["percentile95th"] > res["expectedPrice"]
    assert res["var95"]["dollarAmount"] >= 0
    assert res["var99"]["dollarAmount"] >= res["var95"]["dollarAmount"]
    assert res["expectedShortfall"] >= res["var95"]["dollarAmount"]
    assert len(res["samplePaths"]) > 0


def test_altman_z_score():
    # Prime firm financials
    safe = calculate_altman_z_score(
        working_capital=50000000,
        total_assets=200000000,
        retained_earnings=80000000,
        ebit=40000000,
        market_equity=600000000,
        total_liabilities=50000000,
        sales=250000000,
    )
    assert safe["zScore"] > 2.99
    assert safe["zone"] == "SAFE_ZONE"

    # Distressed firm financials
    distressed = calculate_altman_z_score(
        working_capital=-20000000,
        total_assets=100000000,
        retained_earnings=-40000000,
        ebit=-5000000,
        market_equity=10000000,
        total_liabilities=120000000,
        sales=50000000,
    )
    assert distressed["zScore"] < 1.81
    assert distressed["zone"] == "DISTRESS_ZONE"


def test_dupont_analysis():
    dupont = calculate_dupont_analysis(
        net_income=25000000,
        revenue=100000000,
        total_assets=150000000,
        shareholder_equity=75000000,
    )
    assert dupont["returnOnEquityPct"] > 0
    assert dupont["components"]["netProfitMarginPct"] == 25.0
    assert dupont["components"]["assetTurnover"] > 0
    assert dupont["components"]["financialLeverageMultiplier"] == 2.0
