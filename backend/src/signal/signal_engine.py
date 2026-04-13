def generate_signal(pattern, dynamic_conf=0.50, current_price=None, prices=None, pattern_points=None):
    signal_type = "HOLD"
    conf = dynamic_conf if dynamic_conf else 0.50
    entry, target, stop = None, None, None
    risk = "Medium"

    if pattern == "double_top":
        signal_type = "SELL"
        conf = dynamic_conf if dynamic_conf else 0.85
        if current_price and prices is not None and pattern_points and len(pattern_points) >= 3:
            # pattern_points = [prev_peak, dipler[0], last_peak]
            peak1_idx, neck_idx, peak2_idx = pattern_points[:3]
            neck_price = prices[neck_idx]
            peak_price = prices[peak2_idx]
            
            # Formasyon boyu: Tepe ile boyun çizgisi farkı
            pattern_height = peak_price - neck_price
            
            entry = current_price
            # Gerçekçi Klasik Hedef: Boyun çizgisinden hedef boyu kadar aşağısı
            target = neck_price - pattern_height
            # Fiyatın çok absürt düşmesini engelleme (En fazla %50 düşsün)
            target = max(target, current_price * 0.5) 
            # Stop Loss: Tepe direncinin %1 üzeri
            stop = peak_price * 1.01 
            risk = "Low-Medium"
        elif current_price:
            entry = current_price
            target = current_price * 0.95
            stop = current_price * 1.02
            risk = "Low-Medium"
            
    elif pattern == "double_bottom":
        signal_type = "BUY"
        conf = dynamic_conf if dynamic_conf else 0.85
        if current_price and prices is not None and pattern_points and len(pattern_points) >= 3:
            # pattern_points = [prev_trough, neck_peak, last_trough]
            t1_idx, neck_idx, t2_idx = pattern_points[:3]
            neck_price = prices[neck_idx]
            bottom_price = prices[t2_idx]
            
            # Formasyon boyu
            pattern_height = neck_price - bottom_price
            
            entry = current_price
            # Hedef: Boyun çizgi kırılımı sonrası boy kadar yukarı
            target = neck_price + pattern_height
            # Stop Loss: Dip seviyesinin %1 altı
            stop = bottom_price * 0.99 
            risk = "Low-Medium"
        elif current_price:
            entry = current_price
            target = current_price * 1.05
            stop = current_price * 0.98
            risk = "Low-Medium"

    elif pattern == "triangle":
        # Yükselen üçgen kuralı
        signal_type = "BUY"
        conf = dynamic_conf if dynamic_conf else 0.75
        if current_price and prices is not None and pattern_points and len(pattern_points) >= 3:
            # pattern_points = [troughs[-2], peaks[-1], troughs[-1]]
            t1_idx, p1_idx, t2_idx = pattern_points[:3]
            triangle_height = prices[p1_idx] - prices[t1_idx]
            
            entry = current_price
            # Hedef: Kırılımın yukarı yönde formasyon boyu kadar olması
            target = current_price + triangle_height
            # Stop Loss: Bir önceki dibin %1 altı
            stop = prices[t2_idx] * 0.99
            risk = "Medium"
        elif current_price:
            entry = current_price
            target = current_price * 1.04
            stop = current_price * 0.98
            risk = "Medium"

    elif pattern == "head_shoulders":

        signal_type = "SELL"
        conf = dynamic_conf if dynamic_conf else 0.90
        if current_price:
            entry = current_price
            # Hedef: Genelde boyun çizgisi kırılımı sonrası baş boyu kadar aşağı (basitleştirilmiş)
            target = current_price * 0.90
            stop = current_price * 1.03
            risk = "Medium-High"

    elif pattern == "inverse_head_shoulders":
        signal_type = "BUY"
        conf = dynamic_conf if dynamic_conf else 0.90
        if current_price:
            entry = current_price
            target = current_price * 1.10
            stop = current_price * 0.97
            risk = "Medium-High"

    
    return {
        "signal": signal_type,
        "confidence": conf,
        "entry": entry,
        "target": target,
        "stop": stop,
        "risk": risk
    }