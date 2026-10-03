import numpy as np
import pandas as pd
import pytest

from meridian.features import FEATURE_COLUMNS, build_frame


def _prices(closes, volumes=None):
    dates = pd.bdate_range("2020-01-01", periods=len(closes))
    return pd.DataFrame(
        {
            "date": dates,
            "close": closes,
            "volume": volumes if volumes is not None else np.linspace(1_000_000, 2_000_000, len(closes)),
        }
    )


def test_forward_return_is_not_a_feature():
    frame = build_frame(_prices(np.linspace(100, 160, 40)))
    assert "forward_return" not in FEATURE_COLUMNS
    row = frame.iloc[30]
    expected = np.log(frame.iloc[35]["close"] / row["close"])
    assert row["forward_return"] == pytest.approx(expected)


def test_features_ignore_a_later_close():
    closes = np.linspace(100, 140, 40)
    original = build_frame(_prices(closes))
    changed = closes.copy()
    changed[35] = 999
    updated = build_frame(_prices(changed))
    for column in FEATURE_COLUMNS:
        assert original.iloc[30][column] == pytest.approx(updated.iloc[30][column])
        assert np.isfinite(original.iloc[30][column])
    assert original.iloc[30]["forward_return"] != updated.iloc[30]["forward_return"]
