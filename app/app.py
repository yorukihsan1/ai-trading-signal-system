import sys
import os
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
from src.detection.fake_detector import detect_pattern
from src.signal.signal_engine import generate_signal
from src.database.db import save_analysis, get_all_analysis

st.title("📊 AI Trading Signal System")

# 🔹 ANALİZ BUTONU
if st.button("Analiz Et"):
    pattern = detect_pattern()
    result = generate_signal(pattern)

    st.write(f"### Pattern: {pattern}")
    st.write(f"### Signal: {result['signal']}")
    st.write(f"### Confidence: {result['confidence']}")

    # 👉 DB’ye kaydet
    save_analysis(
        user_id=1,
        pattern_id=1,
        signal_id=1,
        confidence=result["confidence"]
    )

    st.success("✅ Analiz kaydedildi!")

# 🔹 GEÇMİŞ BUTONU
if st.button("Geçmiş Analizleri Göster"):
    data = get_all_analysis()

    if not data:
        st.warning("Kayıt bulunamadı")
    else:
        df = pd.DataFrame(data, columns=[
            "ID", "User", "Pattern", "Signal",
            "Confidence", "Entry", "Target",
            "Stop Loss", "Risk", "Type", "Date"
        ])

        # 🔹 Mapping tanımla
        pattern_map = {
            1: "Triangle",
            2: "Double Top",
            3: "Head & Shoulders"
        }

        signal_map = {
            1: "BUY",
            2: "SELL",
            3: "HOLD",
            4: "BREAKOUT"
        }

        # 🔹 ID → isim dönüşümü
        df["Pattern"] = df["Pattern"].map(pattern_map)
        df["Signal"] = df["Signal"].map(signal_map)

        # 🔹 küçük iyileştirme
        df["Confidence"] = df["Confidence"].round(2)

        # 🔹 en yeni üstte
        df = df.sort_values(by="ID", ascending=False)

        st.dataframe(df)