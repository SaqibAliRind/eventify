# 🌟 Eventify - Luxury Event Management & Bespoke Consultation Platform

Eventify is a full-stack MERN application crafted for luxury event showcases, bespoke consultations, real-time concierge chat, and full-spectrum administrative management.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 (Vite)
  - Redux Toolkit (State Management)
  - React Helmet Async (Dynamic SEO & OpenGraph tags)
  - Framer Motion & Lucide Icons
  - Recharts (Interactive Analytics)
  - Socket.io Client (Real-time Concierge Chat)
  - Custom Vanilla CSS Design System with mobile responsive drawers

- **Backend**:
  - Node.js & Express 5 (ES Modules)
  - MongoDB & Mongoose 9 (Schema validation, indexing, aggregations)
  - Socket.io Server (Authenticated rooms, role enforcement, offline alerts)
  - JWT Authentication (Bcrypt 12 rounds, lockout security, no fallback defaults)
  - Security suite: Helmet, CORS, express-mongo-sanitize, XSS sanitation, Express Rate Limiting
  - Logging & Performance: Pino structured logging, Morgan HTTP logging, Compression, Trust Proxy

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x (Node 20+ or 24 recommended)
- MongoDB Atlas cluster or local MongoDB instance

### 2. Environment Setup

#### Backend (`.env` in repository root):
```env
PORT=9000
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/EventManagementSystem?retryWrites=true&w=majority
JWT_SECRET=your_high_entropy_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Optional: Nodemailer for transactional emails
Gmailuser=your_email@gmail.com
Gmailpassword=your_app_password

# Optional: Cloudinary for image hosting
Cloudinaryname=your_cloudinary_name
Cloudinarykey=your_cloudinary_key
Cloudinarysecret=your_cloudinary_secret
```

#### Frontend (`dfrontend/.env`):
```env
VITE_API_URL=http://localhost:9000
VITE_SOCKET_URL=http://localhost:9000
```

---

## 📦 Installation & Seeding

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd dfrontend
npm install
cd ..
```

### 3. Provision Production Admin (Single Admin, No Demo Users)
```bash
node seed_production_admin.js
```
*Creates or verifies a single production administrator from environment variables without inserting test or mock users.*

### 4. Optional: Seed Full Catalog (For local demo/testing)
```bash
node seed_e2e.js
```

---

## 🏃 Running the Application

### Start Backend Server:
```bash
node server.js
```
*Runs on `http://localhost:9000` (Socket.io listening on the same port).*

### Start Frontend Server:
```bash
cd dfrontend
npm run dev -- --port 5173
```
*Accessible at `http://localhost:5173`.*

---

## 🔒 Security & Hardening Highlights

1. **Strict Socket.io Access Control**: Registered users authenticate via JWT; guests receive server-generated ephemeral guest sessions. Only authenticated administrators may join the `admins` broadcast channel.
2. **Brute Force Protection**: Temporary account lockout triggered after repeated failed login attempts.
3. **NoSQL & XSS Sanitization**: Incoming request payloads, search filters, and chat messages undergo automated sanitization against injection vectors.
4. **Offline Concierge Alerting**: When a user or guest reaches out via live support and no administrator is online, the message is stored in MongoDB and an email alert is automatically dispatched to the admin.
5. **Auditing**: Administrative CRUD, status updates, and moderation actions are logged with timestamp and administrator identity in the tamper-resistant Audit Log.
6. **SEO & Dynamic Sitemaps**: Dynamic XML sitemap served at `/sitemap.xml`, robots policy at `/robots.txt`, and per-page meta tags with `react-helmet-async`.

---

## 🚢 Production Deployment Steps

1. Set `NODE_ENV=production` in the production environment.
2. Ensure `JWT_SECRET` is set with a minimum 32-character high-entropy secret.
3. Build the frontend production bundle:
   ```bash
   cd dfrontend
   npm run build
   ```
4. Serve the static `dist/` directory via Nginx, Vercel, or Express static serve.
5. Run the production seed script once on the deployment server:
   ```bash
   node seed_production_admin.js
   ```
6. Start the backend without `nodemon` (production uses `node` directly):
   ```bash
   npm run start:prod
   # Or with PM2: pm2 start server.js --name eventify
   ```
7. Verify health via `GET https://yourdomain.com/health`.

> **Note**: `nodemon` is a devDependency only. Run `npm install --omit=dev` in production environments to exclude it. The `start:prod` script uses `node server.js` directly.

---

## 📊 Performance Benchmarks (Lighthouse — dev-mode, mobile)

| Page | Performance | Accessibility | Best Practices | SEO |
|:-----|:-----------:|:-------------:|:--------------:|:---:|
| Home | 86 | 96 | 100 | 100 |
| Events | 88 | 96 | 100 | 100 |
| Event Details | 84 | 96 | 100 | 100 |
| Contact | 88 | 96 | 100 | 100 |

*Production bundle (`vite build`) completes in ~22s, generating ~880KB of gzipped assets across 33 code-split chunks.*

---

## 🛡️ Security Audit Summary

| Layer | Status |
|:------|:------:|
| Frontend `npm audit --omit=dev` | 0 vulnerabilities |
| Backend `npm audit --omit=dev` | 0 vulnerabilities |
| NoSQL injection (MongoDB operator injection) | Blocked |
| XSS (stored / reflected) | Sanitized via `xss` library |
| Write endpoints authorization | 18/18 PASS |
| READ endpoints authorization | 18/18 PASS |
| IDOR (consultations, chat) | 6/6 PASS |
| Rate limiting (login: 10/15min, consultation: 50/10min) | Active |
| Account lockout (email+IP keyed) | Active |
