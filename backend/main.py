from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal
from src.database.db import create_tables, save_analysis
import os

def main():
    print("🚀 AI Trading Signal System Başladı\n")

    # DB oluştur
    create_tables()

    # analiz yap (Test için)
    print("Masaüstü/Terminal analizi için AAPL hissesi canlı test ediliyor...")
    
    # Gerçek sembol üzerinden test
    pattern, df, peaks, troughs, pattern_points = fetch_and_analyze_data("AAPL", limit=90)
    result = generate_signal(pattern)

    print(f"Detected Pattern/Trend: {pattern}")
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