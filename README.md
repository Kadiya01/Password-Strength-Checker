# SentinelPass - Password Strength Checker

A full-stack, enterprise-grade password strength evaluation and secure generation platform built with React, TypeScript, Node.js, Express, Prisma ORM, and MySQL. Modeled on NIST SP 800-63B standards and OWASP credential handling guidelines.

---

## Features

| Feature | Description |
|---|---|
| **Password Strength Checker** | Analyzes passwords with entropy calculation, character breakdowns, passphrase detection, and estimated brute-force crack times (Online, Offline GPU, Supercomputer) |
| **Secure Password Generator** | Customizable length (8-64), character exclusions, readable passphrase mode |
| **Interactive Security Dashboard** | Real-time gauge widgets, security status checks, login session audits, strength distribution charts |
| **Session Auditing** | Browser agents, IP addresses, login history with success/failure tracking |
| **Data Logs & Export** | Historical password check table with CSV export and text filtering |
| **User Authentication** | JWT access/refresh tokens, HTTP-only cookies, account lockout, bcrypt hashing |
| **Offline Fallback** | All services auto-fallback to client-side calculations when API is unreachable |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router DOM, TanStack Query, Zustand, React Hook Form, Zod, Framer Motion, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, MySQL 8.0, bcrypt, JWT (access + refresh), Helmet, CORS, compression |
| **Testing** | Jest (429 tests, 33 suites), Vitest (70 tests, 10 suites), k6 load testing (8 scripts), Supertest |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD, Nginx reverse proxy |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- MySQL 8.0+ (or use Docker Compose)

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/Kadiya01/Password-Strength-Checker.git
cd Password-Strength-Checker

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Set up environment
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Initialize database
cd server
npx prisma migrate dev --name init
npx prisma db seed

# Start development servers (runs both client and server)
cd ..
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

### Option 2: Docker Compose

```bash
# Set up environment
cp .env.example .env
# Edit .env — JWT_SECRET and JWT_REFRESH_SECRET are REQUIRED

# Start all services
docker compose up -d

# Run database migrations
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

---

## Testing

### Backend (Jest)

```bash
cd server
npm test                  # Run all 429 tests
npm run test:coverage     # Run with coverage report
```

### Frontend (Vitest)

```bash
cd client
npx vitest run            # Run all 70 tests
npx vitest run --coverage # Run with coverage
```

### Load Testing (k6)

```bash
# Install k6: https://k6.io/docs/get-started/installation/
cd k6-scripts

k6 run config.js              # Shared config
k6 run auth-load.js           # Auth endpoint load test
k6 run password-check.js      # Password checker load test
k6 run password-generate.js   # Password generator load test
k6 run dashboard-load.js      # Dashboard endpoint load test
k6 run stress-test.js         # Stress test (up to 2000 VUs)
k6 run spike-test.js          # Spike test
k6 run endurance-test.js      # Endurance test
```

---

## Project Structure

```
Password-Strength Checker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages (lazy-loaded)
│   │   ├── services/           # API service layer
│   │   ├── store/              # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── tests/              # Frontend test suite
│   │   └── router/             # React Router config with auth guards
│   ├── nginx.conf              # Production Nginx config
│   ├── vitest.config.ts        # Vitest configuration
│   └── Dockerfile              # Multi-stage Docker build
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # App, JWT, CORS, rate limit configs
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/          # Auth, error, rate limit middleware
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic (11 modular services)
│   │   ├── security/           # Account lockout, security events
│   │   ├── repositories/       # Database access layer
│   │   ├── validators/         # Request validation schemas
│   │   └── tests/              # Backend test suite (429 tests)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── Dockerfile              # Multi-stage Docker build
├── k6-scripts/                 # Load testing scripts
├── docs/                       # API collection, HTTP client files
├── .github/                    # CI/CD workflows, issue/PR templates
├── docker-compose.yml          # Full-stack Docker orchestration
└── package.json                # Root scripts (dev, build, test)
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| POST | `/api/password/check-strength` | Check password strength |
| POST | `/api/password/generate` | Generate secure password |
| POST | `/api/password/generate-passphrase` | Generate passphrase |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/recent-activity` | Recent activity |
| GET | `/api/dashboard/strength-distribution` | Strength distribution |
| GET | `/api/dashboard/security-status` | Security status |
| GET | `/api/dashboard/login-history` | Login history |
| GET | `/api/dashboard/sessions` | Active sessions |
| GET | `/api/history` | Password check history |
| GET | `/api/history/export` | Export history as CSV |
| GET | `/api/health` | Health check |

Full API documentation: http://localhost:3000/api/docs (Swagger UI)

---

## Security Features

- **JWT Authentication**: Separate access/refresh token secrets, HS256 algorithm validation, jti claims for rotation tracking
- **Account Lockout**: Configurable max attempts + lockout duration, atomic increment pattern
- **Rate Limiting**: Global + per-route rate limiters (auth, password check, password generate)
- **Input Validation**: Zod schemas (frontend) + express-validator (backend), 10KB request body limit
- **Security Headers**: Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Origin-restricted, credentials-enabled, Vary header for proper caching
- **Password Hashing**: bcrypt with configurable rounds (default 12)
- **CSV Injection Prevention**: Formula-trigger characters escaped in export
- **Security Event Logging**: Audit trail for auth events, never crashes request flow

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `DATABASE_URL` | — | MySQL connection string |
| `JWT_SECRET` | — | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | — | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `BCRYPT_ROUNDS` | `12` | bcrypt hash rounds |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `MAX_LOGIN_ATTEMPTS` | `5` | Max failed login attempts |
| `LOCKOUT_DURATION_MS` | `900000` | Account lockout duration (15 min) |

---

## License

This project is for academic and portfolio demonstration purposes.
