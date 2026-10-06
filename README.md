# Meridian

Meridian is a daily forecast bench for ten liquid US stocks. A ridge model is right about half the time out of sample and usually trails buy-and-hold. The scorecard puts that purged hit rate next to the same model fit on the days it is graded on, which is what a leaked score looks like.

The evaluation is walk-forward. Training uses about two years of history and stops five trading days before each test window, so a training label cannot reach into the period being scored. Hit rates near one half are the expected neighborhood. Trailing buy-and-hold is a valid result. Meridian does not place orders.

## Run the dashboard

Requires Node.js 22.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317). The scorecard, a ticker page, and the methodology page all read `data/results.json`.

## Regenerate the forecasts

Requires Python 3.12 and [uv](https://docs.astral.sh/uv/).

```bash
cd pipeline
uv sync
uv run python -m meridian run
```

That scores the checked-in prices in `data/ohlcv.parquet`. To download a fresh snapshot from Yahoo Finance first:

```bash
uv run python -m meridian fetch
uv run python -m meridian run
```

`uv run pytest` runs the leakage, split, and metric tests.

## What is in the model

Features on date T are the 1-day, 5-day, and 21-day log returns, 21-day volatility, and a 21-day volume z-score. The label is the log return over the next five trading days. Zero predicts no move. Momentum projects the trailing 21-day move onto a five-day horizon. Ridge is fit inside each training window on standardized features.

The long-or-cash rule is invested only when the ridge forecast is positive. It steps every five trading days so the returns do not overlap, and it pays 5 basis points when the position changes.

Universe: SPY, QQQ, AAPL, MSFT, NVDA, AMZN, GOOGL, META, JPM, XOM.

## Talking about it

Lead with the split, not the hit rate. The purged gap is what keeps the test honest. Compare the curve with buy-and-hold before calling a name a win. A sign that is right slightly more than half the time can still lose to holding the stock.
