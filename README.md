# Bookstore Golden State Demo

Bu proje, bir kitapçı yönetim sistemi örneğidir. Hem yönetici (admin) hem de müşteri (customer) panelleri içerir. Proje iki ana bölümden oluşur:

- **Backend**: Node.js (Express) ve PostgreSQL ile yazılmıştır.
- **Frontend**: React, Vite ve TailwindCSS ile geliştirilmiştir.

## Özellikler

- Kullanıcı girişi ve rol tabanlı yetkilendirme (JWT ile)
- Kitap ekleme, silme, güncelleme (admin)
- Kitap listeleme ve satın alma (müşteri)
- Satış ve stok takibi
- Modern ve responsive arayüz

## Kurulum

### Gereksinimler

- Node.js (18+ önerilir)
- PostgreSQL

### 1. Veritabanı Kurulumu

1. PostgreSQL sunucunuzu başlatın.
2. Gerekli veritabanı ve tabloları oluşturun.
3. `.env` dosyasını backend klasörüne ekleyin:

```env
DB_USER=postgres
DB_PASSWORD=parolanız
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
JWT_SECRET=guclu_bir_secret
NODE_ENV=development
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
npm start
```

Sunucu varsayılan olarak 3000 portunda çalışır.

### 3. Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak 5173 portunda çalışır.

## Kullanım

- Tarayıcınızda `http://localhost:5173` adresine gidin.
- Giriş yapıp rolünüze göre admin veya müşteri paneline yönlendirilirsiniz.

## Proje Yapısı

```
bookstore-golden-state-demo/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   ├── seed_golden.sql
│   │   └── seed_junk.sql
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── AdminPanel.jsx
│   │   ├── App.jsx
│   │   ├── CustomerPanel.jsx
│   │   ├── Login.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
└── README.md
```

## Önemli Paketler

### Backend

- **express**: Web framework
- **pg**: PostgreSQL driver
- **cors**: Cross-Origin Resource Sharing
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **dotenv**: Environment variables

### Frontend

- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **tailwindcss**: CSS framework
- **chart.js**: Charts ve grafikler
- **vite**: Build tool

## API Endpoints (Örnek)

- `POST /login` - Kullanıcı girişi
- `GET /books` - Tüm kitapları getir
- `POST /books` - Yeni kitap ekle (admin)
- `PUT /books/:id` - Kitabı güncelle (admin)
- `DELETE /books/:id` - Kitabı sil (admin)
- `POST /purchase` - Kitap satın al (müşteri)

## Kimlik Doğrulama

Proje JWT (JSON Web Tokens) kullanarak güvenli oturum yönetimi sağlar. Her istek için Authorization header'ında token gönderilmelidir.

```
Authorization: Bearer <token>
```

## Geliştirici

Ayşenur Pak
