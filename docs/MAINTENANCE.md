# SentinelPass - Maintenance Guide

## Table of Contents

1. [Routine Maintenance](#routine-maintenance)
2. [Dependency Updates](#dependency-updates)
3. [Database Maintenance](#database-maintenance)
4. [Security Maintenance](#security-maintenance)
5. [Performance Monitoring](#performance-monitoring)
6. [Log Management](#log-management)
7. [Backup Procedures](#backup-procedures)
8. [Release Process](#release-process)

---

## Routine Maintenance

### Daily

- [ ] Verify health check endpoint returns 200.
- [ ] Check Render service status for any alerts.
- [ ] Review security event logs for anomalies (if monitoring is set up).

### Weekly

- [ ] Review application logs for errors or warnings.
- [ ] Check database connection pool utilization.
- [ ] Verify backup integrity (if manual backups are configured).
- [ ] Review failed login attempts for brute-force patterns.

### Monthly

- [ ] Run `npm audit` and review new vulnerabilities.
- [ ] Check for dependency updates (see below).
- [ ] Review rate limiting effectiveness.
- [ ] Test disaster recovery procedure.
- [ ] Review user growth and database size.

---

## Dependency Updates

### Checking for Updates

```bash
# Server
cd server
npm outdated

# Client
cd client
npm outdated
```

### Updating Dependencies

**Patch versions** (e.g., 6.9.0 → 6.9.1): Generally safe, update immediately.

```bash
cd server && npm update
cd client && npm update
```

**Minor versions** (e.g., 6.9.0 → 6.10.0): Review changelog for new features. Test thoroughly.

**Major versions** (e.g., 6.x → 7.x): Requires careful planning:
1. Read the migration guide.
2. Test in a development environment first.
3. Update one major dependency at a time.
4. Run full test suite after each update.

### Prisma Updates

```bash
# Check current version
npx prisma --version

# Update Prisma
npm install prisma@latest @prisma/client@latest

# Regenerate client
npx prisma generate

# Test migrations
npx prisma migrate dev --name test-update
```

### Security Audits

```bash
# Server
cd server && npm audit

# Client
cd client && npm audit

# Fix automatically (non-breaking)
npm audit fix

# Fix with breaking changes (test carefully)
npm audit fix --force
```

---

## Database Maintenance

### Monitoring Disk Usage

On Render, check database size via the dashboard:
1. Go to your PostgreSQL service.
2. Check **Metrics** tab for storage usage.

### Cleaning Old Data

If the database grows large, archive old records:

```sql
-- Archive password logs older than 90 days
DELETE FROM password_logs
WHERE "createdAt" < NOW() - INTERVAL '90 days';

-- Archive login history older than 180 days
DELETE FROM login_history
WHERE "createdAt" < NOW() - INTERVAL '180 days';

-- Clean expired password reset tokens
DELETE FROM password_reset_tokens
WHERE "expiresAt" < NOW() OR "used" = true;

-- Archive security events older than 90 days
DELETE FROM security_events
WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

### Vacuum and Analyze

PostgreSQL auto-vacuums, but manual vacuuming helps after large deletes:

```sql
VACUUM ANALYZE users;
VACUUM ANALYZE password_logs;
VACUUM ANALYZE login_history;
VACUUM ANALYZE security_events;
```

### Index Monitoring

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS times_used,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for removal)
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';
```

---

## Security Maintenance

### Rotating JWT Secrets

When rotating secrets, all existing tokens will be invalidated:

1. Generate new secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update environment variables in Render dashboard.
3. Redeploy the service.
4. All users will need to log in again.

### Reviewing Security Events

```sql
-- Recent failed logins
SELECT u.email, se."eventType", se."ipAddress", se."createdAt"
FROM security_events se
JOIN users u ON u.id = se."userId"
WHERE se."eventType" = 'LOGIN_FAILURE'
ORDER BY se."createdAt" DESC
LIMIT 20;

-- Suspicious activity (many failures from same IP)
SELECT "ipAddress", COUNT(*) AS failure_count
FROM security_events
WHERE "eventType" = 'LOGIN_FAILURE'
  AND "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY "ipAddress"
HAVING COUNT(*) > 10
ORDER BY failure_count DESC;
```

### SSL/TLS Certificates

- **Vercel**: Automatically manages SSL certificates.
- **Render**: Automatically provisions and renews Let's Encrypt certificates.
- No manual certificate management required.

---

## Performance Monitoring

### Key Metrics to Watch

| Metric | Warning Threshold | Critical Threshold |
|---|---|---|
| API response time (p95) | > 500ms | > 2000ms |
| Database connections | > 50 | > 80 |
| Error rate | > 1% | > 5% |
| Memory usage | > 70% | > 90% |
| Disk usage | > 70% | > 85% |

### Render Metrics

Access via the Render dashboard:
1. Go to your service.
2. Click **Metrics** tab.
3. Review CPU, memory, and response time graphs.

### Load Testing (Periodic)

Re-run k6 load tests quarterly or before major releases:

```bash
cd k6-scripts
k6 run stress-test.js --out json=results.json
```

---

## Log Management

### Backend Logs

Logs are written to stdout/stderr and captured by Render.

### Log Levels

| Level | Usage |
|---|---|
| `error` | System errors, unhandled exceptions |
| `warn` | Deprecation notices, non-critical issues |
| `info` | Request logs, security events |
| `debug` | Development troubleshooting |

### Viewing Logs

**Render Dashboard**:
1. Go to your service.
2. Click **Logs**.
3. Use filter/search to find specific entries.

---

## Backup Procedures

### Automated Backups

- **Render PostgreSQL (paid)**: Automatic daily backups with point-in-time recovery.
- **Render PostgreSQL (free)**: No automatic backups. Manual backup required.

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backup_*.sql
```

### Restore

```bash
# Decompress
gunzip backup_20260723_120000.sql.gz

# Restore
psql $DATABASE_URL < backup_20260723_120000.sql
```

### Emergency Procedures

**Service Down**:
1. Check Render dashboard for deployment status.
2. Review recent commits for breaking changes.
3. Check health endpoint.
4. If database is down, check Render database status.
5. Rollback to previous deployment if needed.

**Data Breach**:
1. Immediately rotate all JWT secrets.
2. Force password reset for all users.
3. Review security event logs.
4. Check for unauthorized data access.
5. Document the incident.

---

## Release Process

### Semantic Versioning

| Change Type | Version Bump | Example |
|---|---|---|
| Bug fix | Patch (x.x.1) | 1.0.0 → 1.0.1 |
| New feature | Minor (x.1.0) | 1.0.0 → 1.1.0 |
| Breaking change | Major (1.0.0) | 1.0.0 → 2.0.0 |

### Release Checklist

1. [ ] All tests pass locally and in CI.
2. [ ] No new linting errors.
3. [ ] Database migrations tested.
4. [ ] Changelog updated.
5. [ ] Version bumped in `package.json`.
6. [ ] Code reviewed (if team project).
7. [ ] Tagged with `v1.x.x`.
8. [ ] GitHub Release created (via `release.yml` workflow).
9. [ ] Deployment verified on Render.
10. [ ] Smoke tests passed on production.
