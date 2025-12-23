<div align="center">

<img src="https://img.icons8.com/fluency/96/privacy-policy.png" alt="PromoSecure Logo" width="80" height="80" />

# PromoSecure

### 🔒 Privacy-First Field Marketing Verification Platform

<br/>

[![Made with React](https://img.shields.io/badge/Made%20with-React%2018-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Powered by Node.js](https://img.shields.io/badge/Powered%20by-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![AI](https://img.shields.io/badge/AI-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)

<br/>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vixcy300/PromoSecure-SaaS)
[![GitHub Stars](https://img.shields.io/github/stars/Vixcy300/PromoSecure-SaaS?style=social)](https://github.com/Vixcy300/PromoSecure-SaaS)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br/>

**[🌐 Live Demo](https://promosecure.vercel.app)** · **[📖 Documentation](#-documentation)** · **[🐛 Report Bug](https://github.com/Vixcy300/PromoSecure-SaaS/issues)** · **[✨ Request Feature](https://github.com/Vixcy300/PromoSecure-SaaS/issues)**

<br/>

---

<br/>

</div>

## 🎯 The Problem We Solve

> **Field marketing teams struggle to verify promotional activities while protecting customer privacy.**

Traditional photo verification systems expose customer faces, creating GDPR/privacy compliance risks. PromoSecure is the **first platform** that:

- ✅ **Verifies** promotional interactions with real photos
- ✅ **Protects** customer identity through AI face blurring
- ✅ **Detects** fraudulent duplicate submissions automatically
- ✅ **Maps** all activities with GPS timestamps

<br/>

---

<br/>

## ⚡ Core Features

<div align="center">

|  | Feature | Description |
|:---:|:---|:---|
| 🤖 | **On-Device AI Processing** | TensorFlow.js face detection runs entirely in browser. No face data ever leaves the device. |
| 🔐 | **4-Layer Privacy Blur** | Pixelation → Gaussian blur → Noise injection → Secondary blur for unrecoverable anonymization. |
| 🔍 | **Smart Duplicate Detection** | Perceptual hashing + face signature comparison identifies 80%+ similar photos instantly. |
| 📍 | **GPS Geotagging** | Every photo automatically captures latitude, longitude, and timestamp for audit trails. |
| 👥 | **Multi-Role Hierarchy** | Admin → Manager → Promoter role-based access with granular permissions. |
| 📊 | **Analytics Dashboard** | Real-time verification rates, duplicate flags, and promoter performance metrics. |
| 📄 | **PDF Report Generation** | One-click batch reports with blurred photos ready to send to clients. |
| 🗺️ | **Interactive Map View** | Visualize all photo locations on OpenStreetMap with click-to-focus. |

</div>

<br/>

---

<br/>

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PROMOSECURE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │   PROMOTER  │    │   MANAGER   │    │    ADMIN    │                │
│   │   📱 PWA    │    │   💻 Web    │    │   🖥️ Web    │                │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                │
│          │                  │                  │                        │
│          ▼                  ▼                  ▼                        │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                    REACT 18 FRONTEND                     │          │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │          │
│   │  │ TensorFlow  │  │   Chart.js  │  │  React      │      │          │
│   │  │ Face Detect │  │  Analytics  │  │  Router 6   │      │          │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │          │
│   └─────────────────────────────────────────────────────────┘          │
│                              │                                          │
│                              ▼ HTTPS/REST                               │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                 EXPRESS.JS BACKEND                       │          │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │          │
│   │  │ JWT Auth    │  │ Rate Limit  │  │  PDFKit     │      │          │
│   │  │ bcrypt      │  │ Helmet      │  │  Nodemailer │      │          │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │          │
│   └─────────────────────────────────────────────────────────┘          │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                   MONGODB ATLAS                          │          │
│   │           Base64 Images • User Data • Batches            │          │
│   └─────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## 🔒 Privacy & Security

<div align="center">

| Layer | Protection | Description |
|:---:|:---|:---|
| 🧠 | **Client-Side AI** | Face detection happens in browser using TensorFlow.js. Raw faces never touch our servers. |
| 🔑 | **JWT + bcrypt** | Industry-standard authentication with 12-round salted password hashing. |
| 🛡️ | **Helmet.js** | 11 middleware protections including CSP, XSS, HSTS, and clickjacking prevention. |
| ⏱️ | **Rate Limiting** | 100 requests/15min general, 30 uploads/hour to prevent abuse. |
| 🚿 | **Input Sanitization** | XSS-clean + mongo-sanitize blocks injection attacks. |
| 📝 | **Audit Logging** | Every API call logged with timestamp, user, IP for compliance. |

</div>

<br/>

---

<br/>

## 🚀 Quick Start

### Prerequisites

```bash
node --version   # v18.0.0 or higher
npm --version    # v9.0.0 or higher
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Vixcy300/PromoSecure-SaaS.git
cd PromoSecure-SaaS

# Install backend dependencies
cd server
npm install
cp .env.example .env   # Edit with your MongoDB URI

# Install frontend dependencies
cd ../client
npm install
```

### Run Locally

```bash
# Terminal 1: Start backend
cd server
npm run dev   # Runs on http://localhost:5000

# Terminal 2: Start frontend
cd client
npm run dev   # Runs on http://localhost:5173
```

<br/>

---

<br/>

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|:---|:---|:---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/promosecure` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key-here` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SMTP_USER` | Gmail address for emails | `your@gmail.com` |
| `SMTP_PASS` | Gmail app password | `xxxx-xxxx-xxxx-xxxx` |

<br/>

---

<br/>

## 📁 Project Structure

```
PromoSecure-SaaS/
│
├── 📂 client/                    # React Frontend (Vite)
│   ├── 📂 src/
│   │   ├── 📂 ai/                # TensorFlow.js face detection
│   │   │   ├── FaceDetection.js  # Detection & blur engine
│   │   │   └── ImageProcessor.js # Hash generation
│   │   ├── 📂 components/        # Reusable UI components
│   │   ├── 📂 context/           # React Context (Auth)
│   │   ├── 📂 pages/
│   │   │   ├── 📂 admin/         # Admin dashboard pages
│   │   │   ├── 📂 manager/       # Manager dashboard pages
│   │   │   └── 📂 promoter/      # Promoter photo capture
│   │   └── 📂 services/          # API client (Axios)
│   └── 📄 package.json
│
├── 📂 server/                    # Express Backend
│   ├── 📂 config/                # Database configuration
│   ├── 📂 middleware/            # Auth, security, rate limiting
│   ├── 📂 models/                # Mongoose schemas
│   │   ├── User.js               # Admin/Manager/Promoter
│   │   ├── Batch.js              # Photo collections
│   │   ├── Photo.js              # Base64 images + metadata
│   │   └── Client.js             # Manager's clients
│   ├── 📂 routes/                # REST API endpoints
│   ├── 📂 utils/                 # PDF generator, email
│   ├── 📄 server.js              # Express app entry
│   └── 📄 vercel.json            # Serverless config
│
├── 📄 .gitignore
├── 📄 README.md
└── 📄 LICENSE
```

<br/>

---

<br/>

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|:---:|:---|:---|:---:|
| `POST` | `/api/auth/register` | Register first admin | ❌ |
| `POST` | `/api/auth/login` | Login any role | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### Users

| Method | Endpoint | Description | Auth |
|:---:|:---|:---|:---:|
| `POST` | `/api/users/manager` | Admin creates manager | Admin |
| `POST` | `/api/users/promoter` | Manager creates promoter | Manager |
| `GET` | `/api/users` | List users | ✅ |
| `PUT` | `/api/users/:id/toggle` | Enable/disable user | Admin |

### Batches

| Method | Endpoint | Description | Auth |
|:---:|:---|:---|:---:|
| `POST` | `/api/batches` | Create new batch | Promoter |
| `GET` | `/api/batches` | List batches | ✅ |
| `GET` | `/api/batches/:id` | Get batch + photos | ✅ |
| `PUT` | `/api/batches/:id/submit` | Submit for review | Promoter |
| `PUT` | `/api/batches/:id/review` | Approve/reject | Manager |

### Photos

| Method | Endpoint | Description | Auth |
|:---:|:---|:---|:---:|
| `POST` | `/api/photos` | Add blurred photo | Promoter |
| `GET` | `/api/photos/:batchId` | Get batch photos | ✅ |
| `DELETE` | `/api/photos/:id` | Delete photo | Promoter |

<br/>

---

<br/>

## ☁️ Deploy to Vercel

### Step 1: Deploy Backend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Vixcy300/PromoSecure-SaaS`
3. **Root Directory:** `server`
4. **Environment Variables:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
5. Deploy → Copy URL (e.g., `https://promosecure-api.vercel.app`)

### Step 2: Deploy Frontend

1. Create new Vercel project
2. Import same repository
3. **Root Directory:** `client`
4. **Environment Variables:**
   - `VITE_API_URL` = `https://promosecure-api.vercel.app/api`
5. Deploy

<br/>

---

<br/>

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | AI/ML | DevOps |
|:---:|:---:|:---:|:---:|:---:|
| React 18 | Node.js 18+ | MongoDB Atlas | TensorFlow.js | Vercel |
| Vite 5 | Express 4 | Mongoose 8 | MediaPipe | GitHub Actions |
| Chart.js | JWT | Base64 Storage | Face Detection | ESLint |
| React Router 6 | bcrypt | Indexing | Perceptual Hash | Prettier |
| Axios | Helmet | Aggregation | 4-Layer Blur | |

</div>

<br/>

---

<br/>

## 👨‍💻 Author

<div align="center">

<img src="https://github.com/Vixcy300.png" width="100" height="100" style="border-radius: 50%;" alt="Vignesh"/>

### **Vignesh**

Full-Stack Developer | AI Enthusiast | Privacy Advocate

[![GitHub](https://img.shields.io/badge/GitHub-Vixcy300-181717?style=for-the-badge&logo=github)](https://github.com/Vixcy300)
[![Email](https://img.shields.io/badge/Email-vigneshigt%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:vigneshigt@gmail.com)

</div>

<br/>

---

<br/>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

<br/>

**If this project helped you, please ⭐ star the repository!**

<br/>

Made with ❤️ for privacy-conscious field marketing

<br/>

</div>
