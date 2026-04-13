# 📊 AI Trading Signal System

**AI Trading Signal System**, finansal piyasalardaki teknik analiz süreçlerini otomize eden, derin öğrenme ve geometrik algoritmalar kullanarak alım-satım sinyalleri üreten kapsamlı bir karar destek platformudur.

---

## ✨ Öne Çıkan Özellikler

- 📈 **Gelişmiş Formasyon Tespiti**
  - **Geometrik Analiz:** Üçgen, İkili Tepe, İkili Dip ve OBO gibi yapıları matematiksel algoritmalarla anlık tespit eder.
  - **YOLOv8 Entegrasyonu:** Grafik görselleri üzerinden derin öğrenme ile formasyon sınıflandırması yapar.

- 🤖 **Akıllı Sinyal Motoru**
  - Analiz sonuçlarına göre dinamik **BUY (AL)**, **SELL (SAT)** veya **HOLD (BEKLE)** sinyalleri üretir.
  - Her sinyal için sistem tarafından hesaplanan bir **Güven Skoru (Confidence)** sunar.
  - Giriş, Hedef ve Stop-Loss seviyelerini otomatik belirler.

- 👤 **Kişiselleştirilmiş Deneyim**
  - **JWT Güvenlik:** Güvenli kayıt ve giriş sistemi.
  - **Favori Takibi:** İlgilendiğiniz hisse veya kripto varlıkları favorilerinize ekleyip hızlıca takip edin.
  - **Analiz Geçmişi:** Geçmişte yaptığınız tüm analizleri bulut üzerinde saklar ve istediğiniz zaman erişim sunar.

- 🎨 **Modern ve Dinamik Arayüz**
  - React ve Vite ile güçlendirilmiş, düşük gecikmeli kullanıcı deneyimi.
  - **Framer Motion** ile akıcı geçişler ve **Recharts** ile interaktif grafikler.

---

## 🛠️ Teknoloji Yığını

### **Backend (Hizmet Katmanı)**
- **Framework:** FastAPI (Python 3.9+)
- **Analiz Paketleri:** Pandas, NumPy, SciPy, yfinance
- **Yapay Zeka:** PyTorch, Ultralytics (YOLOv8)
- **Veritabanı:** SQLite (Geliştirme aşamasında)
- **Güvenlik:** JWT, Bcrypt

### **Frontend (Sunum Katmanı)**
- **Framework:** React 19 (Vite)
- **Styling:** Vanilla CSS, Framer Motion
- **Grafikler:** Recharts
- **İkonlar:** Lucide React, React Icons
- **HTTP Client:** Axios

---

## 📦 Kurulum ve Çalıştırma

### **1. Backend Kurulumu**

```bash
# Backend dizinine gidin
cd backend

# Sanal ortam oluşturun ve aktif edin
python -m venv venv
# Windows için:
venv\Scripts\activate
# macOS/Linux için:
source venv/bin/activate

# Gerekli kütüphaneleri yükleyin
pip install -r requirements.txt

# .env.example dosyasını .env olarak kopyalayın ve düzenleyin
cp .env.example .env

# API'yi başlatın
python api.py
```
> API varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

### **2. Frontend Kurulumu**

```bash
# Frontend dizinine gidin
cd frontend

# Paketleri yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```
> Arayüz varsayılan olarak `http://localhost:5173` adresinde açılacaktır.

---

## 📂 Proje Yapısı

```text
ai-trading-signal-system/
├── backend/                # FastAPI Sunucusu
│   ├── src/                # Kaynak Kodlar
│   │   ├── auth/           # Yetkilendirme (JWT)
│   │   ├── detection/      # Formasyon Analiz Motorları
│   │   ├── signal/         # Sinyal Üretim Mantığı
│   │   └── database/       # DB Bağlantıları ve Modeller
│   ├── models/             # YOLOv8 Ağırlık Dosyaları (.pt)
│   └── api.py              # Uygulama Giriş Noktası
├── frontend/               # React Uygulaması
│   ├── src/
│   │   ├── components/     # UI Bileşenleri
│   │   ├── pages/          # Sayfa Görünümleri
│   │   └── services/       # API Servisleri (Axios)
│   └── public/             # Statik Varlıklar
└── docs/                   # Proje Dokümantasyonu
```

---

## ⚠️ Yasal Uyarı

**Önemli:** Bu yazılım bir karar destek aracıdır ve kesin yatırım tavsiyesi niteliği taşımaz. Finansal piyasalarda işlem yapmak yüksek risk içerir. Uygulamanın ürettiği sinyaller sonucunda oluşabilecek maddi kayıplardan kullanıcı sorumludur. Yatırım yapmadan önce kendi araştırmanızı yapmanız veya bir finansal danışmana başvurmanız önerilir.

---

## 🤝 Katkıda Bulunma

1. Bu projeyi fork'layın.
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniozellik`).
3. Değişikliklerinizi commit'leyin (`git commit -am 'Yeni özellik eklendi'`).
4. Branch'inizi push'layın (`git push origin feature/yeniozellik`).
5. Bir Pull Request oluşturun.

---

*Geliştiren: [yorukihsan1](https://github.com/yorukihsan1)*