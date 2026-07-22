# Password Strength Checker - Backend API

Enterprise-grade Password Strength Checker with Secure Password Generation and Authentication System. Built with Node.js, Express.js, TypeScript, Prisma ORM, and MySQL 8.

Implements NIST SP 800-63B standards and OWASP credential handling guidelines.

## Tech Stack

- **Runtime**: Node.js 22 LTS
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MySQL 8
- **ORM**: Prisma ORM
- **Authentication**: JWT (access + refresh tokens), bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit, compression, cookie-parser
- **Documentation**: Swagger (OpenAPI 3.0)
- **Testing**: Jest + Supertest

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma            # Database schema (UUID PKs)
├── src/
│   ├── config/                  # Configuration modules
│   │   ├── index.ts             # Environment variable loader
│   │   ├── cors.config.ts       # CORS configuration
│   │   ├── database.config.ts   # Prisma client singleton
│   │   ├── jwt.config.ts        # JWT configuration
│   │   ├── rateLimit.config.ts  # Rate limiting config
│   │   └── swagger.config.ts    # OpenAPI/Swagger config
│   ├── constants/               # Shared constants
│   │   ├── errorMessages.ts     # Centralized error messages
│   │   ├── httpStatus.ts        # HTTP status codes
│   │   ├── regex.ts             # Validation patterns
│   │   └── config.ts            # Default values
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── password.controller.ts
│   │   └── user.controller.ts
│   ├── database/
│   │   └── seed.ts              # Database seed (roles)
│   ├── interfaces/              # TypeScript interfaces
│   │   ├── auth.interface.ts
│   │   ├── common.interface.ts
│   │   ├── dashboard.interface.ts
│   │   ├── password.interface.ts
│   │   └── user.interface.ts
│   ├── middleware/               # Express middleware
│   │   ├── authenticate.middleware.ts
│   │   ├── authorize.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validate.middleware.ts
│   ├── repositories/            # Database access layer
│   │   ├── auth.repository.ts
│   │   ├── dashboard.repository.ts
│   │   ├── password.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                  # API route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── password.routes.ts
│   │   └── user.routes.ts
│   ├── security/                # Security modules
│   │   ├── accountLockout.ts
│   │   └── securityEvents.ts
│   ├── services/                # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── hash.service.ts
│   │   ├── password.service.ts
│   │   ├── password-strength.service.ts  # TODO: implement
│   │   ├── token.service.ts
│   │   └── user.service.ts
│   ├── tests/                   # Test suite
│   │   ├── helpers/
│   │   │   ├── testApp.ts
│   │   │   └── appInstance.ts
│   │   ├── integration/
│   │   │   ├── health.test.ts
│   │   │   ├── validation.test.ts
│   │   │   └── password.test.ts
│   │   └── unit/
│   │       ├── services/
│   │       │   └── hash.service.test.ts
│   │       └── utils/
│   │           └── apiError.test.ts
│   ├── utils/                   # Utility classes
│   │   ├── ApiError.ts          # Custom error classes
│   │   ├── ApiResponse.ts       # Standardized responses
│   │   ├── logger.ts            # Logger utility
│   │   └── passwordGenerator.ts # TODO: implement
│   ├── validators/              # Validation schemas
│   │   ├── auth.validator.ts
│   │   ├── common.validator.ts
│   │   ├── password.validator.ts
│   │   └── user.validator.ts
│   ├── app.ts                   # Express app factory
│   └── index.ts                 # Server entry point
├── .eslintrc.cjs
├── jest.config.js
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Installation

### Prerequisites

- Node.js 22 LTS
- MySQL 8 (or Docker)
- npm

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Copy the example environment file and configure it:

```bash
cp ../.env.example ../.env
```

Key variables:

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MySQL connection string | - |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | - |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `MAX_LOGIN_ATTEMPTS` | Account lockout threshold | `5` |
| `LOCKOUT_DURATION_MS` | Account lockout duration | `1800000` (30min) |

### 3. Database Setup

**Option A: Docker (Recommended)**

```bash
cd ..
docker-compose up -d
```

