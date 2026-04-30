import React, { useState, useEffect } from 'react';
import { Activity, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import LandingHero from '../components/dashboard/LandingHero';
import LiveAnalysisView from '../components/dashboard/LiveAnalysis';
import FavoritesView from '../components/dashboard/FavoritesView';
import HistoryTable from '../components/dashboard/HistoryTable';
import ProfileView from '../components/dashboard/ProfileView';
import PatternAnalysisView from '../components/PatternAnalysisView';

import { useDashboardData } from '../hooks/useDashboardData';
import '../index.css';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const [showLanding, setShowLanding] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const {
    ticker, setTicker,
    loading, error, result, handleAnalyze,
    history, historyLoading, fetchHistory,
    favorites, fetchFavorites, toggleFavorite,
    userData, fetchUserProfile,
    getAuthHeader
  } = useDashboardData(showNotification);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand" onClick={() => setShowLanding(true)} style={{ cursor: 'pointer' }}>
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
          onClick={() => { setShowLanding(false); setActiveTab('live'); }}
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
        <LandingHero setShowLanding={setShowLanding} />
      ) : (
        <>
          {activeTab === 'live' && (
            <LiveAnalysisView 
              ticker={ticker}
              setTicker={setTicker}
              handleAnalyze={handleAnalyze}
              loading={loading}
              error={error}
              result={result}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView 
              favorites={favorites} 
              setActiveTab={setActiveTab} 
              handleAnalyze={handleAnalyze} 
            />
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
            <PatternAnalysisView 
              getAuthHeader={getAuthHeader} 
              showNotification={showNotification} 
            />
          )}

          {activeTab === 'history' && (
            <HistoryTable history={history} historyLoading={historyLoading} />
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

export default Dashboard;
