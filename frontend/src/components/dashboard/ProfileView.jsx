import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, Star, TrendingUp, History, Search } from 'lucide-react';
import API_BASE_URL from '../../api/config';

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
      const response = await axios.post(`${API_BASE_URL}/api/auth/update-profile`, 
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
      const response = await axios.post(`${API_BASE_URL}/api/auth/change-password`, 
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
        
        {userData && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1))',
            border: '1px solid var(--accent-blue)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Mevcut Rütbeniz</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{userData.rank || 'Acemi'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Formasyon Analizi</div>
               <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{userData.pattern_analysis_count || 0}</div>
            </div>
          </div>
        )}

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

export default ProfileView;
