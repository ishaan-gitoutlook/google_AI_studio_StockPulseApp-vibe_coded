#!/usr/bin/env python
"""
StockPulse API Latency & Concurrency Benchmark (Python)
Measures throughput, response latency, and caching efficiency using httpx.
"""

import sys
import time
import asyncio
from typing import List, Dict, Any
import httpx
from rich.console import Console
from rich.table import Table
from rich import box

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

console = Console(legacy_windows=False)

ENDPOINTS = [
    ("/health", "GET", None),
    ("/api/v1/universes", "GET", None),
    ("/api/v1/quotes?symbols=NVDA,AAPL,MSFT", "GET", None),
    ("/api/v1/research?symbol=NVDA", "GET", None),
    ("/api/v1/analytics/indicators?symbol=NVDA", "GET", None),
    ("/api/v1/analytics/monte-carlo?symbol=NVDA&simulations=500", "GET", None),
    ("/api/v1/tests/unit", "GET", None),
]


async def benchmark_endpoint(client: httpx.AsyncClient, base_url: str, path: str, method: str, num_requests: int = 20) -> Dict[str, Any]:
    latencies: List[float] = []
    status_codes: List[int] = []

    for _ in range(num_requests):
        t0 = time.time()
        try:
            if method == "GET":
                resp = await client.get(f"{base_url}{path}")
            else:
                resp = await client.post(f"{base_url}{path}")
            latencies.append((time.time() - t0) * 1000)
            status_codes.append(resp.status_code)
        except Exception:
            latencies.append(9999.0)
            status_codes.append(500)

    avg_latency = sum(latencies) / len(latencies)
    min_latency = min(latencies)
    max_latency = max(latencies)
    success_rate = (status_codes.count(200) / len(status_codes)) * 100

    return {
        "path": path,
        "method": method,
        "requests": num_requests,
        "avgMs": round(avg_latency, 2),
        "minMs": round(min_latency, 2),
        "maxMs": round(max_latency, 2),
        "successRate": round(success_rate, 1),
    }


async def main():
    target_port = 8000 if len(sys.argv) <= 1 else int(sys.argv[1])
    base_url = f"http://127.0.0.1:{target_port}"

    console.print(f"\n[bold cyan][*] Running StockPulse Benchmark on {base_url} ...[/bold cyan]\n")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Verify host availability
        try:
            await client.get(f"{base_url}/health")
        except Exception as e:
            console.print(f"[bold red]Cannot connect to {base_url}:[/bold red] {e}")
            console.print("[yellow]Ensure the server is running (e.g. via 'python dev.py' or 'uvicorn backend.main:app --port 8000').[/yellow]\n")
            return

        table = Table(title=f"Benchmark Results ({base_url})", box=box.ROUNDED)
        table.add_column("Endpoint", style="bold white", width=42)
        table.add_column("Method", style="cyan", justify="center", width=8)
        table.add_column("Requests", justify="right", width=10)
        table.add_column("Avg Latency", justify="right", width=12)
        table.add_column("Min / Max", justify="right", width=16)
        table.add_column("Success", justify="right", width=10)

        for path, method, _ in ENDPOINTS:
            res = await benchmark_endpoint(client, base_url, path, method, num_requests=15)
            color = "green" if res["successRate"] == 100.0 else "red"
            lat_color = "green" if res["avgMs"] < 15.0 else "yellow" if res["avgMs"] < 100.0 else "red"

            table.add_row(
                res["path"],
                res["method"],
                str(res["requests"]),
                f"[{lat_color}]{res['avgMs']} ms[/{lat_color}]",
                f"{res['minMs']} / {res['maxMs']} ms",
                f"[{color}]{res['successRate']}%[/{color}]",
            )

        console.print(table)


if __name__ == "__main__":
    asyncio.run(main())
