import React from 'react';
import { Clock } from 'lucide-react';

const formatPrice = (val) => {
  if (val === null || val === undefined) return '-';
  const num = Number(val);
  return num < 1 ? num.toFixed(4) : num.toFixed(2);
};

function HistoryTable({ history, historyLoading }) {
  return (
    <div className="glass-panel history-table-container">
      {historyLoading ? (
         <div className="loader-container" style={{ padding: '24px 0' }}>
           <div className="spinner"></div>
           <p>Kayıtlar Yükleniyor...</p>
         </div>
      ) : history.length === 0 ? (
         <div className="empty-state">
           <Clock size={48} className="empty-state-icon" />
           <h3>Geçmiş analiz bulunamadı</h3>
           <p>Yaptığınız analizler ve sinyal geçmişiniz burada listelenecektir.</p>
         </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sembol</th>
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
                <td><span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{row.symbol || '-'}</span></td>
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
  );
}

export default HistoryTable;
