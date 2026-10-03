"""Purged walk-forward splits.

The label on row ``t`` uses the close ``HORIZON_DAYS`` trading days later.
Training stops early enough that those labels finish before the test window starts.
"""

from meridian import GAP_DAYS, HORIZON_DAYS, TEST_DAYS, TRAIN_DAYS


def iter_folds(
    n_rows: int,
    train_size: int = TRAIN_DAYS,
    test_size: int = TEST_DAYS,
    gap: int = GAP_DAYS,
    horizon: int = HORIZON_DAYS,
):
    """Yield ``(train_start, train_end, test_start, test_end)`` slices.

    Ends are exclusive. ``horizon`` is checked so a caller cannot request a gap
    shorter than the label.
    """

    if gap < horizon:
        raise ValueError("gap must be at least the forecast horizon")
    start = train_size + gap
    test_start = start
    while test_start + test_size <= n_rows:
        train_end = test_start - gap
        train_start = train_end - train_size
        yield train_start, train_end, test_start, test_start + test_size
        test_start += test_size
