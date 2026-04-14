import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import API_BASE_URL from '../api/config';
import '../index.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: username,
        password: password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', response.data.username);
        // Doğrudan ana sayfaya yönlendir
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          <Activity size={32} color="var(--accent-blue)" />
          <h2 style={{ margin: 0 }}>Giriş Yap</h2>
        </div>
        
        {error && <div className="error-message" style={{ width: '100%', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="symbol-input" 
              style={{ width: '100%', padding: '12px' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Şifre</label>
            <input 
              type="password" 
              className="symbol-input" 
              style={{ width: '100%', padding: '12px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="analyze-btn" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Hesabın yok mu? <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Kayıt Ol</Link>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>&larr; Ana Ekran'a Dön (Misafir girişi)</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
