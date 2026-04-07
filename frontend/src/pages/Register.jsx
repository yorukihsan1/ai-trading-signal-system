import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';
import '../index.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.success) {
        setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          <Activity size={32} color="var(--accent-blue)" />
          <h2 style={{ margin: 0 }}>Hemen Kayıt Ol</h2>
        </div>
        
        {error && <div className="error-message" style={{ width: '100%', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ width: '100%', marginBottom: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)' }}>{success}</div>}
        
        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>E-posta</label>
            <input 
              type="email" 
              className="symbol-input" 
              style={{ width: '100%', padding: '12px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Zaten hesabın var mı? <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
