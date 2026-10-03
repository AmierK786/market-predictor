import pytest

from meridian.splits import iter_folds


def test_train_labels_finish_before_the_test_window():
    folds = list(iter_folds(80, train_size=20, test_size=10, gap=5, horizon=5))
    assert folds
    for train_start, train_end, test_start, test_end in folds:
        assert train_end - train_start == 20
        assert test_end - test_start == 10
        last_train = train_end - 1
        assert last_train + 5 < test_start


def test_gap_shorter_than_horizon_is_rejected():
    with pytest.raises(ValueError):
        list(iter_folds(40, train_size=10, test_size=5, gap=2, horizon=5))
