from src.detection.fake_detector import detect_pattern
from src.signal.signal_engine import generate_signal
from src.database.db import create_tables, save_analysis

def main():
    print("🚀 AI Trading Signal System Başladı\n")

    # DB oluştur
    create_tables()

    # analiz yap
    pattern = detect_pattern()
    result = generate_signal(pattern)

    print(f"Detected Pattern: {pattern}")
    print(f"Signal: {result['signal']}")
    print(f"Confidence: {result['confidence']}")

    # DB'ye kaydet
    save_analysis(
        user_id=1,
        pattern_id=1,
        signal_id=1,
        confidence=result["confidence"]
    )

if __name__ == "__main__":
    main()