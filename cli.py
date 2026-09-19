#!/usr/bin/env python
"""
StockPulse Interactive Terminal CLI (Python Edition)
High-performance quantitative terminal interface powered by Rich, FastAPI models,
Monte Carlo simulation, Technical Indicators, and AI Copilot.
"""

import sys
import os
import argparse
from typing import Optional

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich import box

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.data import INITIAL_STOCKS, UNIVERSES_META, STOCK_FUNDAMENTALS

from backend.engine import calculate_breadth, get_or_create_fundamentals
from backend.indicators import get_technical_summary
from backend.analytics import run_monte_carlo_simulation, calculate_altman_z_score, calculate_dupont_analysis
from backend.copilot import run_copilot_inference

console = Console(legacy_windows=False)


def render_banner():
    title = Text("[*] StockPulse Terminal Intelligence", style="bold cyan")
    subtitle = Text("Python Quant & Financial Analytics Console - v1.3.0", style="dim white")
    panel = Panel(
        Text.assemble(title, "\n", subtitle),

        box=box.DOUBLE,
        border_style="cyan",
        padding=(1, 2),
    )
    console.print(panel)


def display_quotes_table(universe_id: str = "global-megacaps"):
    stocks = INITIAL_STOCKS.get(universe_id, INITIAL_STOCKS["global-megacaps"])
    breadth = calculate_breadth(stocks)

    # Breadth banner
    ad_color = "green" if breadth.advanceDeclineRatio >= 1.2 else "red" if breadth.advanceDeclineRatio <= 0.8 else "yellow"
    console.print(
        f"\n[bold]Active Universe:[/bold] [cyan]{universe_id.upper()}[/cyan] | "
        f"[bold]Total:[/bold] {breadth.total} | "
        f"[bold green]Advancers:[/bold green] {breadth.advancers} | "
        f"[bold red]Decliners:[/bold red] {breadth.decliners} | "
        f"[bold]A/D Ratio:[/bold] [{ad_color}]{breadth.advanceDeclineRatio}[/{ad_color}]\n"
    )

    table = Table(
        title=f"Market Matrix: {universe_id.upper()}",
        box=box.ROUNDED,
        header_style="bold magenta",
        show_lines=False,
    )
    table.add_column("Symbol", style="bold white", justify="left", width=10)
    table.add_column("Company Name", style="white", justify="left", width=24)
    table.add_column("Price", justify="right", width=10)
    table.add_column("Change", justify="right", width=10)
    table.add_column("% Change", justify="right", width=10)
    table.add_column("Sector", justify="left", width=16)
    table.add_column("Market Cap", justify="right", width=12)

    for s in stocks:
        is_pos = s.changePercent >= 0
        color = "green" if is_pos else "red"
        chg_sign = "+" if is_pos else ""
        table.add_row(
            s.symbol,
            s.name[:22],
            f"${s.price:,.2f}",
            f"[{color}]{chg_sign}{s.change:,.2f}[/{color}]",
            f"[{color}]{chg_sign}{s.changePercent:.2f}%[/{color}]",
            s.sector,
            s.marketCapFormatted,
        )

    console.print(table)


def display_stock_fundamentals(symbol: str):
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)

    if sym_upper in STOCK_FUNDAMENTALS:
        fund = STOCK_FUNDAMENTALS[sym_upper]
    elif found:
        fund = get_or_create_fundamentals(found)
    else:
        console.print(f"[bold red]Error:[/bold red] Symbol '{sym_upper}' not found in active catalogs.")
        return

    val = fund.valuation
    fin = fund.financials
    stab = fund.stabilityScore

    table = Table(title=f"Fundamental Valuation: {sym_upper} ({fund.companyName})", box=box.HEAVY_EDGE)
    table.add_column("Metric Category", style="bold cyan")
    table.add_column("Primary Value", style="bold white")
    table.add_column("Assessment / Context", style="dim white")

    table.add_row("Current Price", f"${fund.currentPrice:,.2f}", f"52W Range: ${fund.week52Low:,.2f} - ${fund.week52High:,.2f}")
    table.add_row("Trailing P/E", f"{val.peRatio:.2f}x" if val.peRatio else "N/A", "Earnings Multiplier")
    table.add_row("Forward P/E", f"{val.forwardPE:.2f}x" if val.forwardPE else "N/A", "Next 12M Estimate")
    table.add_row("PEG Ratio", f"{val.pegRatio:.2f}" if val.pegRatio else "N/A", "<1.0 indicates undervalued growth")
    table.add_row("Price-to-Book (P/B)", f"{val.priceToBook:.2f}x" if val.priceToBook else "N/A", "Asset valuation multiple")
    table.add_row("Operating Margin", f"{fin.operatingMargin:.1f}%", "EBIT / Total Revenue")
    table.add_row("Net Profit Margin", f"{fin.profitMargin:.1f}%", "Net Income / Total Revenue")
    table.add_row("Return on Equity (ROE)", f"{fin.returnOnEquity:.1f}%", "Capital allocation efficiency")
    table.add_row("Stability Grade", f"{stab.grade} ({stab.total}/100)", f"{stab.assessment} Solvency")

    console.print(table)


