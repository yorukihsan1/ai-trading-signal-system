import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Activity, History, TrendingUp, BarChart2, User, LogOut, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ChartComponent from '../components/Chart';
import PatternAnalysisView from '../components/PatternAnalysisView';
import '../index.css';

// Dashboard
const formatPrice = (val) => {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  return num < 1 ? num.toFixed(4) : num.toFixed(2);
};

function Dashboard() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('BTCUSDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [activeTab, setActiveTab] = useState('live');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [showLanding, setShowLanding] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFavorites = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get('http://localhost:8000/api/favorites/ticker', {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (err) {
      console.error("Favoriler çekilemedi:", err);
    }
  };

  const toggleFavorite = async (symbol) => {
    if (!localStorage.getItem('token')) {
      showNotification("Favorilere eklemek için giriş yapmalısınız.", "error");
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/api/favorites/ticker/toggle', 
        { ticker: symbol },
        { headers: getAuthHeader() }
      );
      
      if (response.data.success) {
        fetchFavorites();
        showNotification(
          response.data.status === 'added' 
            ? `${symbol} favorilere eklendi.` 
            : `${symbol} favorilerden çıkarıldı.`,
          'success'
        );
      }
    } catch (err) {
      showNotification("Favori işlemi sırasında hata oluştu.", "error");
    }
  };

  const handleAnalyze = async (forcedTicker = null) => {
    const targetTicker = forcedTicker || ticker;
    if (!targetTicker) return;
    
    if (forcedTicker) setTicker(forcedTicker);
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/analyze', 
        { ticker: targetTicker },
        { headers: getAuthHeader() }
      );
      
      if (response.data.success) {
        setResult(response.data);
        if (response.data.signal && response.data.signal !== 'HOLD' && response.data.pattern !== 'none') {
          showNotification(`DİKKAT! ${response.data.ticker} için ${response.data.pattern.toUpperCase()} formasyonu ile ${response.data.signal} fırsatı tespit edildi!`, 'success');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Veri analiz edilirken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/history', {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error("Geçmiş çekilemedi:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get('http://localhost:8000/api/auth/me', {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (err) {
      console.error("Profil çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand" onClick={() => { setShowLanding(true); setSelectedFeature(null); }} style={{ cursor: 'pointer' }}>
          <Activity size={32} className="brand-icon" />
          <h1>AI Trading Signal <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>Minds</span></h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {localStorage.getItem('token') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                className="user-badge"
                onClick={() => setShowLanding(false) || setActiveTab('profile')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div className={`avatar-circle small avatar-${userData?.avatar || 'user'}`}>
                  {userData?.avatar === 'user' ? <User size={16} /> : null}
                </div>
                <span>Hoşgeldin, <b>{localStorage.getItem('username')}</b></span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('username');
                  window.location.reload();
                }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={16} /> Çıkış
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="analyze-btn"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              Giriş Yap / Kayıt Ol
            </button>
          )}
        </div>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${showLanding ? 'active' : ''}`}
          onClick={() => setShowLanding(true)}
        >
          Anasayfa
        </button>
        <button 
          className={`tab-btn ${!showLanding && activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setShowLanding(false) || setActiveTab('live')}
        >
          Canlı Analiz
        </button>
        <button 
          className={`tab-btn ${!showLanding && activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => {
            if (!localStorage.getItem('token')) {
              showNotification("Favorilerinizi görmek için giriş yapmalısınız.", "error");
              return;
            }
            setShowLanding(false);
            setActiveTab('favorites');
          }}
        >
          Favorilerim
        </button>
        <button 
          className={`tab-btn ${!showLanding && activeTab === 'ml_analysis' ? 'active' : ''}`}
          onClick={() => {
            if (!localStorage.getItem('token')) {
              showNotification("Formasyon analizi yapmak için giriş yapmalısınız.", "error");
              return;
            }
            setShowLanding(false);
            setActiveTab('ml_analysis');
          }}
        >
          Formasyon Analizi
        </button>
        <button 
          className={`tab-btn ${!showLanding && activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            if (!localStorage.getItem('token')) {
              showNotification("Geçmiş logları görmek için giriş yapmalısınız.", "error");
              return;
            }
            setShowLanding(false);
            setActiveTab('history');
          }}
        >
          Geçmiş Sinyaller
        </button>
        {localStorage.getItem('token') && (
          <button 
            className={`tab-btn ${!showLanding && activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setShowLanding(false);
              setActiveTab('profile');
            }}
          >
            Profil
          </button>
        )}
      </div>

      {showLanding ? (
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
      ) : (
        <>
          {activeTab === 'live' && (
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
          )}

          {activeTab === 'favorites' && (
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                 <Star size={24} color="#fbbf24" fill="#fbbf24" />
                 <h2 style={{ fontSize: '1.5rem' }}>Favori Kripto Paralarım</h2>
              </div>
              
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                   Favori listeniz henüz boş. Bir analiz yapıp yıldız ikonuna tıklayarak ekleyebilirsiniz.
                </div>
              ) : (
                <div className="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                   {favorites.map(fav => (
                     <div 
                       key={fav} 
                       className="favorite-card-large" 
                       onClick={() => {
                         setActiveTab('live');
                         handleAnalyze(fav);
                       }}
                     >
                       <TrendingUp size={32} color="var(--accent-blue)" />
                       <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{fav}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analiz Etmek İçin Tıkla</div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              userData={userData} 
              onUpdate={fetchUserProfile} 
              getAuthHeader={getAuthHeader}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'ml_analysis' && (
            <PatternAnalysisView getAuthHeader={getAuthHeader} showNotification={showNotification} />
          )}

          {activeTab === 'history' && (
            <div className="glass-panel history-table-container">
              {historyLoading ? (
                 <div className="loader-container" style={{ padding: '24px 0' }}>
                   <div className="spinner"></div>
                   <p>Kayıtlar Yükleniyor...</p>
                 </div>
              ) : history.length === 0 ? (
                 <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                   Geçmiş kayıt bulunamadı.
                 </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tarih</th>
                      <th>Formasyon</th>
                      <th>Sinyal</th>
                      <th>Güven Skoru</th>
                      <th>Giriş / Hedef / Stop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => (
                      <tr key={row.id}>
                        <td>#{row.id}</td>
                        <td>{row.date ? new Date(row.date + 'Z').toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.pattern}</span></td>
                        <td>
                          <span className={`badge badge-${row.signal}`}>{row.signal}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{row.confidence}</span>
                            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                               <div style={{ height: '100%', width: `${row.confidence}%`, background: 'var(--accent-gradient)', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {row.entry ? (
                            <>
                              <div style={{ color: 'white' }}>G: {formatPrice(row.entry)}</div>
                              <div style={{ color: 'var(--success)' }}>H: {formatPrice(row.target)}</div>
                              <div style={{ color: 'var(--danger)' }}>S: {formatPrice(row.stop_loss)}</div>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          padding: '16px 24px', 
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.95)', 
          border: '1px solid var(--accent-blue)',
          color: 'white', 
          zIndex: 9999, 
          boxShadow: '0 8px 32px rgba(56, 189, 248, 0.2)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <Activity size={24} color="var(--accent-blue)" />
          <div style={{fontWeight: 600}}>{notification.message}</div>
        </div>
      )}
    </div>
  );
}

function ProfileView({ userData, onUpdate, getAuthHeader, showNotification }) {
  const [email, setEmail] = useState(userData?.email || '');
  const [avatar, setAvatar] = useState(userData?.avatar || 'user');
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const avatars = ['user', 'rocket', 'diamond', 'pulse', 'shield', 'target'];

  useEffect(() => {
    if (userData) {
      setEmail(userData.email);
      setAvatar(userData.avatar);
    }
  }, [userData]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/update-profile', 
        { email, avatar },
        { headers: getAuthHeader() }
      );
      if (response.data.success) {
        showNotification("Profil başarıyla güncellendi.", "success");
        onUpdate();
      }
    } catch (err) {
      showNotification(err.response?.data?.detail || "Güncelleme başarısız.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      showNotification("Yeni şifreler eşleşmiyor.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/change-password', 
        { current_password: passForm.current, new_password: passForm.new },
        { headers: getAuthHeader() }
      );
      if (response.data.success) {
        showNotification("Şifre başarıyla değiştirildi.", "success");
        setPassForm({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      showNotification(err.response?.data?.detail || "İşlem başarısız.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dashboard-grid">
      <div className="glass-panel profile-settings">
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <User size={24} color="var(--accent-blue)" /> Kişisel Bilgiler
        </h2>
        <form onSubmit={handleUpdateInfo}>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input type="text" value={userData?.username || ''} disabled className="symbol-input" style={{opacity: 0.6, cursor: 'not-allowed'}} />
          </div>
          <div className="form-group" style={{marginTop: '20px'}}>
            <label>E-posta Adresi</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="symbol-input" />
          </div>
          
          <div className="form-group" style={{marginTop: '24px'}}>
            <label style={{marginBottom: '12px', display: 'block'}}>Profil İkonu</label>
            <div className="avatar-picker-grid">
              {avatars.map(a => (
                <div 
                  key={a} 
                  className={`avatar-circle selection ${avatar === a ? 'active' : ''} avatar-${a}`}
                  onClick={() => setAvatar(a)}
                >
                  {a === 'user' && <User size={20} />}
                  {a === 'rocket' && <Activity size={20} />}
                  {a === 'diamond' && <Star size={20} />}
                  {a === 'pulse' && <TrendingUp size={20} />}
                  {a === 'shield' && <History size={20} />}
                  {a === 'target' && <Search size={20} />}
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="analyze-btn" style={{marginTop: '32px', width: '100%'}}>
            {loading ? 'Güncelleniyor...' : 'Bilgileri Kaydet'}
          </button>
        </form>
      </div>

      <div className="glass-panel profile-security">
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <Activity size={24} color="var(--danger)" /> Güvenlik
        </h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Mevcut Şifre</label>
            <input 
              type="password" 
              value={passForm.current} 
              onChange={(e) => setPassForm({...passForm, current: e.target.value})} 
              required 
              className="symbol-input" 
            />
          </div>
          <div className="form-group" style={{marginTop: '20px'}}>
            <label>Yeni Şifre</label>
            <input 
              type="password" 
              value={passForm.new} 
              onChange={(e) => setPassForm({...passForm, new: e.target.value})} 
              required 
              className="symbol-input" 
            />
          </div>
          <div className="form-group" style={{marginTop: '20px'}}>
            <label>Yeni Şifre (Tekrar)</label>
            <input 
              type="password" 
              value={passForm.confirm} 
              onChange={(e) => setPassForm({...passForm, confirm: e.target.value})} 
              required 
              className="symbol-input" 
            />
          </div>
          
          <button type="submit" disabled={loading} className="analyze-btn" style={{marginTop: '32px', width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)'}}>
            {loading ? 'Değiştiriliyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
