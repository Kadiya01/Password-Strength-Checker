# SentinelPass - Academic Submission Materials

## System Overview

SentinelPass is a full-stack web application for password strength evaluation and secure credential generation. It implements a **Password Intelligence Engine** with 11 modular backend services that analyze passwords against entropy calculations, character composition, common password databases (~1500 entries), and NIST SP 800-63B guidelines.

The system provides real-time strength analysis with six labeled strength levels (Very Weak to Very Strong), weighted scoring algorithms, and estimated brute-force crack times across three attacker profiles (Online, Offline GPU, Supercomputer).

## Technology Justification

| Technology | Choice | Justification |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Type safety, component reusability, large ecosystem. TypeScript catches errors at compile time. |
| **Styling** | Tailwind CSS v4 | Utility-first approach enables rapid prototyping while maintaining design consistency. |
| **State Management** | Zustand + TanStack Query | Zustand for client-side auth state (persisted); TanStack Query for server state with automatic caching and refetching. |
| **Forms** | React Hook Form + Zod | Minimal re-renders, schema-based validation with TypeScript inference. |
| **Backend** | Express + TypeScript | Mature, well-documented, extensive middleware ecosystem. |
| **ORM** | Prisma | Type-safe database queries, automatic migration generation, schema-first approach. |
| **Database** | PostgreSQL 16 | ACID compliance, mature tooling, row-level indexing for performance. |
| **Auth** | JWT (access + refresh) | Stateless authentication with short-lived access tokens and HTTP-only cookie refresh tokens. |
| **Testing** | Jest + Vitest + k6 | Unit/integration testing (Jest), frontend component testing (Vitest), load testing (k6). |
| **Deployment** | Docker + Nginx | Containerized deployment with multi-stage builds; Nginx for static serving, gzip, caching, and reverse proxy. |

## Security Features Summary

1. **Authentication**: JWT with separate access/refresh secrets, HS256 algorithm validation, jti claims for token rotation tracking
2. **Authorization**: Role-based access control (USER/ADMIN) with middleware enforcement
3. **Account Protection**: Configurable lockout after failed attempts with atomic increment pattern
4. **Input Validation**: Dual-layer validation (Zod on frontend, express-validator on backend)
5. **Rate Limiting**: Global and per-route rate limiters with sliding window
6. **Security Headers**: Helmet.js (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
7. **Password Hashing**: bcrypt with configurable rounds (default 12)
8. **CORS**: Origin-restricted with credentials, Vary header for cache correctness
9. **CSV Injection Prevention**: Formula-trigger characters escaped in exports
10. **Security Event Logging**: Audit trail for all authentication events with IP/user-agent tracking
11. **Error Handling**: Stack traces only in development; security logging never crashes request flow

## Testing Summary

| Category | Framework | Tests | Suites |
|---|---|---|---|
| Backend Unit | Jest | ~400 | 25 |
| Backend Integration | Jest + Supertest | ~29 | 8 |
| Frontend Unit | Vitest | 53 | 5 |
| Frontend Component | Vitest + Testing Library | 13 | 3 |
| Frontend Integration | Vitest + Testing Library | 4 | 1 |
| **Total** | | **499** | **43** |

### Load Testing Results

8 k6 scripts covering:
- Auth endpoints (ramp 10→100 VUs)
- Password check (ramp 10→200 VUs)
- Dashboard (ramp 5→50 VUs)
- Stress test (ramp 10→2000 VUs)
- Spike test (20→500→20 VUs)
- Endurance test (50 VUs sustained)

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vercel CDN     │────▶│  Render (PaaS)   │────▶│  Render Postgres │
│  React SPA       │     │  Express Backend  │     │  PostgreSQL 16   │
│  (Port 443)      │     │  (Port 3000)      │     │  (Port 5432)     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │
        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│  Nginx (Docker)  │     │    Prisma ORM    │
│  Static Serving  │     │  Type-Safe Queries│
└──────────────────┘     └──────────────────┘
```

### Backend Architecture (Layered)

```
Routes → Middleware → Controllers → Services → Repositories → Prisma → PostgreSQL
```

Each feature (auth, user, password, dashboard) has its own controller, service, repository, routes, and validators — following the **Single Responsibility Principle**.

## Known Limitations

1. **Authentication**: No OAuth/social login
2. **Email**: Email service is mocked (not connected to SMTP)
3. **Password Check**: No breach database integration (e.g., Have I Been Pwned)
4. **Offline Mode**: Limited functionality when API is unreachable
5. **Scalability**: Single-server architecture (no horizontal scaling/sharding)
6. **Real-time**: No WebSocket support for live dashboard updates
7. **Cold Starts**: Render free tier sleeps after 15 min idle (30-60s wake-up)

## Future Improvements

1. **Breach Integration**: Check passwords against Have I Been Pwned API
2. **OAuth**: Google/GitHub social login
3. **WebSocket**: Real-time dashboard updates
4. **Admin Panel**: User management, system analytics
5. **API Versioning**: `/api/v1/` prefix for backward compatibility
6. **E2E Testing**: Playwright or Cypress integration
7. **Observability**: Prometheus metrics, distributed tracing
8. **CI/CD**: Automated deployment to cloud (AWS/GCP/Azure)
