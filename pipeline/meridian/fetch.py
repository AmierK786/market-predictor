"""Download adjusted daily bars. Yahoo's chart endpoint is tried first."""

import json
import time
import urllib.request

import pandas as pd

from meridian.universe import SYMBOLS

CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={start}&period2={end}&interval=1d&includeAdjustedClose=true"


def _chart_symbol(symbol: str, start: str, end: str) -> pd.DataFrame:
    start_ts = int(pd.Timestamp(start, tz="UTC").timestamp())
    end_ts = int(pd.Timestamp(end, tz="UTC").timestamp())
    url = CHART_URL.format(symbol=symbol, start=start_ts, end=end_ts)
    request = urllib.request.Request(url, headers={"User-Agent": "Meridian/0.1"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode())
    result = payload["chart"]["result"][0]
    timestamps = result.get("timestamp") or []
    quote = result["indicators"]["quote"][0]
    adjusted = result["indicators"].get("adjclose", [{}])[0].get("adjclose")
    closes = adjusted if adjusted is not None else quote["close"]
    rows = []
    for index, stamp in enumerate(timestamps):
        close = closes[index]
        if close is None:
            continue
        rows.append(
            {
                "symbol": symbol,
                "date": pd.Timestamp(stamp, unit="s", tz="UTC").tz_convert(None).normalize(),
                "open": quote["open"][index],
                "high": quote["high"][index],
                "low": quote["low"][index],
                "close": float(close),
                "volume": float(quote["volume"][index] or 0),
            }
        )
    if not rows:
        raise RuntimeError(f"no prices returned for {symbol}")
    return pd.DataFrame(rows)


def _yfinance_symbol(symbol: str, start: str, end: str) -> pd.DataFrame:
    import yfinance as yf

    history = yf.Ticker(symbol).history(start=start, end=end, auto_adjust=True)
    if history.empty:
        raise RuntimeError(f"yfinance returned no rows for {symbol}")
    frame = history.reset_index()
    frame["date"] = pd.to_datetime(frame["Date"]).dt.tz_localize(None).dt.normalize()
    return pd.DataFrame(
        {
            "symbol": symbol,
            "date": frame["date"],
            "open": frame["Open"].astype(float),
            "high": frame["High"].astype(float),
            "low": frame["Low"].astype(float),
            "close": frame["Close"].astype(float),
            "volume": frame["Volume"].astype(float),
        }
    )


def download_symbol(symbol: str, start: str, end: str) -> pd.DataFrame:
    try:
        return _chart_symbol(symbol, start, end)
    except Exception:
        return _yfinance_symbol(symbol, start, end)


def fetch_ohlcv(path, start: str = "2021-01-01", end: str | None = None) -> pd.DataFrame:
    end = end or pd.Timestamp.today().strftime("%Y-%m-%d")
    frames = []
    for symbol in SYMBOLS:
        frames.append(download_symbol(symbol, start, end))
        time.sleep(0.2)
    data = pd.concat(frames, ignore_index=True)
    data = data.drop_duplicates(subset=["symbol", "date"]).sort_values(["symbol", "date"])
    path.parent.mkdir(parents=True, exist_ok=True)
    data.to_parquet(path, index=False)
    return data
