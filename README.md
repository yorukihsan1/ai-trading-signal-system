# 📊 AI Trading Signal System

Finansal piyasalarda teknik analiz süreçlerini kolaylaştırmak amacıyla geliştirilmiş bir karar destek sistemidir. Sistem, piyasa verilerini analiz ederek belirli formasyonları tespit eder ve buna göre alım-satım sinyalleri üretir.

---

## 🚀 Proje Hakkında

Bu proje, grafik üzerinde oluşan teknik formasyonları otomatik olarak tespit etmeyi ve bu formasyonlara dayalı olarak kullanıcıya anlamlı sinyaller sunmayı hedefler.

Klasik teknik analiz yöntemlerinin aksine, süreç veri odaklı ve otomatik şekilde ilerler. Böylece kullanıcıya daha hızlı ve standart bir analiz deneyimi sağlanır.

---

## ⚙️ Özellikler

- 📈 **Formasyon Tespiti**  
  Üçgen, İkili Tepe ve Omuz-Baş-Omuz gibi yapılar otomatik olarak belirlenir.

- 🤖 **Sinyal Üretimi**  
  Tespit edilen formasyona göre BUY / SELL / HOLD sinyalleri oluşturulur.

- 📊 **Güven Skoru**  
  Her analiz için belirli bir güven değeri hesaplanır.

- 👤 **Kullanıcı Sistemi**  
  Kayıt ve giriş işlemleri JWT tabanlı güvenli yapı ile sağlanır.

- ⭐ **Favori Takibi**  
  Kullanıcılar ilgilendikleri varlıkları kaydedebilir.

- 🧾 **Geçmiş Analizler**  
  Yapılan analizler kullanıcı bazlı olarak saklanır.

- 🎨 **Modern Arayüz**  
  React tabanlı, sade ve kullanıcı dostu bir tasarım sunulur.

---

## 🛠️ Kullanılan Teknolojiler

### Backend
- Python (FastAPI)
- SQLite
- Uvicorn

### Frontend
- React (Vite)
- Axios

### Veri ve Analiz
- Pandas
- NumPy
- SciPy
- YFinance

### Güvenlik
- JWT (JSON Web Token)
- Bcrypt

---

## 📦 Kurulum

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api.py