import requests
import pandas as pd
import numpy as np
import logging
from scipy.signal import find_peaks

logger = logging.getLogger(__name__)

def fetch_and_analyze_data(ticker_symbol, limit=120):
    """Binance üzerinden veri çekip tepe/dip analizi yapar."""
    try:
        symbol = ticker_symbol.replace("-", "").replace("/", "").upper()
        if not symbol.endswith("USDT"):
            symbol = symbol + "USDT"

        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval=1d&limit={limit}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            raise ValueError(f"{ticker_symbol} verisi çekilemedi.")
            
        data = response.json()
        dates = pd.to_datetime([k[0] for k in data], unit='ms').strftime('%Y-%m-%d')
        prices = [float(k[4]) for k in data]
        
        df = pd.DataFrame({'Close': prices}, index=dates)
        if len(df) < 10:
            raise ValueError("Yetersiz veri.")
            
        prices_arr = df['Close'].values
        
        # Dinamik Hassasiyet (Adaptive Prominence)
        # Fiyat aralığının %10'u kadar bir değişim "önemli" kabul edilir
        price_range = np.max(prices_arr) - np.min(prices_arr)
        # Minimum %2'lik bir eşik koyalım ki çok yatay piyasada her kıpırtıyı peak saymasın
        prominence_val = max(price_range * 0.10, np.mean(prices_arr) * 0.02)
        
        peaks, _ = find_peaks(prices_arr, prominence=prominence_val, distance=3)
        troughs, _ = find_peaks(-prices_arr, prominence=prominence_val, distance=3)
        
        pattern = "trend" 
        pattern_points = []
        conf = 0.50
        
        # 1. İkili Tepe Kontrolü (Double Top)
        if len(peaks) >= 2:
            last_p, prev_p = peaks[-1], peaks[-2]
            p_diff = abs(prices_arr[last_p] - prices_arr[prev_p]) / prices_arr[prev_p]
            
            if p_diff < 0.05: # %5 tolerans
                # Arada dip var mı? (Neckline tespiti)
                inter_troughs = [t for t in troughs if prev_p < t < last_p]
                if inter_troughs:
                    pattern = "double_top"
                    # En derin dip noktasını boyun çizgisi alalım
                    neck_idx = inter_troughs[np.argmin(prices_arr[inter_troughs])]
                    pattern_points = [prev_p, neck_idx, last_p]
                    conf = round(0.98 - (p_diff * 4), 2)
        
        # 2. İkili Dip Kontrolü (Double Bottom) - YENİ
        if pattern == "trend" and len(troughs) >= 2:
            last_t, prev_t = troughs[-1], troughs[-2]
            t_diff = abs(prices_arr[last_t] - prices_arr[prev_t]) / prices_arr[prev_t]
            
            if t_diff < 0.05:
                # Arada tepe var mı? (Neckline tespiti)
                inter_peaks = [p for p in peaks if prev_t < p < last_t]
                if inter_peaks:
                    pattern = "double_bottom"
                    # En yüksek tepeyi boyun çizgisi alalım
                    neck_idx = inter_peaks[np.argmax(prices_arr[inter_peaks])]
                    pattern_points = [prev_t, neck_idx, last_t]
                    conf = round(0.98 - (t_diff * 4), 2)

        # 3. Üçgen Kontrolü (Triangle/Rising Triangle)
        if pattern == "trend" and len(troughs) >= 2 and len(peaks) >= 1:
            # Yükselen dipler (Rising Lows)
            if prices_arr[troughs[-1]] > prices_arr[troughs[-2]]:
                # Eğer son tepe diplerin arasındaysa veya yakınındaysa
                pattern = "triangle"
                pattern_points = [troughs[-2], peaks[-1], troughs[-1]]
                egim = (prices_arr[troughs[-1]] - prices_arr[troughs[-2]]) / prices_arr[troughs[-2]]
                conf = round(min(0.95, 0.65 + (egim * 3)), 2)
                   
        return pattern, df, peaks, troughs, pattern_points, conf
        
    except Exception as e:
        logger.error(f"Error fetching data for {ticker_symbol}: {e}", exc_info=True)
        return "error", None, [], [], [], 0.0

