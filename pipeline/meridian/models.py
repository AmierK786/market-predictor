"""Forecast models. Zero and momentum are baselines. Ridge is the model under test."""

import numpy as np
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from meridian import HORIZON_DAYS


def zero_forecast(n: int) -> np.ndarray:
    return np.zeros(n, dtype=float)


def momentum_forecast(ret_21: np.ndarray) -> np.ndarray:
    """Scale the trailing 21-day log return to the 5-day horizon."""

    return np.asarray(ret_21, dtype=float) * (HORIZON_DAYS / 21)


def fit_ridge(train_x: np.ndarray, train_y: np.ndarray) -> Pipeline:
    model = Pipeline(
        [
            ("scale", StandardScaler()),
            ("ridge", Ridge(alpha=1.0)),
        ]
    )
    model.fit(train_x, train_y)
    return model


def predict_ridge(model: Pipeline, test_x: np.ndarray) -> np.ndarray:
    return np.asarray(model.predict(test_x), dtype=float)