def display_technical_indicators(symbol: str):
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)
    sparkline = found.sparkline if found and found.sparkline else [140.0, 142.0, 141.5, 143.0, 145.0, 147.0, 146.5, 149.0, 150.0]

    indicators = get_technical_summary(sparkline)
    rsi = indicators["rsi"]
    macd = indicators["macd"]
    bb = indicators["bollingerBands"]

    table = Table(title=f"Technical Indicators Profile: {sym_upper}", box=box.ROUNDED)
    table.add_column("Indicator", style="bold cyan")
    table.add_column("Reading", style="bold white")
    table.add_column("Signal Interpretation", style="bold")

    rsi_color = "red" if rsi["condition"] == "OVERBOUGHT" else "green" if rsi["condition"] == "OVERSOLD" else "white"
    table.add_row("RSI (14-Period)", f"{rsi['rsi']:.2f}", f"[{rsi_color}]{rsi['condition']}[/{rsi_color}]")

    macd_color = "green" if macd["trend"] == "BULLISH_EXPANSION" else "red"
    table.add_row("MACD Line / Signal", f"{macd['macd']:.2f} / {macd['signal']:.2f}", f"[{macd_color}]{macd['trend']}[/{macd_color}]")

    table.add_row("Bollinger Upper Band", f"${bb['upper']:,.2f}", "2σ Resistance Level")
    table.add_row("Bollinger Middle Band", f"${bb['middle']:,.2f}", "20-Period Simple Moving Average")
    table.add_row("Bollinger Lower Band", f"${bb['lower']:,.2f}", "2σ Support Level")
    table.add_row("Composite Momentum Score", f"{indicators['compositeScore']:.1f}/100", f"[bold yellow]{indicators['signal']}[/bold yellow]")

    console.print(table)


def display_monte_carlo(symbol: str, days: int = 30, simulations: int = 1000):
    sym_upper = symbol.strip().upper()
    all_quotes = [q for quotes_list in INITIAL_STOCKS.values() for q in quotes_list]
    found = next((q for q in all_quotes if q.symbol.upper() == sym_upper), None)
    price = found.price if found else 150.0
    sparkline = found.sparkline if found and found.sparkline else None

    console.print(f"\n[cyan]Running {simulations:,} Geometric Brownian Motion paths for {sym_upper} over {days} days...[/cyan]")
    sim = run_monte_carlo_simulation(price, sparkline, days=days, num_simulations=simulations)

    table = Table(title=f"Monte Carlo Risk Engine: {sym_upper} ({days}-Day Horizon)", box=box.HEAVY)
    table.add_column("Risk / Return Dimension", style="bold cyan")
    table.add_column("Value", style="bold white")
    table.add_column("Risk Implication", style="dim white")

    table.add_row("Current Baseline Price", f"${sim['currentPrice']:,.2f}", "Starting T+0 valuation")
    table.add_row("Annualized Volatility (σ)", f"{sim['annualizedVolatility']:.1f}%", "Historical price variance")
    table.add_row("Expected Mean Price (T+30)", f"${sim['expectedPrice']:,.2f}", "Simulated average outcome")
    table.add_row("5th Percentile Floor", f"[red]${sim['percentile5th']:,.2f}[/red]", "95% statistical confidence floor")
    table.add_row("95th Percentile Ceiling", f"[green]${sim['percentile95th']:,.2f}[/green]", "Top 5% bull scenario")
    table.add_row("Value-at-Risk (95% VaR)", f"[red]${sim['var95']['dollarAmount']:,.2f} ({sim['var95']['percentage']:.1f}%)[/red]", "Max expected loss at 95% confidence")
    table.add_row("Value-at-Risk (99% VaR)", f"[bold red]${sim['var99']['dollarAmount']:,.2f} ({sim['var99']['percentage']:.1f}%)[/bold red]", "Extreme tail-risk loss limit")
    table.add_row("Expected Shortfall (CVaR)", f"[bold red]${sim['expectedShortfall']:,.2f}[/bold red]", "Average loss given a 95% tail event")

    console.print(table)


