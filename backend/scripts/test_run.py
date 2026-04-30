import sys
import os
from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal
from src.database.db import create_tables, save_analysis

# Terminal encoding ayarı
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("Sistem başlatıldı...\n")

    # DB kurulumu
    create_tables()

    # Test
    ticker = "BTCUSDT"
    print(f"{ticker} analiz ediliyor...")
    
    pattern, df, peaks, troughs, pattern_points, dynamic_conf = fetch_and_analyze_data(ticker, limit=90)
    
    if pattern == "error":
        print("Hata: Veri alınamadı.")
        return

    result = generate_signal(pattern, dynamic_conf)

    print(f"Formasyon: {pattern}")
    print(f"Sinyal: {result['signal']}")
    print(f"Güven: {result['confidence']}")

    # Kaydet
    try:
        save_analysis(
            u_id=1,
            p_id=pattern,
            s_id=result["signal"],
            conf=result["confidence"]
        )
        print("Analiz kaydedildi.")
    except Exception as e:
        print(f"DB Hatası: {e}")

if __name__ == "__main__":
    main()