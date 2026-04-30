import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api/config';

export function useDashboardData(showNotification) {
  const [ticker, setTicker] = useState('BTCUSDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [favorites, setFavorites] = useState([]);
  const [userData, setUserData] = useState(null);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/favorites/ticker`, {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (err) {
      console.error("Favoriler çekilemedi:", err);
    }
  }, [getAuthHeader]);

  const toggleFavorite = useCallback(async (symbol) => {
    if (!localStorage.getItem('token')) {
      showNotification("Favorilere eklemek için giriş yapmalısınız.", "error");
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/favorites/ticker/toggle`, 
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
  }, [fetchFavorites, getAuthHeader, showNotification]);

  const handleAnalyze = useCallback(async (forcedTicker = null) => {
    const targetTicker = forcedTicker || ticker;
    if (!targetTicker) return;
    
    if (forcedTicker) setTicker(forcedTicker);
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, 
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
  }, [ticker, getAuthHeader, showNotification]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history`, {
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
  }, [getAuthHeader]);

  const fetchUserProfile = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (err) {
      console.error("Profil çekilemedi:", err);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchFavorites();
    fetchUserProfile();
  }, [fetchFavorites, fetchUserProfile]);

  return {
    ticker, setTicker,
    loading, error, result, handleAnalyze,
    history, historyLoading, fetchHistory,
    favorites, fetchFavorites, toggleFavorite,
    userData, fetchUserProfile,
    getAuthHeader
  };
}
