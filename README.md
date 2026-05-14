# 📊 AI Trading Signal System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Finansal piyasalardaki teknik analiz süreçlerini yapay zeka ile otomize eden, profesyonel alım-satım sinyalleri üreten kapsamlı bir karar destek platformu.**

[🚀 Canlı Demo](#) • [📖 Dokümantasyon](#-kullanım-kılavuzu) • [🛠️ Kurulum](#️-kurulum-ve-çalıştırma) • [🤝 Katkı](#-katkı-sağlama)

</div>

---

## 📌 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-öne-çıkan-özellikler)
- [Mimari](#-sistem-mimarisi)
- [Teknoloji Yığını](#️-teknoloji-yığını)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum ve Çalıştırma](#️-kurulum-ve-çalıştırma)
- [API Referansı](#-api-referansı)
- [Kullanım Kılavuzu](#-kullanım-kılavuzu)
- [Test](#-test)
- [Güvenlik](#-güvenlik)
- [Performans](#-performans)
- [Yasal Uyarı](#️-yasal-uyarı)

---

## 🎯 Proje Hakkında

**AI Trading Signal System**, bireysel yatırımcıların ve analistlerin finansal piyasalarda daha bilinçli kararlar alabilmesi için geliştirilmiş, yapay zeka destekli bir teknik analiz platformudur.

Sistem iki temel analiz motoru üzerine kuruludur:

1. **Geometrik / Matematiksel Motor:** Fiyat serisi üzerinde Pandas, NumPy ve SciPy kullanarak İkili Tepe, İkili Dip, Üçgen gibi formasyonları algoritmik olarak tespit eder.
2. **YOLOv8 Görüntü Sınıflandırma Motoru:** Kullanıcının yüklediği grafik görselini derin öğrenme modeliyle analiz ederek formasyon sınıflandırması yapar.

Her iki motordan elde edilen sonuçlar birleştirilerek dinamik **BUY / SELL / HOLD** sinyalleri ve bir **güven skoru** hesaplanır.

---

## ✨ Öne Çıkan Özellikler

### 📈 Gelişmiş Formasyon Tespiti
| Özellik | Açıklama |
|---|---|
| Geometrik Analiz | Üçgen, İkili Tepe/Dip formasyonlarını matematiksel algoritmalarla tespit eder |
| YOLOv8 Entegrasyonu | Grafik görselleri üzerinden derin öğrenme tabanlı formasyon sınıflandırması |
| Canlı Veri | Yahoo Finance (`yfinance`) üzerinden anlık OHLCV verisi çeker |
| Güven Skoru | Her sinyal için sistem tarafından hesaplanan güvenilirlik yüzdesi |

### 🤖 Akıllı Sinyal Motoru
- **BUY (AL):** Yukarı yönlü kırılım tespiti durumunda tetiklenir
- **SELL (SAT):** Direnç veya aşağı kırılım tespitinde tetiklenir
- **HOLD (BEKLE):** Belirsiz formasyon veya düşük güven skoru durumunda önerilir
- Otomatik **Giriş Noktası**, **Hedef Fiyat** ve **Stop-Loss** hesaplaması

### 💬 AI Chatbot Asistanı
- **Groq LLM** entegrasyonu ile finansal sorularınıza akıllı yanıtlar
- **Rütbe Bazlı Persona:** Kullanıcının sistemdeki rütbesine (Gözlemci, Acemi, Balina vb.) göre dinamik olarak değişen yanıt üslubu ve teknik derinlik
- **Hızlı Önerilen Sorular:** Etkileşimi başlatmak için her açılışta rastgele değişen finansal soru butonları
- Gerçek zamanlı sohbet arayüzü

### 👤 Kullanıcı Yönetimi & Geri Bildirim
- **JWT (JSON Web Token)** ile güvenli kimlik doğrulama
- Kayıt & Giriş sistemi (`bcrypt` parola hashleme)
- **Top Sinyaller (Liderlik Tablosu):** Analizlere verilen oylarla şekillenen ve en yüksek başarı oranına sahip varlıkların sergilendiği oyunlaştırma modülü
- **Geri Bildirim Sistemi:** Kullanıcıların analiz kalitesini değerlendirebilmesi için (Thumbs Up/Down) oylama mekanizması
- **Favori Takibi:** İlgilendiğiniz semboller favorilere eklenebilir
- **Analiz Geçmişi:** Tüm geçmiş analizler kullanıcı bazında saklanır

### 🎨 Premium Arayüz (UX/UI)
- **React 19** + **Vite 8** ile güçlendirilmiş düşük gecikmeli SPA
- **İskelet Yükleyiciler (Skeleton Loaders):** Bekleme sürelerinde CLS'i önleyen, içerik yüklenmeden önce gösterilen iskelet animasyonları
- **Empty State Tasarımları:** Favoriler ve Geçmiş gibi boş sayfalarda kullanıcıyı aksiyona yönlendiren modern arayüzler
- **Framer Motion** ile akıcı animasyonlar ve geçişler
- **Recharts** ile interaktif mum grafikleri
- Responsive yapı ve şık Toast (bildirim) bildirimleri

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React 19)               │
│  Login / Register → Dashboard → Chatbot Widget      │
│  LiveAnalysis | PatternAnalysis | History | Profile  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / REST (Axios)
                        │ Port: 5173 → 8000
┌───────────────────────▼─────────────────────────────┐
│                  BACKEND (FastAPI)                   │
│                                                      │
│  /api/auth      → JWT Auth Router                   │
│  /api/analyze   → Analysis Router                   │
│  /api/favorites → Favorites Router                  │
│  /api/history   → History Router                    │
│  /api/chat      → Chatbot Router (Groq LLM)         │
│  /api/leaderboard → Leaderboard Router              │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Geometric    │  │  YOLOv8 ML   │                 │
│  │ Analyzer     │  │  Classifier  │                 │
│  └──────────────┘  └──────────────┘                 │
│         └──────────┬──────────────┘                 │
│              ┌─────▼──────┐                         │
│              │ Signal     │                         │
│              │ Engine     │                         │
│              └─────┬──────┘                         │
│                    │                                 │
│  ┌─────────────────▼──────────────────────┐         │
│  │         SQLite Database                │         │
│  │  users | analysis_history | favorites  │         │
│  └────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Teknoloji Yığını

### Backend
| Katman | Teknoloji | Sürüm |
|---|---|---|
| Web Framework | FastAPI | ≥ 0.100 |
| ASGI Sunucu | Uvicorn / Gunicorn | — |
| Veri İşleme | Pandas, NumPy, SciPy | — |
| Finansal Veri | yfinance | — |
| Görüntü İşleme | OpenCV (`cv2`) | — |
| Derin Öğrenme | PyTorch + Ultralytics YOLOv8 | — |
| Kimlik Doğrulama | PyJWT + Passlib (bcrypt) | — |
| Veritabanı | SQLite | — |
| Rate Limiting | SlowAPI | — |
| Önbellekleme | Cachetools | — |
| AI Chatbot | Groq API | — |
| Test | Pytest | — |

### Frontend
| Katman | Teknoloji | Sürüm |
|---|---|---|
| UI Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Animasyon | Framer Motion | 12.x |
| Grafikler | Recharts | 3.x |
| HTTP İstemci | Axios | 1.x |
| Router | React Router DOM | 7.x |
| İkonlar | Lucide React + React Icons | — |
| Dosya Yükleme | React Dropzone | 15.x |

---

## 📂 Proje Yapısı

```
ai-trading-signal-system/
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── analysis.py      # Analiz & Geri Bildirim endpoint'leri
│   │   │       ├── chatbot.py       # Groq LLM chatbot endpoint'i
│   │   │       ├── favorites.py     # Favori yönetim endpoint'leri
│   │   │       └── history.py       # Analiz geçmişi & Liderlik tablosu
│   │   ├── auth/
│   │   │   ├── deps.py              # JWT bağımlılık enjeksiyonu
│   │   │   ├── router.py            # Kayıt / Giriş router'ı
│   │   │   └── security.py          # Şifre hashleme & token üretimi
│   │   ├── database/
│   │   │   └── db.py                # SQLite bağlantısı & tablo oluşturma
│   │   ├── detection/
│   │   │   ├── data_analyzer.py     # Geometrik formasyon algortimaları
│   │   │   └── ml_classifier.py     # YOLOv8 görsel sınıflandırıcı
│   │   ├── preprocessing/           # Veri ön işleme
│   │   ├── signal/
│   │   │   └── signal_engine.py     # BUY/SELL/HOLD sinyal üretici
│   │   └── utils/
│   │       └── limiter.py           # Rate limiter tanımı
│   ├── models/                      # YOLOv8 .pt model ağırlıkları
│   ├── tests/
│   │   ├── test_analysis.py
│   │   ├── test_auth.py
│   │   ├── test_db.py
│   │   ├── test_favorites.py
│   │   └── test_signal.py
│   ├── main.py                      # FastAPI uygulama giriş noktası
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API istemci katmanı
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   └── ChatbotWidget.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── FavoritesView.jsx
│   │   │   │   ├── HistoryTable.jsx
│   │   │   │   ├── LandingHero.jsx
│   │   │   │   ├── LiveAnalysis.jsx
│   │   │   │   ├── LeaderboardView.jsx
│   │   │   │   └── ProfileView.jsx
│   │   │   ├── Chart.jsx
│   │   │   └── PatternAnalysisView.jsx
│   │   ├── hooks/                   # Özel React hook'ları
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/                            # Ek dokümantasyon (Haftalık raporlar vb.)
├── trading.db                       # SQLite veritabanı
└── README.md
```

---

## ⚙️ Kurulum ve Çalıştırma

### Ön Gereksinimler

- **Python** 3.9 veya üzeri
- **Node.js** 18 veya üzeri & **npm**
- **Git**
- (Opsiyonel) CUDA destekli GPU (YOLOv8 hız avantajı için)

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/yorukihsan1/ai-trading-signal-system.git
cd ai-trading-signal-system
```

### 2. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluştur ve aktif et
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### 3. Ortam Değişkenlerini Yapılandırın

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Veritabanı ayarı
DB_NAME=trading.db

# Uygulama modu
DEBUG=True
ENVIRONMENT=development

# JWT gizli anahtarı (güçlü ve rastgele bir değer girin)
SECRET_KEY=your-super-secret-key-here

# Groq API anahtarı (AI Chatbot için)
# https://console.groq.com adresinden ücretsiz alabilirsiniz
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Backend'i Başlatın

```bash
# backend/ dizinindeyken
python main.py
```

Backend `http://localhost:8000` adresinde çalışmaya başlayacaktır.  
Swagger UI: `http://localhost:8000/docs`

### 5. Frontend Kurulumu ve Başlatma

```bash
# Proje kök dizininden
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde açılacaktır.

---

## 📡 API Referansı

### Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Giriş ve JWT token alma |

### Analiz & Geri Bildirim

| Method | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/analyze` | Ticker sembolü ile teknik analiz |
| `POST` | `/api/analyze/image` | Grafik görseli yükleme ve YOLOv8 analizi |
| `POST` | `/api/analyze/{id}/feedback`| Yapılan analize oy (thumbs up/down) verme |
| `GET`  | `/api/leaderboard` | Oylarla oluşan En Başarılı (Top Signals) tablosu |

### Favoriler

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/favorites` | Kullanıcının favorilerini listele |
| `POST` | `/api/favorites` | Favori ekle |
| `DELETE` | `/api/favorites/{id}` | Favori sil |

### Geçmiş

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/history` | Analiz geçmişini getir |

### Chatbot

| Method | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/chat` | Groq LLM'e rütbe bazlı persona ile mesaj gönder |

> 📎 Tüm korumalı endpoint'ler `Authorization: Bearer <token>` başlığı gerektirir.

---

## 📖 Kullanım Kılavuzu

### 1. Kayıt ve Giriş
`/register` sayfasına giderek hesap oluşturun, ardından `/login` ile sisteme giriş yapın. JWT token otomatik olarak depolanır.

### 2. Canlı Analiz
Dashboard üzerindeki arama çubuğuna bir **ticker sembolü** girin:
- **Hisse Senetleri:** `TSLA`, `AAPL`, `NVDA`
- **Kripto Paralar:** `BTC-USD`, `ETH-USD`
- **Endeksler:** `^GSPC` (S&P 500)

Sistem Yahoo Finance'tan anlık veri çekerek matematiksel formasyon analizi yapar.

### 3. Görsel Formasyon Analizi
"Formasyon Analizi" sekmesinden bir grafik görseli yükleyin (PNG/JPG). Eğitilmiş YOLOv8 modeli görseli tarayarak formasyonu ve güven oranını raporlar.

### 4. Sinyalleri Yorumlama & Oylama

| Sinyal | Renk | Anlam |
|---|---|---|
| **BUY** | 🟢 Yeşil | Yukarı yönlü kırılım beklentisi |
| **SELL** | 🔴 Kırmızı | Direnç veya aşağı yönlü kırılım beklentisi |
| **HOLD** | 🟡 Sarı | Belirsiz formasyon veya düşük güven |

Analiz sonuçlarını inceledikten sonra sağ üst köşedeki **👍 / 👎 butonları** ile geri bildirim verebilirsiniz.

### 5. AI Chatbot
Sağ alt köşedeki chatbot widget'ını açın. Finansal piyasalar, teknik analiz veya sistem hakkında sorularınızı sorabilirsiniz. **Rütbeniz (Örn: Gözlemci, Acemi, Balina) arttıkça**, Chatbot size daha gelişmiş ve teknik yanıtlar sunacaktır. Karar veremediğiniz durumlarda girişte beliren rastgele soru butonlarını kullanabilirsiniz.

### 6. Liderlik Tablosu (Top Signals)
"Top Sinyaller" sekmesine tıklayarak topluluk oyları ile şekillenen, en yüksek başarılı kripto/hisse varlıklarını görebilirsiniz.

---

## 🧪 Test

```bash
cd backend

# Sanal ortamı aktif et
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Tüm testleri çalıştır
pytest tests/ -v

# Belirli bir modülü test et
pytest tests/test_auth.py -v
pytest tests/test_analysis.py -v
pytest tests/test_signal.py -v
pytest tests/test_favorites.py -v
pytest tests/test_db.py -v
```

Test modülleri şunları kapsar: kimlik doğrulama, analiz endpoint'leri, sinyal motoru, favori yönetimi ve veritabanı işlemleri.

---

## 🔒 Güvenlik

- **JWT Kimlik Doğrulama:** Tüm korumalı endpoint'ler Bearer token doğrulaması gerektirir
- **Bcrypt Parola Hashleme:** Kullanıcı parolaları düz metin olarak saklanmaz
- **Rate Limiting (SlowAPI):** API kötüye kullanımına karşı istek sınırlama
- **CORS Politikası:** Yalnızca `localhost:5173` ve `127.0.0.1:5173` kökenlerine izin verilir
- **Input Validation:** Pydantic şemaları ile gelen veriler doğrulanır
- **Ortam Değişkenleri:** Gizli anahtarlar `.env` dosyasında tutulur, depoya eklenmez

---

## ⚡ Performans

- **Cachetools** ile tekrarlayan analizlerin sonuçları önbelleklenir
- **SQLite indeksleme** ile sorgu performansı optimize edilmiştir
- **Framer Motion** animasyonları yalnızca gerektiğinde tetiklenir (lazy rendering)
- **useDashboardData** custom hook ile gereksiz React re-render'lar önlenir
- **Skeleton Loaders:** Kullanıcı beklerken arayüzde meydana gelebilecek zıplamalar önlendi.

---

## ⚠️ Yasal Uyarı

> **Önemli:** Bu yazılım yalnızca bir **karar destek aracıdır**. Üretilen sinyaller yatırım tavsiyesi niteliği **taşımaz**. Finansal piyasalarda işlem yapmak yüksek risk içerir ve anaparanızın tamamını kaybedebilirsiniz. Yatırım kararlarınızı almadan önce lisanslı bir yatırım danışmanına başvurmanız önerilir.

---

## 🤝 Katkı Sağlama

1. Depoyu fork'layın
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişikliklerinizi commit edin: `git commit -m 'feat: yeni özellik eklendi'`
4. Branch'inizi push edin: `git push origin feature/yeni-ozellik`
5. Pull Request açın

---

<div align="center">

Geliştiren: **[yorukihsan1](https://github.com/yorukihsan1)**

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>