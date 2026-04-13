import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiBarChart2, FiCheckCircle, FiX, FiInfo } from 'react-icons/fi';
import axios from 'axios';

/**
 * Formasyon Analizi (YOLOv8)
 */
const PatternAnalysisView = ({ getAuthHeader, showNotification }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const headers = getAuthHeader ? getAuthHeader() : {};
      const response = await axios.post('http://localhost:8000/api/detect-image', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        }
      });
      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analiz sırasında bir hata oluştu.';
      setError(msg);
      if (showNotification) showNotification(msg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPatternName = (tag) => {
    const names = {
      'double_top': 'İkili Tepe (Double Top)',
      'double_bottom': 'İkili Dip (Double Bottom)',
      'ascending_triangle': 'Yükselen Üçgen (Ascending Triangle)',
      'descending_triangle': 'Alçalan Üçgen (Descending Triangle)',
      'head_and_shoulders': 'Baş ve Omuzlar (Head & Shoulders)',
      'none': 'Formasyon Bulunamadı',
      'model_not_initialized': 'Model Yüklü Değil',
    };
    return names[tag] || tag;
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.75) return 'var(--success)';
    if (conf >= 0.5) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Başlık Kartı */}
      <div className="glass-panel" style={{ padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Üst gradient çizgi */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'var(--accent-gradient)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            padding: '16px',
            background: 'rgba(56, 189, 248, 0.1)',
            borderRadius: '50%',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            <FiBarChart2 style={{ fontSize: '2.5rem', color: 'var(--accent-blue)' }} />
          </div>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Formasyon Analizi
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Grafik görselinizi yükleyin; özel eğitilmiş YOLOv8 modelimiz saniyeler içinde formasyon teşhisi yapsın.
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '16px',
            padding: '48px 24px',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(56,189,248,0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          <input {...getInputProps()} />

          {!preview ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <FiUploadCloud style={{ fontSize: '3.5rem', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.05rem' }}>
                {isDragActive ? 'Görseli bırakın...' : 'Görseli buraya sürükleyin veya seçmek için tıklayın'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PNG, JPG veya JPEG (Maks. 10MB)</p>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxHeight: '320px', maxWidth: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setSelectedFile(null);
                  setResult(null);
                }}
                style={{
                  position: 'absolute', top: '-12px', right: '-12px',
                  background: 'var(--danger)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', boxShadow: '0 4px 12px rgba(244,63,94,0.4)'
                }}
              >
                <FiX />
              </button>
            </div>
          )}
        </div>

        {/* Aksiyon Butonları */}
        {preview && !result && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="analyze-btn"
              style={{
                padding: '14px 40px',
                fontSize: '1rem',
                opacity: analyzing ? 0.7 : 1,
                cursor: analyzing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              {analyzing ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', marginBottom: 0 }} />
                  Analiz Ediliyor...
                </>
              ) : (
                'Analiz Et'
              )}
            </button>
            <button
              onClick={() => { setPreview(null); setSelectedFile(null); setResult(null); }}
              style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Görseli Değiştir
            </button>
          </div>
        )}
      </div>

      {/* Analiz Sonucu */}
      {result && (
        <div className="glass-panel" style={{ padding: '28px 32px', borderLeft: '4px solid var(--accent-blue)', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiCheckCircle style={{ color: 'var(--success)', fontSize: '1.4rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Analiz Sonucu</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block' }}>Güven Oranı</span>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: getConfidenceColor(result.confidence) }}>
                %{Math.round(result.confidence * 100)}
              </span>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Tespit Edilen Formasyon
            </span>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {getPatternName(result.pattern)}
            </span>
          </div>

          {/* Güven Çubuğu */}
          <div className="confidence-bar-bg">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${Math.round(result.confidence * 100)}%`,
                background: `linear-gradient(90deg, ${getConfidenceColor(result.confidence)}, var(--accent-blue))`
              }}
            />
          </div>

          {result.pattern !== 'none' && result.pattern !== 'model_not_initialized' && (
            <button
              onClick={() => { setPreview(null); setSelectedFile(null); setResult(null); setError(null); }}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Yeni Analiz Yap
            </button>
          )}
        </div>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiX style={{ fontSize: '1.2rem', flexShrink: 0 }} />
          <p>{error}</p>
        </div>
      )}

      {/* İpucu Kutusu */}
      <div className="glass-panel" style={{ padding: '16px 20px', background: 'rgba(56,189,248,0.04)', borderLeft: '3px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <FiInfo style={{ color: 'var(--accent-blue)', marginTop: '3px', flexShrink: 0 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>İpucu:</strong> Daha doğru sonuç için grafik görselinin net olduğundan ve göstergelerin fiyat hareketini kapatmadığından emin olun.
          Model <strong>Double Top, Double Bottom, Ascending/Descending Triangle</strong> formasyonlarını tanıyabilir.
        </p>
      </div>
    </div>
  );
};

export default PatternAnalysisView;
