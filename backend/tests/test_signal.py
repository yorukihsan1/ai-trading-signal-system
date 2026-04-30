import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.signal.signal_engine import generate_signal

def test_generate_signal_double_top():
    result = generate_signal("double_top")
    assert result["signal"] == "SELL"
    # Varsayılan dynamic_conf=0.50 olduğu için sonuç 0.50 gelir
    assert result["confidence"] == 0.50

def test_generate_signal_triangle():
    result = generate_signal("triangle")
    assert result["signal"] == "BUY"
    assert result["confidence"] == 0.50

def test_generate_signal_unknown():
    result = generate_signal("unknown_pattern")
    assert result["signal"] == "HOLD"
    assert result["confidence"] == 0.50