def run_copilot_interactive():
    console.print("\n[bold cyan]StockPulse AI Financial Copilot (Terminal Mode)[/bold cyan]")
    console.print("[dim]Type your financial query or 'back' to return to menu.[/dim]\n")
    while True:
        query = Prompt.ask("[bold green]Ask Copilot[/bold green]")
        if query.lower() in ["back", "exit", "quit", "q"]:
            break
        with console.status("[cyan]Analyzing quantitative models & search grounding...[/cyan]"):
            res = run_copilot_inference(query)
        console.print(Panel(res["message"], title=f"Copilot Response ({res['modelUsed']} • {res['latencyMs']}ms)", border_style="cyan"))


def interactive_menu():
    current_universe = "global-megacaps"
    while True:
        console.clear()
        render_banner()
        console.print(f"[bold]Active Universe:[/bold] [yellow]{current_universe.upper()}[/yellow]\n")
        console.print("[bold]1.[/bold] View Live Quotes Matrix")
        console.print("[bold]2.[/bold] Switch Market Universe")
        console.print("[bold]3.[/bold] Inspect Stock Fundamentals & Solvency")
        console.print("[bold]4.[/bold] View Technical Indicators (RSI, MACD, Bollinger)")
        console.print("[bold]5.[/bold] Run Monte Carlo Risk Simulation (GBM)")
        console.print("[bold]6.[/bold] Chat with AI Financial Copilot")
        console.print("[bold]7.[/bold] Run Automated Pytest Suite")
        console.print("[bold]8.[/bold] Exit\n")

        choice = Prompt.ask("Select an option", choices=["1", "2", "3", "4", "5", "6", "7", "8"], default="1")

        if choice == "1":
            display_quotes_table(current_universe)
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "2":
            universes = list(UNIVERSES_META.keys())
            console.print("\nAvailable Universes:")
            for idx, u in enumerate(universes, 1):
                console.print(f"[{idx}] {u} - {UNIVERSES_META[u]['name']}")
            u_choice = Prompt.ask("Choose universe number", choices=[str(i) for i in range(1, len(universes) + 1)])
            current_universe = universes[int(u_choice) - 1]
        elif choice == "3":
            sym = Prompt.ask("Enter stock symbol (e.g. NVDA, AAPL, MSFT)", default="NVDA")
            display_stock_fundamentals(sym)
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "4":
            sym = Prompt.ask("Enter stock symbol (e.g. NVDA, MSFT)", default="NVDA")
            display_technical_indicators(sym)
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "5":
            sym = Prompt.ask("Enter stock symbol", default="NVDA")
            days = int(Prompt.ask("Enter simulation days horizon", default="30"))
            display_monte_carlo(sym, days=days)
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "6":
            run_copilot_interactive()
        elif choice == "7":
            console.print("\n[cyan]Executing pytest suite across tests/ ...[/cyan]\n")
            import subprocess
            subprocess.run([".\\.venv\\Scripts\\python.exe", "-m", "pytest", "tests/", "-v"])
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "8":
            console.print("[cyan]Exiting StockPulse Terminal. Happy Trading![/cyan]")
            break


def main():
    parser = argparse.ArgumentParser(description="StockPulse Terminal CLI")
    parser.add_argument("--quotes", action="store_true", help="Display live quotes matrix and exit")
    parser.add_argument("--symbol", type=str, help="Stock symbol to inspect")
    parser.add_argument("--monte-carlo", action="store_true", help="Run Monte Carlo simulation")
    parser.add_argument("--indicators", action="store_true", help="Display technical indicators")
    parser.add_argument("--universe", type=str, default="global-megacaps", help="Universe identifier")
    args = parser.parse_args()

    if args.quotes:
        render_banner()
        display_quotes_table(args.universe)
    elif args.symbol and args.monte_carlo:
        render_banner()
        display_monte_carlo(args.symbol)
    elif args.symbol and args.indicators:
        render_banner()
        display_technical_indicators(args.symbol)
    elif args.symbol:
        render_banner()
        display_stock_fundamentals(args.symbol)
    else:
        interactive_menu()



if __name__ == "__main__":
    main()
