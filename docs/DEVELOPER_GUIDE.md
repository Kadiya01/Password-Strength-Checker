# SentinelPass - Developer Guide

## Table of Contents

1. [Development Setup](#development-setup)
2. [Architecture Overview](#architecture-overview)
3. [Coding Standards](#coding-standards)
4. [API Conventions](#api-conventions)
5. [Database Design](#database-design)
6. [Authentication Design](#authentication-design)
7. [Password Intelligence Engine](#password-intelligence-engine)
8. [Testing](#testing)
9. [Code Quality](#code-quality)

---

## Development Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- PostgreSQL 16+ (or Docker Compose)
- npm

### Quick Start

```bash
git clone https://github.com/Kadiya01/Password-Strength-Checker.git
cd Password-Strength-Checker

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Configure environment
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Initialize database
cd server
npx prisma migrate dev --name init
npx prisma db seed

# Start development (both client and server)
cd ..
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |

### IDE Setup

**VS Code extensions (recommended)**:
- ESLint
- Prettier (if configured)
- Prisma (syntax highlighting)
- Tailwind CSS IntelliSense

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  React SPA ─── Axios ─── TanStack Query ─── Zustand  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/HTTPS
┌──────────────────────▼──────────────────────────────┐
│                 Express.js Backend                    │
│  Routes → Middleware → Controllers → Services → Repos │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma Client
┌──────────────────────▼──────────────────────────────┐
│                 PostgreSQL 16                         │
└─────────────────────────────────────────────────────┘
```

### Backend Layered Architecture

```
src/
├── routes/         # Route definitions (HTTP method + path)
├── middleware/      # Request processing (auth, validation, errors)
├── controllers/    # Request/response handling
├── services/       # Business logic (no HTTP concerns)
├── repositories/   # Database queries (no business logic)
├── validators/     # Input validation schemas
├── security/       # Account lockout, security events
├── config/         # Environment and app configuration
├── constants/      # Shared constants
├── interfaces/     # TypeScript interfaces
├── utils/          # Utility classes (ApiError, ApiResponse)
└── tests/          # Test suites
```

**Data flow**: `Request → Route → Middleware (validate/auth) → Controller → Service → Repository → Prisma → PostgreSQL`

Each feature module (auth, user, password, dashboard) follows the same pattern, enforcing the **Single Responsibility Principle**.

### Frontend Architecture

```
src/
├── components/     # Reusable UI components (Button, Input, etc.)
├── pages/          # Route-level components (lazy-loaded)
├── services/       # API client functions (Axios wrappers)
├── store/          # Zustand state stores (auth, UI state)
├── hooks/          # Custom React hooks
├── utils/          # Utility functions (offline fallback, validation)
├── types/          # TypeScript type definitions
├── router/         # React Router configuration with auth guards
└── tests/          # Test suites
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Layered backend | Separation of concerns; each layer testable independently |
| Repository pattern | Abstracts Prisma from business logic; easier to swap ORM |
| Zustand + TanStack Query | Zustand for simple client state (auth); TanStack Query for server state (caching, refetching) |
| Zod + express-validator | Zod on frontend (shared schemas), express-validator on backend (middleware integration) |
| Separate JWT secrets | Compromising one token type doesn't compromise the other |
| PostgreSQL over MySQL | Better JSON support, row-level locking, ACID compliance |

---

## Coding Standards

### TypeScript

- **Strict mode** enabled in both client and server.
- No `any` types (ESLint error).
- Explicit return types on exported functions (ESLint warning).
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `as const` for readonly configurations.

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `Button.tsx`, `PasswordChecker.tsx` |
| Files (utilities) | camelCase | `formatDate.ts`, `api.ts` |
| Files (routes/controllers/services) | kebab-case | `auth.routes.ts`, `hash.service.ts` |
| React components | PascalCase | `PasswordStrengthGauge` |
| Functions | camelCase | `calculateEntropy`, `checkStrength` |
| Classes | PascalCase | `ApiError`, `ApiResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_PASSWORD_LENGTH` |
| CSS classes | Tailwind utilities | `bg-blue-500`, `text-white` |

### File Naming Convention (Backend)

Each backend file follows the pattern: `<name>.<layer>.ts`

- `auth.routes.ts` — Route definitions
- `auth.controller.ts` — Request handlers
- `auth.service.ts` — Business logic
- `auth.repository.ts` — Database queries
- `auth.validator.ts` — Input validation schemas

### Error Handling

```typescript
// Backend: Throw ApiError instances
throw new ApiError(401, "Invalid credentials");
throw new ApiError(400, "Validation failed", errors);

// Frontend: Catch and display via TanStack Query error boundaries
const { error } = useMutation({ mutationFn: authAPI.login });
```

### Comments

- Do NOT add comments unless explicitly requested by the user.
- Self-documenting code through clear naming and small functions.

---

## API Conventions

### Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### HTTP Methods

| Method | Purpose | Idempotent |
|---|---|---|
| `GET` | Read resource | Yes |
| `POST` | Create resource / Execute action | No |
| `PUT` | Update entire resource | Yes |
| `PATCH` | Partial update | No |
| `DELETE` | Remove resource | Yes |

### Authentication

- **Access token**: `Authorization: Bearer <token>` header.
- **Refresh token**: HTTP-only cookie (sent automatically).
- **Unauthenticated**: Omit the Authorization header.

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh-token` | Cookie | Refresh access token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/users/profile` | Yes | Get profile |
| PUT | `/api/users/profile` | Yes | Update profile |
| POST | `/api/password/check-strength` | Yes | Check password strength |
| POST | `/api/password/generate` | Yes | Generate password |
| POST | `/api/password/generate-passphrase` | Yes | Generate passphrase |
| GET | `/api/password/history` | Yes | Get check history |
| GET | `/api/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/api/dashboard/recent-activity` | Yes | Recent activity |
| GET | `/api/dashboard/strength-distribution` | Yes | Strength distribution |
| GET | `/api/dashboard/security-status` | Yes | Security status |
| GET | `/api/dashboard/login-history` | Yes | Login history |
| GET | `/api/dashboard/sessions` | Yes | Active sessions |

---

## Database Design

### Entity Relationship Diagram

```
┌──────────┐    ┌──────────────────┐    ┌─────────────────┐
│  roles   │───<│      users       │───<│  password_logs   │
│          │    │                  │    │                  │
│ id (PK)  │    │ id (PK)          │    │ id (PK)          │
│ name     │    │ email            │    │ userId (FK)      │
│ desc     │    │ username         │    │ strengthScore    │
└──────────┘    │ passwordHash     │    │ strengthLabel    │
                │ roleId (FK)      │    │ entropy          │
                │ isActive         │    │ hasUppercase     │
                │ isLocked         │    │ hasLowercase     │
                │ failedAttempts   │    │ hasNumbers       │
                │ lockUntil        │    │ hasSymbols       │
                │ refreshToken     │    │ createdAt        │
                └────────┬─────────┘    └─────────────────┘
                         │
              ┌──────────┼──────────┬───────────────────┐
              │          │          │                    │
    ┌─────────▼───┐ ┌───▼────────┐ ┌───────────▼──────┐
    │   login_    │ │ password_  │ │   security_      │
    │   history   │ │ reset_     │ │   events         │
    │             │ │ tokens     │ │                  │
    │ userId (FK) │ │ userId(FK) │ │ userId (FK)      │
    │ ipAddress   │ │ token      │ │ eventType        │
    │ userAgent   │ │ expiresAt  │ │ ipAddress        │
    │ success     │ │ used       │ │ userAgent        │
    └─────────────┘ └────────────┘ │ metadata (JSON)  │
                                   └──────────────────┘
```

### Design Principles

- **UUID primary keys**: Prevents ID enumeration attacks.
- **Soft deletes**: `deletedAt` field on User for data retention.
- **Timestamps**: `createdAt` and `updatedAt` on all tables.
- **Indexing**: All foreign keys and frequently queried columns indexed.
- **No plaintext passwords**: Only bcrypt hashes stored in `passwordHash`.

---

## Authentication Design

### Token Flow

```
1. Login
   Client → POST /auth/login {email, password}
   Server → Validates credentials, generates tokens
   Server → Returns accessToken in JSON, sets refreshToken as HTTP-only cookie

2. Authenticated Request
   Client → GET /api/resource + Authorization: Bearer <accessToken>
   Server → Verifies JWT, attaches user to request

3. Token Refresh (when access token expires)
   Client → POST /auth/refresh-token (cookie sent automatically)
   Server → Validates refresh token, issues new access token
   Server → If refresh token is invalid → Client redirects to login

4. Logout
   Client → POST /auth/logout
   Server → Invalidates refresh token, clears cookie
```

### Security Measures

1. **Separate secrets**: `JWT_SECRET` and `JWT_REFRESH_SECRET` are independent.
2. **Short-lived access tokens**: 15 minutes.
3. **Long-lived refresh tokens**: 7 days (30 days with "Remember Me").
4. **HTTP-only cookies**: Refresh tokens are not accessible via JavaScript.
5. **JTI claims**: Each token has a unique ID for rotation tracking.
6. **HS256 validation**: Algorithm explicitly verified on every decode.
7. **Atomic lockout**: Prevents race conditions on failed attempt counting.

---

## Password Intelligence Engine

### Modular Architecture (11 Services)

```
password.service.ts (orchestrator)
├── password-strength.service.ts    # Strength label mapping
├── entropy-calculator.service.ts   # Shannon entropy calculation
├── dictionary-checker.service.ts   # Common password detection (~1500 entries)
├── pattern-detector.service.ts     # Sequential, repeated, keyboard patterns
├── keyboard-pattern-detector.service.ts  # QWERTY, Dvorak patterns
├── leetspeak-detector.service.ts   # 1337speak detection (a=@, e=3, etc.)
├── sequence-detector.service.ts    # Alphabetical/numeric sequences
├── scoring-engine.service.ts       # Weighted scoring across all signals
├── crack-time-estimator.service.ts # Brute-force time estimates
├── suggestion.service.ts           # Improvement recommendations
└── report-formatter.service.ts     # Final response formatting
```

### Scoring Algorithm

The scoring engine combines weighted signals:

| Signal | Weight | Detection Method |
|---|---|---|
| Length | High | Character count |
| Character diversity | Medium | Uppercase, lowercase, digits, symbols |
| Entropy | High | Shannon entropy calculation |
| Dictionary match | Critical | Common password database |
| Pattern penalty | Negative | Keyboard/sequential/repeated patterns |
| Leetspeak penalty | Negative | 1337speak substitution detection |

---

## Testing

### Backend (Jest)

```bash
cd server
npm test                        # Run all 429 tests
npm run test:coverage           # With coverage report
npm run test:watch              # Watch mode
```

**Test structure**:
- `tests/unit/` — Individual service/utility tests
- `tests/integration/` — Full HTTP request/response tests with Supertest
- `tests/helpers/` — Shared test utilities (test app setup, mocks)

### Frontend (Vitest)

```bash
cd client
npx vitest run                  # Run all 70 tests
npx vitest run --coverage       # With coverage
```

**Test structure**:
- `tests/` — Component, integration, and service tests

### Load Testing (k6)

```bash
cd k6-scripts
k6 run config.js                # Shared configuration
k6 run auth-load.js             # Auth endpoint load test
k6 run password-check.js        # Password checker load test
k6 run password-generate.js     # Password generator load test
k6 run dashboard-load.js        # Dashboard endpoint load test
k6 run stress-test.js           # Stress test (up to 2000 VUs)
k6 run spike-test.js            # Spike test
k6 run endurance-test.js        # Sustained load test
```

---

## Code Quality

### Linting

```bash
# Server
cd server && npm run lint

# Client
cd client && npm run lint
```

### Type Checking

```bash
# Server
cd server && npx tsc --noEmit

# Client
cd client && npx tsc --noEmit
```

### ESLint Rules (Server)

- No explicit `any` types
- Explicit return types (warning)
- No unused variables (except underscore-prefixed)
- No `console.log` (except `console.warn/error`)
- Strict TypeScript rules
