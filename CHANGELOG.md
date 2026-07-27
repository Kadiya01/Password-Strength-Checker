# Changelog

All notable changes to SentinelPass are documented in this file.

## [1.1.0] - 2026-07-27

### Changed
- Migrated from MySQL to PostgreSQL for Render deployment compatibility
- Frontend now calls Render backend directly (removed broken Vercel API proxy)
- Dockerfile builder stage combines tsc-alias with build for reliable path alias resolution
- Architecture diagram updated to reflect cloud deployment (Vercel + Render + PostgreSQL)

### Fixed
- Render deployment crash: `@/` path aliases now resolve correctly in production builds
- `prisma` moved from devDependencies to dependencies (required at build time on Render)
- PostgreSQL null handling in `dashboard.repository.ts` and `securityEvents.ts`

### Added
- Comprehensive documentation suite: User Manual, Admin Guide, Developer Guide, Maintenance Guide, Troubleshooting Guide, Contributing Guide
- `.env.example` updated with PostgreSQL connection string format
- `vercel.json` with SPA rewrites (API proxy removed — frontend calls Render directly)

## [1.0.0] - 2026-07-23

### Added
- Password strength checker with entropy calculation, character breakdowns, and estimated crack times
- Secure password generator with customizable length (8-64) and passphrase mode
- Interactive security dashboard with gauge widgets, strength distribution charts, and session auditing
- User authentication system with JWT access/refresh tokens and HTTP-only cookies
- Account lockout after configurable failed login attempts
- Rate limiting (global + per-route) for abuse prevention
- Password check history with CSV export
- Offline fallback for all password services when API is unreachable
- Role-based access control (USER/ADMIN)
- Swagger/OpenAPI documentation at `/api/docs`

### Security
- Separate JWT secrets for access and refresh tokens
- HS256 algorithm validation on all token verification
- Refresh token jti claims for rotation tracking
- Atomic account lockout pattern (race condition prevention)
- CSV injection prevention in export
- Security event logging with try/catch (never crashes request flow)
- Helmet.js security headers (CSP, HSTS, X-Frame-Options)
- Input validation with Zod (frontend) and express-validator (backend)
- 10KB request body limit
- bcrypt password hashing (12 rounds default)
- `Vary: Origin` header for proper CORS caching
- `trust proxy` configuration for reverse proxy support

### Testing
- Backend: 429 tests across 33 suites (Jest + Supertest)
- Frontend: 70 tests across 10 suites (Vitest + Testing Library)
- Load testing: 8 k6 scripts (auth, password check, dashboard, stress, spike, endurance)
- CI/CD pipeline with GitHub Actions (lint, typecheck, test, build, security audit)

### Infrastructure
- Docker multi-stage builds for client and server
- Docker Compose orchestration with PostgreSQL health checks
- Nginx reverse proxy with gzip, caching, and SPA fallback
- GitHub Actions CI/CD pipeline
- Issue and PR templates

### Performance
- React lazy loading with code splitting (all pages)
- Vendor chunk splitting (React, UI, Forms, Data libraries)
- Nginx static asset caching (1 year, immutable)
- Gzip compression on server and Nginx
- Prisma database indexes on all frequently queried columns

### Documentation
- Comprehensive README with quick start guides
- API documentation (Swagger UI + Postman collection + HTTP client file)
- Changelog and release notes
