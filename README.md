# ☕ Caffiend Admin

<div align="center">

![Caffiend Admin](https://img.shields.io/badge/Caffiend-Admin%20Panel-6B3F2A?style=for-the-badge&logo=coffeescript&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-AWS%20RDS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Kahve abonelik markası için geliştirilmiş modern yönetim paneli.**  
Abonelik yönetimi, ürün stoku, JWT kimlik doğrulama ve Gemini AI destekli akıllı hata takipçisi.

</div>

---

## 📸 Ekran Görüntüleri

| Giriş Ekranı | Abonelik Yönetimi |
|---|---|
| ![Login](https://via.placeholder.com/400x250/FAF9F6/6B3F2A?text=Login+Screen) | ![Subscriptions](https://via.placeholder.com/400x250/FAF9F6/6B3F2A?text=Subscription+Management) |

| Ürün Stoku | Akıllı Hata Takipçisi |
|---|---|
| ![Products](https://via.placeholder.com/400x250/FAF9F6/6B3F2A?text=Product+Stock) | ![Error Tracker](https://via.placeholder.com/400x250/FAF9F6/6B3F2A?text=AI+Error+Tracker) |

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- JWT tabanlı güvenli giriş sistemi
- PBKDF2 ile şifrelenmiş şifre saklama
- Token yönetimi ve otomatik oturum kapatma

### 📦 Abonelik Yönetimi
- Tüm abonelikleri listele ve yönet
- Aboneliği **duraklat** veya **aktif et**
- Teslimat tarihini **1 hafta ertele**
- Her abonenin sepetini görüntüle

### 🌿 Ürün Stoku
- Yeni kahve ürünü ekle (ad, kategori, fiyat, stok)
- Mevcut stoku tablo halinde görüntüle
- Düşük stok uyarısı (10 adedinin altında)
- Ürün silme

### 🔍 Akıllı Hata Takipçisi
- Frontend ve Backend hatalarını kaydet
- **Gemini AI** ile otomatik Türkçe hata analizi
- Stack trace görüntüleme
- Yapay hata simülasyonu ile test

---

## 🏗️ Teknoloji Stack

### Backend
| Teknoloji | Versiyon | Kullanım |
|---|---|---|
| .NET | 8.0 | Web API |
| Entity Framework Core | 8.0 | ORM |
| PostgreSQL (AWS RDS) | 16 | Veritabanı |
| JWT Bearer | 8.0 | Authentication |
| Gemini API | 1.5 Flash | AI Analizi |

### Frontend
| Teknoloji | Versiyon | Kullanım |
|---|---|---|
| React | 18 | UI Framework |
| TypeScript | 5.0 | Tip Güvenliği |
| Vite | 5.0 | Build Tool |
| Tailwind CSS | 4.0 | Styling |
| Axios | 1.x | HTTP Client |

---

## 🚀 Kurulum

### Gereksinimler
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) veya AWS RDS

### 1. Repoyu Klonla

```bash
git clone https://github.com/AsiyeNR/caffiend-admin.git
cd caffiend-admin
```

### 2. Backend Kurulumu

```bash
cd backend/CaffiendAdmin
```

`appsettings.json` dosyasını düzenle:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=YOUR_RDS_ENDPOINT;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY"
  },
  "Jwt": {
    "Secret": "CaffiendSuperSecretKey2026!XYZ123ABC"
  }
}
```

Migration ve başlatma:

```bash
dotnet ef database update
dotnet run --urls http://localhost:5004
```

### 3. Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

### 4. Tarayıcıda Aç

```
http://localhost:5173
```

**Varsayılan giriş bilgileri:**
- Kullanıcı adı: `caffiend`
- Şifre: `Admin1234!`

---

## 📁 Proje Yapısı

```
caffiend-admin/
├── backend/
│   └── CaffiendAdmin/
│       ├── Controllers/        # API endpoint'leri
│       │   ├── AuthController.cs
│       │   ├── SubscriptionsController.cs
│       │   ├── ProductsController.cs
│       │   └── ErrorLogsController.cs
│       ├── Data/
│       │   └── AppDbContext.cs  # EF Core DbContext
│       ├── Models/             # Veritabanı modelleri
│       ├── Services/           # İş mantığı
│       │   ├── AuthService.cs  # JWT + şifreleme
│       │   └── AIService.cs    # Gemini AI entegrasyonu
│       └── Program.cs          # Uygulama konfigürasyonu
│
└── frontend/
    └── src/
        ├── api/
        │   └── api.ts          # Axios servisleri
        └── App.tsx             # Ana uygulama
```

---

## 🔌 API Endpoint'leri

### Auth
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/login` | Giriş yap, JWT token al |

### Subscriptions
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/subscriptions` | Tüm abonelikleri listele |
| POST | `/api/subscriptions/{id}/pause` | Aboneliği duraklat |
| POST | `/api/subscriptions/{id}/activate` | Aboneliği aktif et |
| POST | `/api/subscriptions/{id}/delay-one-week` | 1 hafta ertele |

### Products
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/products` | Tüm ürünleri listele |
| POST | `/api/products` | Yeni ürün ekle |
| DELETE | `/api/products/{id}` | Ürün sil |

### Error Logs
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/errorlogs` | Tüm hataları listele |
| POST | `/api/errorlogs` | Hata kaydet (AI analizi başlar) |
| DELETE | `/api/errorlogs/{id}` | Hata kaydını sil |

---

## 🤖 Gemini AI Entegrasyonu

Yeni bir hata kaydedildiğinde sistem otomatik olarak:

1. Hata mesajı ve stack trace'i Gemini 1.5 Flash'a gönderir
2. Türkçe senior mühendis diliyle analiz üretir
3. Analizi veritabanına kaydeder

**Analiz formatı:**
```
🔍 Hatanın Kökü
🛠️ Olası Sebepler  
✅ Çözüm Önerisi
⚠️ Önleyici Tedbir
```

Gemini API key almak için: [Google AI Studio](https://aistudio.google.com)

---

## 🔒 Güvenlik

- Şifreler PBKDF2 + SHA256 + random salt ile hashleniyor
- JWT token 8 saat geçerli
- CORS sadece `localhost:5173`'e açık
- `appsettings.json` `.gitignore`'da (şifreler GitHub'a gitmiyor)

---

## 📝 Lisans

MIT License — özgürce kullanabilirsin.

---

<div align="center">
  <p>☕ <strong>Caffiend Admin</strong> — Her yudumda kontrol sizde.</p>
  <p>Made with ❤️ and lots of coffee</p>
</div>
