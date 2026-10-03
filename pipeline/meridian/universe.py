"""Liquid US names used by the forecast bench."""

UNIVERSE: list[tuple[str, str]] = [
    ("SPY", "SPDR S&P 500"),
    ("QQQ", "Invesco QQQ"),
    ("AAPL", "Apple"),
    ("MSFT", "Microsoft"),
    ("NVDA", "NVIDIA"),
    ("AMZN", "Amazon"),
    ("GOOGL", "Alphabet"),
    ("META", "Meta Platforms"),
    ("JPM", "JPMorgan Chase"),
    ("XOM", "Exxon Mobil"),
]

NAMES = {symbol: name for symbol, name in UNIVERSE}
SYMBOLS = [symbol for symbol, _name in UNIVERSE]
