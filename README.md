# 📊 AI Trading Signal System

**AI Trading Signal System**, finansal piyasalardaki teknik analiz süreçlerini otomize eden, derin öğrenme (YOLOv8) ve geometrik algoritmalar kullanarak profesyonel alım-satım sinyalleri üreten kapsamlı bir karar destek platformudur.

---

## 🔗 Hızlı Linkler
- [🚀 Canlı Demo (BETA)](https://ai-trading-signal-system.vercel.app/)
- [📖 Kullanım Kılavuzu](#-kullanım-kılavuzu)
- [🛠️ Kurulum Rehberi](#️-kurulum-ve-çalıştırma)

---

## ✨ Öne Çıkan Özellikler

- 📈 **Gelişmiş Formasyon Tespiti**
  - **Geometrik Analiz:** Üçgen (Triangle), İkili Tepe (Double Top), İkili Dip (Double Bottom) gibi yapıları matematiksel algoritmalarla anlık tespit eder.
  - **YOLOv8 Entegrasyonu:** Grafik görselleri üzerinden derin öğrenme ile formasyon sınıflandırması yapar (H&S, Double Top/Bottom vb.).

- 🤖 **Akıllı Sinyal Motoru**
  - Analiz sonuçlarına göre dinamik **BUY (AL)**, **SELL (SAT)** veya **HOLD (BEKLE)** sinyalleri üretir.
  - Her sinyal için sistem tarafından hesaplanan bir **Güven Skoru (Confidence)** sunar.
  - Giriş, Hedef ve Stop-Loss seviyelerini otomatik belirler.

- 👤 **Kullanıcı Odaklı Deneyim**
  - **JWT Güvenlik:** Güvenli kayıt ve giriş sistemi.
  - **Favori Takibi:** İlgilendiğiniz hisse veya kripto varlıkları favorilerinize ekleyin.
  - **Analiz Geçmişi:** Geçmişte yaptığınız tüm analizleri bulut üzerinde saklayın.

- 🎨 **Premium Arayüz**
  - React 19 ve Vite ile güçlendirilmiş, düşük gecikmeli kullanıcı deneyimi.
  - **Framer Motion** ile akıcı geçişler ve **Recharts** ile interaktif canlı grafikler.

---

## 🛠️ Teknoloji Yığını

### **Backend (Hizmet Katmanı)**
- **Framework:** FastAPI (Python 3.9+)
- **Analiz Paketleri:** Pandas, NumPy, SciPy, yfinance
- **Yapay Zeka:** PyTorch, Ultralytics (YOLOv8), OpenCV
- **Veritabanı:** SQLite (Geliştirme aşamasında)
- **Güvenlik:** JWT (JSON Web Token), Bcrypt

### **Frontend (Sunum Katmanı)**
- **Framework:** React 19 (Vite)
- **Styling:** Modern Vanilla CSS (Glassmorphism), Framer Motion
- **Grafikler:** Recharts (Interaktif Mum Grafikleri & Analizler)

---

## 📖 Kullanım Kılavuzu

### 1. Analiz Başlatma
Dashboard üzerindeki arama çubuğuna analiz etmek istediğiniz **Ticker** kodunu yazın (Örn: `BTC-USD`, `TSLA`, `ETH-USDT`). Sistem, Yahoo Finance üzerinden canlı verileri çekerek anında hem matematiksel hem de görsel analiz yapacaktır.

### 2. Formasyon Analizi (Görsel Yükleme)
"Formasyon Analizi" sekmesine giderek bir grafik görseli yükleyin. Eğitilmiş **YOLOv8** modelimiz, görseldeki fiyat hareketini tarayarak olası formasyonları (İkili Tepe, Üçgen vb.) ve doğruluk oranını size bildirecektir.

### 3. Sinyal Yorumlama
- **AL (BUY):** Formasyon yukarı yönlü kırılım sinyali veriyor.
- **SAT (SELL):** Formasyon aşağı yönlü kırılım veya direnç sinyali veriyor.
- **BEKLE (HOLD):** Net bir formasyon oluşumu yok veya güven skoru düşük.

---

## 📦 Kurulum ve Çalıştırma

### **1. Backend Kurulumu**
```bash
cd backend
python -m venv venv
# Aktif et (Windows): venv\Scripts\activate
pip install -r requirements.txt
python api.py
```

### **2. Frontend Kurulumu**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Proje Yapısı
```text
ai-trading-signal-system/
├── backend/                # FastAPI Sunucusu
│   ├── src/                # İş Mantığı (Logic)
│   ├── models/             # ML Model Ağırlıkları (.pt)
│   └── api.py              # Uygulama Giriş Noktası
├── frontend/               # React (Vite) Uygulaması
└── docs/                   # Dokümantasyon ve Araçlar
```

---

## ⚠️ Yasal Uyarı
**Önemli:** Bu yazılım bir karar destek aracıdır ve kesin yatırım tavsiyesi niteliği taşımaz. Finansal piyasalarda işlem yapmak yüksek risk içerir. Yatırım yapmadan önce kendi araştırmanızı yapmanız önerilir.

---
*Geliştiren: [yorukihsan1](https://github.com/yorukihsan1)*