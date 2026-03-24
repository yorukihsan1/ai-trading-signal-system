def generate_signal(pattern):
    if pattern == "double_top":
        return {
            "signal": "SELL",
            "confidence": 0.85
        }
    elif pattern == "triangle":
        return {
            "signal": "BREAKOUT",
            "confidence": 0.75
        }
    elif pattern == "head_shoulders":
        return {
            "signal": "SELL",
            "confidence": 0.90
        }
    else:
        return {
            "signal": "HOLD",
            "confidence": 0.50
        }