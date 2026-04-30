import React from 'react';
import { Star, TrendingUp } from 'lucide-react';

function FavoritesView({ favorites, setActiveTab, handleAnalyze }) {
  return (
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
  );
}

export default FavoritesView;
