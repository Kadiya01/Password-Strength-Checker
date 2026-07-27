# SentinelPass - Administrator Guide

## Table of Contents

1. [System Administration](#system-administration)
2. [Environment Configuration](#environment-configuration)
3. [Database Management](#database-management)
4. [Security Configuration](#security-configuration)
5. [Monitoring and Logging](#monitoring-and-logging)
6. [User Management](#user-management)
7. [Backup and Recovery](#backup-and-recovery)
8. [Scaling Considerations](#scaling-considerations)

---

## System Administration

### Architecture Overview

```
                    ┌──────────────────┐
                    │   Vercel (CDN)   │
                    │  React Frontend  │
                    └────────┬─────────┘
                             │ HTTPS
                    ┌────────▼─────────┐
                    │  Render (PaaS)   │
                    │  Express Backend  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Render Postgres │
                    │   PostgreSQL 16  │
                    └──────────────────┘
```

| Component | Technology | Hosted On |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 | Vercel |
| Backend | Node.js 20, Express, TypeScript | Render |
| Database | PostgreSQL 16 | Render |
| ORM | Prisma 6.x | Server-side |

### Service Endpoints

| Service | URL | Purpose |
|---|---|---|
| Frontend | https://password-strength-checker-phi-murex.vercel.app | React SPA |
| Backend API | https://password-strength-checker-qa6b.onrender.com | REST API |
| Health Check | https://password-strength-checker-qa6b.onrender.com/api/health | Uptime monitoring |
| Swagger Docs | https://password-strength-checker-qa6b.onrender.com/api/docs | API documentation |

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server listen port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Access token signing secret (32+ chars) | Random hex string |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (32+ chars) | Different random hex string |
| `CLIENT_URL` | Frontend origin for CORS | `https://your-domain.vercel.app` |

### Optional Environment Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_EXPIRES_IN` | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |
| `BCRYPT_ROUNDS` | `12` | Password hash rounds |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `MAX_LOGIN_ATTEMPTS` | `5` | Account lockout threshold |
| `LOCKOUT_DURATION_MS` | `900000` | Lockout duration (15 min) |

### Generating Secure Secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate both `JWT_SECRET` and `JWT_REFRESH_SECRET`. Never reuse the same value.

---

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations in production
npx prisma migrate deploy

# Create a new migration (development only)
npx prisma migrate dev --name <migration_name>

# Reset database (development only - DESTRUCTIVE)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

### Database Schema

| Table | Description | Key Indexes |
|---|---|---|
| `roles` | USER, ADMIN role definitions | `name` (unique) |
| `users` | User accounts | `email`, `username`, `roleId`, `(isActive, isLocked)` |
| `password_logs` | Password check results (no passwords stored) | `userId`, `(userId, createdAt)` |
| `login_history` | Login audit trail | `userId`, `(userId, createdAt)`, `success` |
| `password_reset_tokens` | Password reset tokens | `userId`, `token` (unique) |
| `security_events` | Security event audit log | `userId`, `(userId, createdAt)`, `eventType` |

### Backup Strategy

**Render PostgreSQL (managed)**:
- Render automatically creates daily backups for paid plans.
- For free tier, use `pg_dump` for manual backups:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Restore**:
```bash
psql $DATABASE_URL < backup_20260723.sql
```

### Index Maintenance

All critical indexes are defined in `schema.prisma`. If performance degrades:

1. Check query patterns with `EXPLAIN ANALYZE`.
2. Add composite indexes for frequently filtered combinations.
3. Run `ANALYZE` on heavily updated tables.

---

## Security Configuration

### JWT Configuration

- **Access tokens**: 15-minute expiry, signed with HS256.
- **Refresh tokens**: 7-day expiry, stored in HTTP-only cookies.
- **Separate secrets**: `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different values.
- **JTI claims**: Each token has a unique ID for rotation tracking.

### Rate Limiting

| Scope | Window | Limit | Action on Exceed |
|---|---|---|---|
| Global | 15 min | 100 requests | 429 Too Many Requests |
| Auth endpoints | 15 min | Configurable | 429 Too Many Requests |
| Password check | 15 min | Configurable | 429 Too Many Requests |

### Account Lockout

- Triggered after `MAX_LOGIN_ATTEMPTS` (default: 5) consecutive failed logins.
- Duration: `LOCKOUT_DURATION_MS` (default: 15 minutes).
- Uses atomic increment to prevent race conditions.

### Security Headers (Helmet.js)

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `Content-Security-Policy` | Configured policy | XSS prevention |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |

### CORS Configuration

- **Production**: Only `CLIENT_URL` origin allowed.
- **Development**: `http://localhost:5173` allowed.
- **Credentials**: Enabled (for cookie-based refresh tokens).
- **Vary: Origin**: Set for proper CDN caching.

---

## Monitoring and Logging

### Health Check

```bash
curl https://password-strength-checker-qa6b.onrender.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-23T12:00:00.000Z",
  "uptime": 86400,
  "environment": "production"
}
```

### Security Events

All authentication events are logged to the `security_events` table:

| Event Type | Description |
|---|---|
| `LOGIN_SUCCESS` | Successful login |
| `LOGIN_FAILURE` | Failed login attempt |
| `LOGOUT` | User logout |
| `REGISTER` | New account creation |
| `PASSWORD_RESET_REQUEST` | Password reset email sent |
| `PASSWORD_RESET_COMPLETE` | Password successfully reset |
| `TOKEN_REFRESH` | Access token refreshed |

### Render Logs

Access logs via the Render dashboard:
1. Go to your service dashboard.
2. Click **Logs** in the sidebar.
3. Filter by log level or keyword.

### Monitoring Uptime

Set up external monitoring for the health endpoint:
- **UptimeRobot** (free): Monitor every 5 minutes.
- **cron-job.org** (free): Ping `/api/health` on a schedule.

---

## User Management

### Roles

| Role | Permissions |
|---|---|
| `USER` | Check passwords, generate passwords, view own dashboard/history |
| `ADMIN` | All USER permissions + user management (future) |

### Promoting a User to Admin

Via Prisma Studio or database console:

```sql
UPDATE users SET "roleId" = (
  SELECT id FROM roles WHERE name = 'ADMIN'
) WHERE email = 'admin@example.com';
```

---

## Scaling Considerations

### Render Free Tier Limitations

- Services sleep after 15 minutes of inactivity.
- Cold start takes 30-60 seconds.
- 750 hours/month across all services.

### Mitigation Options

1. **UptimeRobot pinger**: Keep the service awake (free).
2. **Upgrade to Starter ($7/mo)**: Always-on, no sleep.
3. **Upgrade to Standard ($25/mo)**: More resources, better performance.

### Horizontal Scaling

For higher traffic:
1. Add a load balancer (e.g., Render's paid plans).
2. Use connection pooling for PostgreSQL (`pgbouncer`).
3. Implement Redis for session storage and caching.
4. Consider splitting into microservices.

### Performance Targets

| Metric | Target | Current |
|---|---|---|
| API response time (p95) | < 200ms | ~50-150ms |
| Frontend FCP | < 1.5s | ~1.0s |
| Frontend LCP | < 2.5s | ~1.8s |
| Database query time | < 50ms | ~10-30ms |
| Uptime | 99.5% | Render free tier ~95% |
