from src.detection.fake_detector import detect_pattern
from src.signal.signal_engine import generate_signal

def main():
    print("🚀 AI Trading Signal System Başladı\n")

    pattern = detect_pattern()
    result = generate_signal(pattern)

    print(f"Detected Pattern: {pattern}")
    print(f"Signal: {result['signal']}")
    print(f"Confidence: {result['confidence']}")

if __name__ == "__main__":
    main()