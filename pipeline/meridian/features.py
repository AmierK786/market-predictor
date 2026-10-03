"""Price features that use only information available on each date."""

import numpy as np
import pandas as pd

from meridian import FEATURE_COLUMNS, HORIZON_DAYS

__all__ = ["FEATURE_COLUMNS", "build_frame"]


def build_frame(frame: pd.DataFrame) -> pd.DataFrame:
    """Add lagged features and the forward label.

    ``frame`` needs ``date``, ``close``, and ``volume``. Features on a row use
    prices and volume through that row. ``forward_return`` is the log return
    over the next ``HORIZON_DAYS`` trading days and is not a feature.
    """

    out = frame.sort_values("date").reset_index(drop=True).copy()
    close = out["close"].astype(float)
    volume = out["volume"].astype(float)
    log_close = np.log(close)
    ret_1 = log_close.diff(1)
    out["ret_1"] = ret_1
    out["ret_5"] = log_close.diff(5)
    out["ret_21"] = log_close.diff(21)
    out["vol_21"] = ret_1.rolling(21, min_periods=21).std()
    vol_mean = volume.rolling(21, min_periods=21).mean()
    vol_std = volume.rolling(21, min_periods=21).std()
    out["volume_z"] = (volume - vol_mean) / vol_std.where(vol_std > 0)
    out["forward_return"] = log_close.shift(-HORIZON_DAYS) - log_close
    return out
