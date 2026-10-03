"""Run every symbol and write the dashboard JSON."""

import json
from datetime import datetime, timezone

import pandas as pd

from meridian import COST_BPS, GAP_DAYS, HORIZON_DAYS, TEST_DAYS, TRAIN_DAYS
from meridian.evaluate import evaluate_symbol
from meridian.universe import SYMBOLS, UNIVERSE


def _jsonable(value):
    if isinstance(value, dict):
        return {key: _jsonable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_jsonable(item) for item in value]
    if isinstance(value, float):
        return round(value, 6)
    return value


def run_pipeline(ohlcv_path, results_path) -> dict:
    prices = pd.read_parquet(ohlcv_path)
    prices["date"] = pd.to_datetime(prices["date"])
    tickers = {}
    scorecard = []
    for symbol, name in UNIVERSE:
        frame = prices.loc[prices["symbol"] == symbol, ["date", "close", "volume"]].copy()
        if frame.empty:
            raise RuntimeError(f"missing prices for {symbol}")
        detail = evaluate_symbol(frame)
        detail["symbol"] = symbol
        detail["name"] = name
        tickers[symbol] = detail
        scorecard.append(
            {
                "symbol": symbol,
                "name": name,
                "asOf": detail["asOf"],
                "lastClose": detail["lastClose"],
                "forecastReturn": detail["forecastReturn"],
                "direction": detail["direction"],
                "metrics": detail["metrics"],
                "strategyMultiple": detail["strategyMultiple"],
                "buyHoldMultiple": detail["buyHoldMultiple"],
            }
        )
    payload = {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "horizonDays": HORIZON_DAYS,
        "trainDays": TRAIN_DAYS,
        "testDays": TEST_DAYS,
        "gapDays": GAP_DAYS,
        "costBps": COST_BPS,
        "universe": SYMBOLS,
        "scorecard": scorecard,
        "tickers": tickers,
    }
    payload = _jsonable(payload)
    results_path.parent.mkdir(parents=True, exist_ok=True)
    results_path.write_text(json.dumps(payload), encoding="utf-8")
    return payload
