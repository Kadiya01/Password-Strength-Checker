# Deployment Guide

## Prerequisites

- Docker and Docker Compose v2+
- OR: Node.js 18+, MySQL 8.0+, Nginx (for manual deployment)

## Option 1: Docker Deployment (Recommended)

### 1. Clone and Configure

```bash
git clone https://github.com/Kadiya01/Password-Strength-Checker.git
cd Password-Strength-Checker
cp .env.example .env
```

### 2. Set Environment Variables

Edit `.env` and set strong, unique values:

```bash
JWT_SECRET=<random-32-char-string>
JWT_REFRESH_SECRET=<different-random-32-char-string>
```

Generate secure values:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start Services

```bash
docker compose up -d
```

This starts:
- **MySQL** on port 3306
- **Backend API** on port 3000
- **Frontend (Nginx)** on port 80

### 4. Initialize Database

```bash
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

### 5. Verify

```bash
curl http://localhost/api/health
# {"status":"ok","timestamp":"...","uptime":...,"environment":"production"}
```

## Option 2: Manual Deployment

### Backend

```bash
cd server
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build
NODE_ENV=production node dist/index.js
```

### Frontend

```bash
cd client
npm ci
npm run build
# Serve dist/ with Nginx or any static file server
```

### Reverse Proxy (Nginx)

Point your Nginx config to:
- `/` → `client/dist/` (static files)
- `/api/` → `http://localhost:3000` (backend)

## Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ chars, different values)
- [ ] HTTPS enabled (Let's Encrypt or similar)
- [ ] Database migrations applied (`prisma migrate deploy`)
- [ ] Swagger docs disabled or protected
- [ ] CORS `CLIENT_URL` set to production domain
- [ ] Rate limiting configured for production traffic
- [ ] MySQL root password changed from default
- [ ] Server not exposing debug information
