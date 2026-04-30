import React from 'react';
import { Search, Star, BarChart2 } from 'lucide-react';
import ChartComponent from '../Chart';

const formatPrice = (val) => {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  return num < 1 ? num.toFixed(4) : num.toFixed(2);
};

function LiveAnalysisView({ 
  ticker, setTicker, handleAnalyze, loading, error, result, favorites, toggleFavorite 
}) {
  return (
    <>
      <div className="search-container">
        <div className="input-wrapper">
          <Search className="input-icon" size={20} />
          <input 
            type="text" 
            className="symbol-input" 
            placeholder="Sembol girin (Örn: BTCUSDT, AAPL)" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
        </div>
        <button 
          className="analyze-btn" 
          onClick={() => handleAnalyze()}
          disabled={loading || !ticker}
        >
          {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Yapay Zeka {ticker} verilerini analiz ediyor...</p>
        </div>
      )}

      {result && !loading && (
        <div className="dashboard-grid">
          <div className="glass-panel main-chart-area">
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{result.ticker} Matematiksel Tepe & Dip Analizi</h2>
              <button 
                className={`star-btn ${favorites.includes(result.ticker) ? 'active' : ''}`}
                onClick={() => toggleFavorite(result.ticker)}
                title={favorites.includes(result.ticker) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              >
                <Star size={24} fill={favorites.includes(result.ticker) ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="chart-container-inner">
              <ChartComponent 
                chartData={result.chart_data} 
                peaks={result.peaks} 
                troughs={result.troughs} 
                patternPoints={result.pattern_points} 
                patternName={result.pattern}
                entry={result.entry}
                target={result.target}
                stop={result.stop}
              />
            </div>
          </div>

          <div className="side-panel">
            <div className="glass-panel result-card">
              <div className="result-label">Tespit Edilen Formasyon</div>
              <div className="result-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <BarChart2 size={24} color="var(--accent-purple)" />
                {result.pattern === 'trend' ? 'TREND ANALİZİ' : result.pattern.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {result.pattern === 'double_top' && "Düşüş dönüş formasyonu. İki zirve sonrası geri çekilme beklenir."}
                {result.pattern === 'triangle' && "Fiyat sıkışması. Kırılım yönünde sert hareket gelebilir."}
                {result.pattern === 'trend' && "Belirgin formasyon yok. Genel trend verileri inceleniyor."}
                {result.pattern === 'none' && "Formasyon tespit edilemedi."}
              </div>
            </div>

            <div className="glass-panel result-card">
              <div className="result-label">Yapay Zeka Sinyali</div>
              <div className={`result-value signal-${result.signal}`} style={{ textShadow: '0 0 20px currentColor' }}>
                {result.signal}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {result.signal === 'BUY' && "Alım fırsatı değerlendirilebilir."}
                {result.signal === 'SELL' && "Satış veya kar alım bölgesi."}
                {result.signal === 'HOLD' && "Bekle ve gör politikası önerilir."}
              </div>
            </div>

            <div className="glass-panel result-card">
              <div className="result-label">Algoritma Güven Skoru</div>
              <div className="result-value" style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: '4px' }}>
                {result.confidence} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '6px' }}>/ 100</span>
              </div>
              <div className="confidence-bar-bg">
                <div 
                  className="confidence-bar-fill" 
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>

            {result.signal !== 'HOLD' && result.entry && (
              <div className="glass-panel result-card" style={{ marginTop: '24px', textAlign: 'left', padding: '24px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div className="result-label" style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>Yapay Zeka Fiyat Tahmini</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                   <span style={{color: 'var(--text-muted)'}}>Giriş (Tahmin):</span> 
                   <span style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>{formatPrice(result.entry)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                   <span style={{color: 'var(--text-muted)'}}>Hedef Fiyat:</span> 
                   <span style={{fontWeight: 'bold', color: 'var(--success)'}}>{formatPrice(result.target)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginBottom: '16px' }}>
                   <span style={{color: 'var(--text-muted)'}}>Zarar Kes:</span> 
                   <span style={{fontWeight: 'bold', color: 'var(--danger)'}}>{formatPrice(result.stop)}</span>
                </div>

                {/* Risk/Ödül Oranı */}
                {result.target && result.stop && (
                  <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                     <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Risk / Ödül Oranı:</span>
                     <span style={{ 
                       fontWeight: 'bold', 
                       color: (Math.abs(result.target - result.entry) / Math.abs(result.entry - result.stop)) >= 2 ? 'var(--success)' : 'var(--warning)'
                     }}>
                       1 : {(Math.abs(result.target - result.entry) / Math.abs(result.entry - result.stop)).toFixed(2)}
                     </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default LiveAnalysisView;
