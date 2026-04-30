import React, { useState } from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

function LandingHero({ setShowLanding }) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="landing-hero">
      <h2 className="welcome-title">AI Trading Signal System</h2>
      <p className="welcome-subtitle">
        Kripto para piyasalarını yapay zeka ile 7/24 otonom olarak analiz edin. 
        Geometrik formasyonları yakalayın ve matematiksel tepe-dip verileriyle stratejinizi belirleyin.
      </p>
      
      {!selectedFeature ? (
        <>
          <div className="features-mini-grid">
            <div className="mini-feature clickable" onClick={() => setSelectedFeature('scipy')}>
              <BarChart2 size={24} color="var(--accent-blue)" style={{marginBottom: '10px'}} />
              <div><b>Scipy Analizi</b><br/>Otonom Tepe/Dip Tespiti</div>
            </div>
            <div className="mini-feature clickable" onClick={() => setSelectedFeature('confidence')}>
              <Activity size={24} color="var(--accent-purple)" style={{marginBottom: '10px'}} />
              <div><b>Güven Skoru</b><br/>Algoritmik Karar Verici</div>
            </div>
            <div className="mini-feature clickable" onClick={() => setSelectedFeature('signal')}>
              <TrendingUp size={24} color="var(--success)" style={{marginBottom: '10px'}} />
              <div><b>Anlık Sinyal</b><br/>Giriş & Hedef Tahmini</div>
            </div>
          </div>

          <button className="start-btn-large" onClick={() => setShowLanding(false)}>
            Sistemi Başlat
          </button>
        </>
      ) : (
        <div className="feature-detail-view premium-card">
          <div className="card-top-section">
            <div className="detail-icon-wrap large">
              {selectedFeature === 'scipy' && <BarChart2 size={40} color="var(--accent-blue)" />}
              {selectedFeature === 'confidence' && <Activity size={40} color="var(--accent-purple)" />}
              {selectedFeature === 'signal' && <TrendingUp size={40} color="var(--success)" />}
            </div>
            <div className="title-group">
              <span className="tech-badge">
                {selectedFeature === 'scipy' && "SciPy Core v1.12"}
                {selectedFeature === 'confidence' && "AI Probability Engine"}
                {selectedFeature === 'signal' && "Geometric Analysis"}
              </span>
              <h3 className="detail-title">
                {selectedFeature === 'scipy' && "SciPy ile Gelişmiş Analiz"}
                {selectedFeature === 'confidence' && "Yapay Zeka Karar Mekanizması"}
                {selectedFeature === 'signal' && "Otonom Sinyal Altyapısı"}
              </h3>
            </div>
          </div>

          <div className="card-body-section">
            <p className="detail-desc">
              {selectedFeature === 'scipy' && "Piyasa gürültüsünü filtrelemek için gelişmiş sinyal işleme algoritmaları kullanıyoruz."}
              {selectedFeature === 'confidence' && "Yapay zeka, her formasyonu binlerce veri noktasıyla karşılaştırarak bir olasılık skoru üretir."}
              {selectedFeature === 'signal' && "Hesaplamalarımız tamamen matematiksel formüllere ve piyasa hacmine dayanmaktadır."}
            </p>

            <div className="highlights-grid">
              {selectedFeature === 'scipy' && (
                <>
                  <div className="h-item"><div className="h-dot"></div> Gürültü Filtreleme</div>
                  <div className="h-item"><div className="h-dot"></div> Otonom Tepe/Dip Tespiti</div>
                  <div className="h-item"><div className="h-dot"></div> Trend Doğrulama</div>
                </>
              )}
              {selectedFeature === 'confidence' && (
                <>
                  <div className="h-item"><div className="h-dot"></div> Dinamik Risk Analizi</div>
                  <div className="h-item"><div className="h-dot"></div> Formasyon Uyumluluğu</div>
                  <div className="h-item"><div className="h-dot"></div> Karar Destek Sistemi</div>
                </>
              )}
              {selectedFeature === 'signal' && (
                <>
                  <div className="h-item"><div className="h-dot"></div> Milimetrik Giriş Seviyesi</div>
                  <div className="h-item"><div className="h-dot"></div> Dinamik Kar Hedefleri</div>
                  <div className="h-item"><div className="h-dot"></div> Stratejik Zarar Kes</div>
                </>
              )}
            </div>
          </div>

          <div className="card-footer-section">
            <button className="back-btn-premium" onClick={() => setSelectedFeature(null)}>
              Geri Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingHero;
