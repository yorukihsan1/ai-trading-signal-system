import requests
import pandas as pd
import numpy as np
from scipy.signal import find_peaks

def fetch_and_analyze_data(ticker_symbol, limit=90):
    """
    Fetches live market data using Binance API and applies
    Geometric Peak/Trough finding to detect patterns with scipy.
    """
    try:
        symbol = ticker_symbol.replace("-", "").replace("/", "").upper()
        if not symbol.endswith("USDT"):
            symbol = symbol + "USDT"

        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval=1d&limit={limit}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            raise ValueError(f"{ticker_symbol} sembolüne ait veri Binance'den çekilemedi. (Örn: BTCUSDT deneyin)")
            
        data = response.json()
        
        dates = pd.to_datetime([kline[0] for kline in data], unit='ms').strftime('%Y-%m-%d')
        close_prices = [float(kline[4]) for kline in data]
        
        df = pd.DataFrame({'Close': close_prices}, index=dates)
        
        if df.empty or len(df) < 10:
            raise ValueError(f"{ticker_symbol} için yeterli veri bulunamadı.")
            
        prices = df['Close'].values
        
        # Matematiksel Tepe (Peak) ve Dipleri bulalım
        # Çok küçük dalgalanmaları almamak için prominence (belirginlik) ayarı eklendi.
        prominence_val = np.max(prices) * 0.03 # Fiyatın %3'ü kadar belirgin olan dalgalandırmalar tepe sayılır
        peaks, _ = find_peaks(prices, prominence=prominence_val, distance=5)
        
        troughs, _ = find_peaks(-prices, prominence=prominence_val, distance=5)
        
        pattern = "trend" 
        pattern_points = [] # Formasyonu oluşturan noktaların (indexlerin) listesi
        dynamic_conf = 0.50 # Standart
        
        # --- DOUBLE TOP TESPİTİ ---
        # Eğer en az iki büyük tepe varsa
        if len(peaks) >= 2:
            # En son iki tepeye bakıyoruz
            last_peak = peaks[-1]
            prev_peak = peaks[-2]
            
            val_last = prices[last_peak]
            val_prev = prices[prev_peak]
            
            # Bu iki tepenin fiyatı birbirinin %5'i kadar yakınsa
            diff_ratio = abs(val_last - val_prev) / val_prev
            if diff_ratio < 0.05:
                # İkisi arasında kayda değer bir dip var mı? (Troughs kontrolü)
                dipler = [t for t in troughs if prev_peak < t < last_peak]
                if len(dipler) > 0:
                    pattern = "double_top"
                    pattern_points = [prev_peak, dipler[0], last_peak]
                    # Geometrik Kusursuzluk Hesabı:
                    # Tepeler birbirine eşitse fark %0, güven %99 olsun. 
                    # Fark %5 ise güven %70'e düşsün.
                    dynamic_conf = round(0.99 - (diff_ratio * 5), 2)
        
        # --- TREND (ÜÇGEN) ---
        # Sadece sallamamak için; belirgin bir pattern bulunamadıysa dipler yükseliyorsa triangle
        if pattern == "trend":
            if len(troughs) >= 2 and len(peaks) >= 1:
               if prices[troughs[-1]] > prices[troughs[-2]]:
                   pattern = "triangle"
                   pattern_points = [troughs[-2], peaks[-1], troughs[-1]]
                   # İki dip arasındaki yükseliş eğimi yüksekse daha çok güven
                   eğim = (prices[troughs[-1]] - prices[troughs[-2]]) / prices[troughs[-2]]
                   dynamic_conf = round(min(0.95, 0.60 + (eğim * 5)), 2)
                   
        return pattern, df, peaks, troughs, pattern_points, dynamic_conf
        
    except Exception as e:
        print(f"Veri çekme veya analiz hatası: {e}")
        return "error", None, [], [], [], 0.0
