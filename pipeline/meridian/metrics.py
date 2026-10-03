"""Error, direction, and a non-overlapping long-or-cash curve."""

import math

import numpy as np
import pandas as pd


def mae(predicted: np.ndarray, realized: np.ndarray) -> float:
    return float(np.mean(np.abs(np.asarray(predicted) - np.asarray(realized))))


def directional_accuracy(predicted: np.ndarray, realized: np.ndarray) -> float | None:
    predicted = np.asarray(predicted, dtype=float)
    realized = np.asarray(realized, dtype=float)
    mask = (predicted != 0) & (realized != 0)
    if int(mask.sum()) == 0:
        return None
    hits = np.sign(predicted[mask]) == np.sign(realized[mask])
    return float(np.mean(hits))


def rank_correlation(predicted: np.ndarray, realized: np.ndarray) -> float | None:
    predicted = np.asarray(predicted, dtype=float)
    realized = np.asarray(realized, dtype=float)
    if predicted.size < 2 or np.std(predicted) == 0 or np.std(realized) == 0:
        return None
    value = pd.Series(predicted).corr(pd.Series(realized), method="spearman")
    if value is None or math.isnan(float(value)):
        return None
    return float(value)


def decision_curve(
    dates: list[str],
    predicted: list[float],
    realized: list[float],
    step: int,
    cost: float,
) -> list[dict]:
    """Compound non-overlapping 5-day outcomes.

    A long position is taken when the forecast is positive. Cash otherwise.
    ``cost`` is charged when the position changes, including the first entry.
    Buy-and-hold compounds the same realized returns with no cost.
    """

    if step < 1:
        raise ValueError("step must be positive")
    wealth = 1.0
    buy_hold = 1.0
    previous = 0.0
    points: list[dict] = []
    for index in range(0, len(dates), step):
        forecast = predicted[index]
        outcome = realized[index]
        position = 1.0 if forecast > 0 else 0.0
        traded = cost if position != previous else 0.0
        simple = (math.exp(outcome) - 1.0) * position - traded
        wealth *= 1.0 + simple
        buy_hold *= math.exp(outcome)
        previous = position
        points.append(
            {
                "date": dates[index],
                "model": wealth,
                "buyHold": buy_hold,
            }
        )
    return points
