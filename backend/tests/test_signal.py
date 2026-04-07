import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.signal.signal_engine import generate_signal

def test_generate_signal_double_top():
    result = generate_signal("double_top")
    assert result["signal"] == "SELL"
    assert result["confidence"] == 0.85

def test_generate_signal_triangle():
    result = generate_signal("triangle")
    assert result["signal"] == "BREAKOUT"
    assert result["confidence"] == 0.75

def test_generate_signal_unknown():
    result = generate_signal("unknown_pattern")
    assert result["signal"] == "HOLD"
    assert result["confidence"] == 0.50
