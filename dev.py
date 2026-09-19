#!/usr/bin/env python
"""
StockPulse Master Development Orchestrator (dev.py)
Launches the Python FastAPI backend (:8000) and the Node.js Express / Vite frontend (:3000)
concurrently with unified, colored terminal logs and graceful shutdown.
"""

import sys
import os
import subprocess
import signal
import threading
from typing import List

# Ensure UTF-8 on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

processes: List[subprocess.Popen] = []


def log(tag: str, color_code: str, message: str):
    print(f"\033[{color_code}m[{tag}]\033[0m {message}", flush=True)


def stream_logs(pipe, tag: str, color_code: str):
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            log(tag, color_code, line.rstrip())
    except Exception:
        pass


def shutdown(signum=None, frame=None):
    log("SYSTEM", "1;33", "Shutting down StockPulse development cluster...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=2)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass
    log("SYSTEM", "1;32", "Cluster stopped cleanly. Goodbye!")
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    print("\033[1;36m" + "=" * 76 + "\033[0m")
    print("\033[1;36m  [*] StockPulse Unified Development Orchestrator (dev.py)\033[0m")
    print("\033[1;36m      Python FastAPI Backend (:8000) + Node.js Express / Vite (:3000)\033[0m")
    print("\033[1;36m" + "=" * 76 + "\033[0m\n")

    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Path to Python in virtual environment
    venv_python = (
        os.path.join(root_dir, ".venv", "Scripts", "python.exe")
        if sys.platform == "win32"
        else os.path.join(root_dir, ".venv", "bin", "python")
    )
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    log("ORCHESTRATOR", "1;34", f"Using Python binary: {venv_python}")

    # 1. Start Python FastAPI Backend
    py_cmd = [venv_python, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    log("ORCHESTRATOR", "1;36", "Starting Python FastAPI Backend on http://localhost:8000 ...")
    try:
        py_proc = subprocess.Popen(
            py_cmd,
            cwd=root_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        processes.append(py_proc)
        threading.Thread(target=stream_logs, args=(py_proc.stdout, "Python Backend", "36"), daemon=True).start()
    except Exception as e:
        log("ERROR", "1;31", f"Failed to start Python backend: {e}")
        shutdown()

    # 2. Start Node.js Express + Vite Dev Server
    npm_cmd = "npm run dev"
    log("ORCHESTRATOR", "1;35", "Starting Node.js Express + Vite Server on http://localhost:3000 ...")
    try:
        node_proc = subprocess.Popen(
            npm_cmd,
            shell=True,
            cwd=root_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        processes.append(node_proc)
        threading.Thread(target=stream_logs, args=(node_proc.stdout, "Vite/Express", "35"), daemon=True).start()
    except Exception as e:
        log("ERROR", "1;31", f"Failed to start Node/Vite server: {e}")
        shutdown()

    log("ORCHESTRATOR", "1;32", "Both services are running! Press Ctrl+C to terminate both gracefully.")

    # Wait for either process to terminate
    for p in processes:
        p.wait()


if __name__ == "__main__":
    main()
