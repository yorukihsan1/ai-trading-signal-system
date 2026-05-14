import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, TrendingUp, ThumbsUp, ThumbsDown, Award, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../api/config';

const LeaderboardView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      if (response.data.success) {
        setData(response.data.leaderboard || []);
      }
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy color="#fbbf24" size={28} />; // Gold
    if (index === 1) return <Medal color="#94a3b8" size={28} />; // Silver
    if (index === 2) return <Medal color="#b45309" size={28} />; // Bronze
    return <Award color="var(--text-muted)" size={24} />;
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <Trophy size={32} color="var(--accent-blue)" />
        <h2 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '0.5px' }}>Top Sinyaller Liderlik Tablosu</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
        Kullanıcıların analiz sonuçlarına verdiği "Evet/Hayır" oylarıyla belirlenen, yapay zekanın en yüksek doğruluk oranına sahip olduğu kripto paralar.
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="spin" size={40} color="var(--accent-blue)" />
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <TrendingUp size={56} opacity={0.3} style={{ marginBottom: '20px' }} />
          <p style={{ fontSize: '1.1rem' }}>Henüz yeterli değerlendirme verisi bulunmuyor.<br/>Analizlere geri bildirim verdikçe bu tablo şekillenecektir.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.map((item, index) => (
            <div 
              key={item.symbol}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: index === 0 ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                padding: '20px 24px',
                borderRadius: '16px',
                gap: '24px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* İlk sıradaki için ufak bir arka plan ışıması */}
              {index === 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#fbbf24', boxShadow: '0 0 10px #fbbf24' }}></div>
              )}
              
              <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                {getRankIcon(index)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '1px', color: index === 0 ? '#fbbf24' : 'white' }}>
                  {item.symbol}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Toplam {item.total_signals} değerlendirme
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--success)', fontSize: '1rem', fontWeight: 600 }}>
                    <ThumbsUp size={16} /> {item.upvotes}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--danger)', fontSize: '1rem', fontWeight: 600 }}>
                    <ThumbsDown size={16} /> {item.downvotes}
                  </div>
                </div>

                <div style={{ width: '130px', textAlign: 'right', paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: '900', 
                    color: item.win_rate >= 70 ? 'var(--success)' : item.win_rate >= 50 ? 'var(--warning)' : 'var(--danger)',
                    textShadow: item.win_rate >= 70 ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none'
                  }}>
                    %{item.win_rate}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}>BAŞARI ORANI</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
