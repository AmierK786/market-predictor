"""CLI: ``python -m meridian fetch``, ``run``, or ``all``."""

import argparse
from pathlib import Path

from meridian.export import run_pipeline
from meridian.fetch import fetch_ohlcv

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def main() -> None:
    parser = argparse.ArgumentParser(prog="meridian")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("fetch", help="download daily bars into data/ohlcv.parquet")
    commands.add_parser("run", help="score models and write data/results.json")
    commands.add_parser("all", help="fetch, then score")
    args = parser.parse_args()
    DATA.mkdir(parents=True, exist_ok=True)
    if args.command in ("fetch", "all"):
        fetch_ohlcv(DATA / "ohlcv.parquet")
    if args.command in ("run", "all"):
        payload = run_pipeline(DATA / "ohlcv.parquet", DATA / "results.json")
        for row in payload["scorecard"]:
            ridge = row["metrics"]["ridge"]
            hit = ridge["directionalAccuracy"]
            hit_text = "n/a" if hit is None else f"{hit:.1%}"
            print(f"{row['symbol']}: ridge hit {hit_text}, forecast {row['forecastReturn']:+.4f}")


if __name__ == "__main__":
    main()
