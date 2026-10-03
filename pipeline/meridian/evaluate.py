"""Fit baselines and ridge out of sample, then score them."""

import numpy as np
import pandas as pd

from meridian import (
    COST_BPS,
    FEATURE_COLUMNS,
    HORIZON_DAYS,
    TRAIN_DAYS,
)
from meridian.features import build_frame
from meridian.metrics import (
    decision_curve,
    directional_accuracy,
    mae,
    rank_correlation,
)
from meridian.models import fit_ridge, momentum_forecast, predict_ridge, zero_forecast
from meridian.splits import iter_folds


def _metric_block(predicted: list[float], realized: list[float]) -> dict:
    pred = np.asarray(predicted, dtype=float)
    real = np.asarray(realized, dtype=float)
    if pred.size == 0:
        return {
            "mae": None,
            "directionalAccuracy": None,
            "rankCorrelation": None,
            "n": 0,
        }
    return {
        "mae": mae(pred, real),
        "directionalAccuracy": directional_accuracy(pred, real),
        "rankCorrelation": rank_correlation(pred, real),
        "n": int(pred.size),
    }


def evaluate_symbol(frame: pd.DataFrame) -> dict:
    featured = build_frame(frame)
    labeled = featured.dropna(subset=FEATURE_COLUMNS + ["forward_return"]).reset_index(drop=True)
    ready = featured.dropna(subset=FEATURE_COLUMNS)
    if ready.empty:
        raise ValueError("no rows with complete features")

    as_of = ready.iloc[-1]
    collected = {"zero": [], "momentum": [], "ridge": []}
    realized: list[float] = []
    dates: list[str] = []

    for train_start, train_end, test_start, test_end in iter_folds(len(labeled)):
        train = labeled.iloc[train_start:train_end]
        test = labeled.iloc[test_start:test_end]
        model = fit_ridge(
            train[FEATURE_COLUMNS].to_numpy(),
            train["forward_return"].to_numpy(),
        )
        ridge_hat = predict_ridge(model, test[FEATURE_COLUMNS].to_numpy())
        collected["ridge"].extend(ridge_hat.tolist())
        collected["momentum"].extend(momentum_forecast(test["ret_21"].to_numpy()).tolist())
        collected["zero"].extend(zero_forecast(len(test)).tolist())
        realized.extend(test["forward_return"].astype(float).tolist())
        dates.extend(pd.to_datetime(test["date"]).dt.strftime("%Y-%m-%d").tolist())

    train_live = labeled.tail(min(TRAIN_DAYS, len(labeled)))
    live = fit_ridge(
        train_live[FEATURE_COLUMNS].to_numpy(),
        train_live["forward_return"].to_numpy(),
    )
    forecast = float(predict_ridge(live, as_of[FEATURE_COLUMNS].to_numpy().reshape(1, -1))[0])
    weights = live.named_steps["ridge"].coef_
    coefficients = [
        {"feature": name, "weight": float(weight)}
        for name, weight in zip(FEATURE_COLUMNS, weights, strict=True)
    ]
    curve = decision_curve(
        dates,
        collected["ridge"],
        realized,
        step=HORIZON_DAYS,
        cost=COST_BPS / 10_000,
    )
    direction = "up" if forecast > 0 else "down" if forecast < 0 else "flat"
    prices = [
        {
            "date": pd.Timestamp(row.date).strftime("%Y-%m-%d"),
            "close": float(row.close),
        }
        for row in frame.sort_values("date").itertuples(index=False)
    ]
    return {
        "asOf": pd.Timestamp(as_of["date"]).strftime("%Y-%m-%d"),
        "lastClose": float(as_of["close"]),
        "forecastReturn": forecast,
        "direction": direction,
        "coefficients": coefficients,
        "metrics": {name: _metric_block(values, realized) for name, values in collected.items()},
        "prices": prices,
        "equity": curve,
        "strategyMultiple": curve[-1]["model"] if curve else 1.0,
        "buyHoldMultiple": curve[-1]["buyHold"] if curve else 1.0,
    }
