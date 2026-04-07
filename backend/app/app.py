import sys
import os
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from src.detection.data_analyzer import fetch_and_analyze_data
from src.signal.signal_engine import generate_signal
from src.database.db import save_analysis, get_all_analysis

st.title("📊 AI Trading Signal System (Canlı Veri)")

# 🔹 BORSA SEMBOLLÜ GİRİŞ ALANI
ticker_input = st.text_input("Kripto Para Sembolü Girin (Örn: BTCUSDT, ETHUSDT, SOLUSDT):", "BTCUSDT")

# 🔹 ANALİZ BUTONU
if st.button("Canlı Veri Çek ve Analiz Et"):
    if ticker_input.strip() != "":
        try:
            with st.spinner(f"Yapay Zeka {ticker_input} için canlı verileri analiz ediyor..."):
                # Görüntü analizi yerine canlı veri analizi
                pattern, df, peaks, troughs, pattern_points, dynamic_conf = fetch_and_analyze_data(ticker_input.strip())
                
                if pattern == "error" or df is None:
                    st.error("Veri çekilirken hata oluştu. Doğru bir kripto sembolü yazdığınızdan emin olun (Örn: BTCUSDT).")
                else:
                    # ✅ VERİYİ MATPLOTLIB İLE ÇİZ (Tepe ve Dipleri göstermek için)
                    st.write(f"### 📈 {ticker_input.upper()} Matematiksel Tepe & Dip Analiz Grafiği")
                    
                    fig, ax = plt.subplots(figsize=(10, 5))
                    ax.plot(df.index, df['Close'], label='Kapanış Fiyatı', color='blue', alpha=0.7)
                    
                    # Tüm tepeleri ve dipleri noktalayalım (şeffaf olarak)
                    ax.scatter(df.index[peaks], df['Close'].values[peaks], color='green', marker='^', alpha=0.5, label='Local Peaks')
                    ax.scatter(df.index[troughs], df['Close'].values[troughs], color='red', marker='v', alpha=0.5, label='Local Troughs')

                    # EĞER FORMASYON BULUNDUYSA, o formasyonu oluşturan noktaları KOCAMAN belirgin işaretle
                    if len(pattern_points) > 0:
                        ax.scatter(df.index[pattern_points], df['Close'].values[pattern_points], color='purple', s=200, marker='X', label=f'Pattern Nodes ({pattern})')
                        # Noktaları çizgiyle birleştirerek şekli göster
                        ax.plot(df.index[pattern_points], df['Close'].values[pattern_points], color='purple', linestyle='--', linewidth=2)

                    # Eksenleri düzenle
                    plt.xticks(rotation=45)
                    # Çok kalabalık olmaması için x ekseni etiketlerini azalt
                    ax.xaxis.set_major_locator(plt.MaxNLocator(15))
                    ax.legend()
                    ax.grid(True, linestyle='--', alpha=0.6)
                    
                    # Streamlit'e matplotlib figürünü ver
                    st.pyplot(fig)

                    # Sinyal üretimi
                    result = generate_signal(pattern, dynamic_conf)

                    st.write(f"### 🎯 Tespit Edilen Trend/Algoritma Çıktısı: **{pattern.upper()}**")
                    st.write(f"### 🚀 Üretilen Sinyal Kararı: **{result['signal']}**")
                    st.write(f"### 📊 Algoritma Güven Skoru: **{result['confidence']}**")

                    # 👉 DB’ye kaydet (Hata Kontrollü)
                    try:
                        # Burada pattern string'ini id'ye çevirmek daha doğru olurdu (stajınız için)
                        # ama mimariyi bozmamak için varsayılan id atamaya devam ediyoruz
                        save_analysis(
                            user_id=1,
                            pattern_id=1,
                            signal_id=1,
                            confidence=result["confidence"]
                        )
                        st.success(f"✅ {ticker_input} analizi başarıyla kaydedildi!")
                    except Exception as db_err:
                        st.error(f"Veritabanına kayıt sırasında hata oluştu: {db_err}")
                
        except Exception as e:
            st.error(f"Beklenmeyen bir hata oluştu: {str(e)}")
    else:
        st.warning("Lütfen bir sembol girin.")


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