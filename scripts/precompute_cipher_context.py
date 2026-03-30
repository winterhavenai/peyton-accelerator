#!/usr/bin/env python3
"""
Precompute grounded context from CIPHER-KNOWLEDGE-BASE for all curriculum topics.
Saves results to src/cipherContext.json (relative to repo root).

Run locally:
    cd ~/theforcemultiplier && python3 scripts/precompute_cipher_context.py

Also runs via GitHub Actions (see .github/workflows/sync-cipher-context.yml).
"""

import json
import re
import subprocess
import sys
import time
from pathlib import Path

NOTEBOOK_ID = "18565269-d726-4644-93a7-7bf3c4664f50"

# Resolve output path relative to repo root (parent of scripts/)
REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = REPO_ROOT / "src" / "cipherContext.json"

# All 26 unique curriculum titles from App.jsx
TITLES = [
    # Days 1-5 (SPARK)
    "SEE IT — Discover AI Through Cybersecurity",
    "PROMPT IT — Learn to Talk to AI Like an Analyst",
    "APPLY IT — Build Your First Real Security Asset",
    "REMIX IT — Explore the Cybersecurity AI Ecosystem",
    "KEEP IT GOING — Design Your 90-Day Plan",
    # Days 6-18 (Foundation explicit)
    "Networking Fundamentals with AI",
    "Linux Command Line — First Real Terminal Session",
    "Cryptography Fundamentals",
    "Threat Landscape — Real Attacks in 2026",
    "Python for Security — Your First Script",
    "OWASP Top 10 — Web Vulnerabilities",
    "Your First CTF — TryHackMe Live",
    "Social Engineering — The Human Attack Surface",
    "Week 2-3 Review + Portfolio Update",
    "Firewalls, IDS, and Network Defense",
    "Setting Up Your Security Lab",
    "Vulnerability Scanning Basics",
    "Write Your First Vulnerability Report",
    # Day 23
    "CTF Deep Dive — TryHackMe Level 2 + Proof",
    # Day 30
    "30-DAY GRADUATION — GitHub Portfolio Launch",
    # Day 45
    "Mid-Point — 45 Days Strong",
    # Day 60
    "60-DAY REVIEW — Launch Milestone",
    # Day 90
    "90-DAY GRADUATION — UCF READY",
    # Dynamic fallback titles
    "Foundation Session",
    "Builder Session",
    "UCF Ready Session",
]

DELAY_SECONDS = 3


def select_notebook():
    """Select the CIPHER-KNOWLEDGE-BASE notebook."""
    result = subprocess.run(
        ["python3", "-m", "notebooklm", "use", NOTEBOOK_ID],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"ERROR: Could not select notebook: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    print(f"Selected notebook {NOTEBOOK_ID}")


def query_topic(topic: str) -> str:
    """Query NotebookLM for a single topic."""
    try:
        result = subprocess.run(
            ["python3", "-m", "notebooklm", "ask", topic],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode != 0:
            print(f"  WARNING: Query failed: {result.stderr.strip()}", file=sys.stderr)
            return ""
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print(f"  WARNING: Query timed out after 120s", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"  WARNING: {e}", file=sys.stderr)
        return ""


def clean_text(text: str) -> str:
    """Strip NotebookLM formatting: 'Answer:' prefix, citation markers [1], [2], etc."""
    text = re.sub(r"^Answer:\s*\n?", "", text)
    text = re.sub(r"\s*\[\d+(?:,\s*\d+)*\]", "", text)
    text = re.sub(r"(?:\[\d+\])+", "", text)
    text = re.sub(r"  +", " ", text)
    return text.strip()


def main():
    print(f"Precomputing grounded context for {len(TITLES)} unique topics...")
    print(f"Output: {OUTPUT_PATH}\n")

    select_notebook()

    context = {}
    for i, title in enumerate(TITLES, 1):
        print(f"[{i}/{len(TITLES)}] Querying: {title}")
        text = query_topic(title)
        if text:
            text = clean_text(text)
            context[title] = text
            print(f"  OK ({len(text)} chars)")
        else:
            print(f"  EMPTY — no context returned")

        if i < len(TITLES):
            time.sleep(DELAY_SECONDS)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(context, f, indent=2)

    print(f"\nDone. {len(context)}/{len(TITLES)} topics grounded.")
    print(f"Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
