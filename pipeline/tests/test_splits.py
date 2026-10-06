import pytest

from meridian.splits import insample_folds, iter_folds


def test_train_labels_finish_before_the_test_window():
    folds = list(iter_folds(80, train_size=20, test_size=10, gap=5, horizon=5))
    assert folds
    for train_start, train_end, test_start, test_end in folds:
        assert train_end - train_start == 20
        assert test_end - test_start == 10
        last_train = train_end - 1
        assert last_train + 5 < test_start


def test_insample_folds_grade_rows_the_model_was_fit_on():
    honest = list(iter_folds(80, train_size=20, test_size=10, gap=5, horizon=5))
    leaked = list(insample_folds(honest))
    assert len(leaked) == len(honest)
    for (_hs, honest_end, test_start, test_end), (leak_start, leak_end, leak_test, leak_stop) in zip(
        honest, leaked, strict=True
    ):
        assert (leak_test, leak_stop) == (test_start, test_end)
        assert (leak_start, leak_end) == (test_start, test_end)
        assert honest_end - 1 + 5 < test_start


def test_gap_shorter_than_horizon_is_rejected():
    with pytest.raises(ValueError):
        list(iter_folds(40, train_size=10, test_size=5, gap=2, horizon=5))
