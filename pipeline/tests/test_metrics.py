import numpy as np
import pytest

from meridian.metrics import decision_curve, directional_accuracy, mae, rank_correlation
from meridian.models import momentum_forecast


def test_mae_and_direction_on_a_known_fixture():
    predicted = np.array([0.1, -0.2, 0.3])
    realized = np.array([0.2, -0.1, -0.4])
    assert mae(predicted, realized) == np.mean([0.1, 0.1, 0.7])
    assert directional_accuracy(predicted, realized) == 2 / 3


def test_flat_forecast_has_no_directional_accuracy():
    assert directional_accuracy(np.zeros(4), np.array([0.1, -0.2, 0.3, -0.1])) is None
    assert rank_correlation(np.zeros(4), np.array([0.1, -0.2, 0.3, -0.1])) is None


def test_momentum_scales_a_21_day_return_to_five_days():
    assert momentum_forecast(np.array([0.21]))[0] == pytest.approx(0.05)


def test_decision_curve_charges_a_position_change():
    dates = [f"2024-01-{day:02d}" for day in range(1, 7)]
    predicted = [0.1, 0, 0, 0, 0, -0.1]
    realized = [0.0, 0, 0, 0, 0, 0.0]
    curve = decision_curve(dates, predicted, realized, step=5, cost=0.0005)
    assert len(curve) == 2
    assert curve[0]["date"] == "2024-01-01"
    assert curve[1]["date"] == "2024-01-06"
    assert curve[0]["model"] == 1 - 0.0005
    assert curve[1]["model"] == (1 - 0.0005) * (1 - 0.0005)
    assert curve[1]["buyHold"] == 1
