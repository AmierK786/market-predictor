"""Walk-forward equity forecasts with leakage-safe evaluation."""

HORIZON_DAYS = 5
TRAIN_DAYS = 504
TEST_DAYS = 21
GAP_DAYS = 5
COST_BPS = 5
FEATURE_COLUMNS = ["ret_1", "ret_5", "ret_21", "vol_21", "volume_z"]
