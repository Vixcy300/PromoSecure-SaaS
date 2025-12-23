<div align="center">

# 🔒 PromoSecure

### Privacy-First Promotional Verification Platform

*AI-powered face blurring • Smart duplicate detection • Field marketing verification*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-0d9488?style=for-the-badge)](https://promosecure-saas.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br>

<img src="https://raw.githubusercontent.com/Vixcy300/PromoSecure-SaaS/main/docs/hero-mockup.png" alt="PromoSecure Dashboard" width="800">

</div>

---

## ✨ What is PromoSecure?

**PromoSecure** is a SaaS platform designed for **field marketing teams** to verify promotional activities while maintaining strict **privacy compliance**. 

Promoters capture photos of people they've engaged with, and the AI automatically:
- 🤖 **Blurs faces** in real-time (on-device, no cloud processing)
- ✅ **Detects duplicates** using perceptual hashing
- 📍 **Logs GPS locations** with timestamps

Managers can review verified photos without ever seeing the original faces.

---

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### 📸 On-Device AI Processing
- TensorFlow.js face detection
- 4-layer privacy blur
- No images sent to external servers

</td>
<td width="50%">

### 🔍 Smart Duplicate Detection
- Perceptual image hashing
- Face signature comparison
- 80%+ similarity flagging

</td>
</tr>
<tr>
<td width="50%">

### 👥 Multi-Role System
- **Admin**: Manage managers & analytics
- **Manager**: Review batches & promoters
- **Promoter**: Capture & submit photos

</td>
<td width="50%">

### 📊 Analytics Dashboard
- Photo verification stats
- Duplicate rate tracking
- Performance insights

</td>
</tr>
<tr>
<td width="50%">

### 🗺️ GPS Map View
- Photo location visualization
- OpenStreetMap integration
- Timestamp tracking

</td>
<td width="50%">

### 📄 PDF Reports
- Downloadable batch reports
- Email reports to clients
- Photo previews included

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Vixcy300/PromoSecure-SaaS.git
cd PromoSecure-SaaS

# Install server dependencies
cd server
npm install
cp .env.example .env  # Configure your environment

# Install client dependencies
cd ../client
npm install

# Run both (in separate terminals)
cd server && npm run dev
cd client && npm run dev
```

### Environment Variables

Create `.env` in the `server` directory:

```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Chart.js, React Router |
| **Backend** | Node.js, Express, JWT, Mongoose |
| **Database** | MongoDB Atlas |
| **AI/ML** | TensorFlow.js, MediaPipe Face Detection |
| **Deployment** | Vercel (Serverless) |

---

## 📁 Project Structure

```
PromoSecure-SaaS/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── ai/             # Face detection & blurring
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Route pages
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   └── promoter/
│   │   └── services/       # API client
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth & security
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # PDF generator
│   └── server.js
│
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| **On-Device Processing** | Face detection runs in browser, not on server |
| **JWT Authentication** | Secure token-based auth |
| **Password Hashing** | bcrypt with salt rounds |
| **Rate Limiting** | 100 req/15min, 30 uploads/hour |
| **Input Sanitization** | XSS & SQL injection protection |
| **Audit Logging** | All actions recorded |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vixcy300/PromoSecure-SaaS)

After deployment, set these environment variables in Vercel:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CLIENT_URL`

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/batches` | Create batch |
| GET | `/api/batches` | List batches |
| POST | `/api/photos` | Add photo |
| PUT | `/api/batches/:id/submit` | Submit for review |
| PUT | `/api/batches/:id/review` | Approve/reject |

---

## 👨‍💻 Author

<div align="center">

**Vignesh**

[![GitHub](https://img.shields.io/badge/GitHub-Vixcy300-181717?style=for-the-badge&logo=github)](https://github.com/Vixcy300)
[![Email](https://img.shields.io/badge/Email-vigneshigt%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:vigneshigt@gmail.com)

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for Privacy-First Field Marketing**

⭐ **Star this repo if you find it helpful!** ⭐

</div>