**Option B: Local MySQL**

Create the database manually:

```sql
CREATE DATABASE password_checker;
```

### 4. Prisma Migration

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## Running

### Development

```bash
# From project root (starts both client and server)
npm run dev

# Server only
cd server
npm run dev
```

The server starts at `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

### API Documentation

Swagger UI is available at:

```
http://localhost:3000/api/docs
```

OpenAPI JSON at:

```
http://localhost:3000/api/docs.json
```

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login with credentials |
| POST | `/api/auth/logout` | Yes | Logout (invalidate refresh token) |
| POST | `/api/auth/refresh-token` | No | Refresh access token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | Yes | Get current user profile |
| PUT | `/api/users/profile` | Yes | Update current user profile |

### Password

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/password/check-strength` | No | Check password strength |
| POST | `/api/password/generate` | No | Generate secure password |
| GET | `/api/password/history` | Yes | Get password check history |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/statistics` | Yes | Get dashboard statistics |

## Authentication Flow

1. **Register**: Create account with email, username, password
2. **Login**: Receive `accessToken` (15min) + `refreshToken` (7d, httpOnly cookie)
3. **Authenticated requests**: Send `Authorization: Bearer <accessToken>` header
4. **Token refresh**: Use `/auth/refresh-token` with cookie or body token
5. **Logout**: Invalidates refresh token, clears cookie

### Remember Me

Pass `rememberMe: true` in the login body to extend refresh token expiry to 30 days.

### Role-Based Access

The system supports `USER` and `ADMIN` roles. Use the `authorize("ADMIN")` middleware to protect admin-only routes.

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable cross-origin policy
- **Rate Limiting**: Global + per-route rate limiters
- **Compression**: Gzip response compression
- **bcrypt**: Password hashing with configurable rounds
- **JWT**: Short-lived access tokens + long-lived refresh tokens
- **Account Lockout**: Automatic lockout after failed login attempts
- **Input Validation**: express-validator on all endpoints
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: Helmet + input sanitization
- **Generic Error Messages**: Authentication errors never reveal whether email exists
- **Security Event Logging**: All auth events tracked with IP and user agent
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies for refresh tokens

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure

- **Integration tests**: Full HTTP request/response cycle with supertest
  - Health endpoint
  - Validation (register, login, forgot/reset password, password operations)
  - Protected routes (401 without token)
  - Password operations (strength check, generation)
- **Unit tests**: Individual service and utility testing
  - Hash service (bcrypt)
  - Custom error classes

## Linting

```bash
npm run lint
```

ESLint configured with strict TypeScript rules including:
- No explicit `any` types
- Explicit return types (warning)
- No unused vars (with underscore exception)
- No console (except warn/error)

## Architecture Principles

- **Feature-Based Modular Architecture**: Each feature has its own controller, service, repository, routes, validators
- **Separation of Concerns**: Clear boundaries between layers
- **SOLID Principles**: Single responsibility, dependency injection via module instances
- **DRY**: Shared utilities, constants, and middleware
- **KISS**: Simple, readable implementations
- **Centralized Error Handling**: Custom error classes with global error handler middleware
- **Standardized Responses**: Consistent JSON response format via `ApiResponse`

## Database Schema

All tables use **UUID primary keys** with automatic generation.

| Table | Description |
|-------|-------------|
| `roles` | USER, ADMIN roles |
| `users` | User accounts with auth fields |
| `password_logs` | Password strength check history |
| `login_history` | Login attempt audit trail |
| `password_reset_tokens` | Password reset token storage |
| `security_events` | Security event audit log |

## Deployment Notes

1. Set `NODE_ENV=production` in environment
2. Use a strong, unique `JWT_SECRET` (minimum 32 characters)
3. Configure `DATABASE_URL` for production MySQL
4. Set `CLIENT_URL` to your production frontend domain
5. Ensure HTTPS is enabled (use reverse proxy like Nginx)
6. Run `npx prisma migrate deploy` for database migrations
7. The Swagger docs endpoint (`/api/docs`) should be disabled or protected in production

## License

MIT
