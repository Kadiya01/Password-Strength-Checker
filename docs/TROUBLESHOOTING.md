# SentinelPass - Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Development Issues](#development-issues)
3. [Deployment Issues](#deployment-issues)
4. [Database Issues](#database-issues)
5. [Authentication Issues](#authentication-issues)
6. [Performance Issues](#performance-issues)
7. [Docker Issues](#docker-issues)

---

## Common Issues

### Application Won't Start

**Symptoms**: Server crashes on startup with an error.

**Solutions**:

1. Check that all required environment variables are set:
   ```bash
   node -e "
     const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
     const missing = required.filter(k => !process.env[k]);
     if (missing.length) console.log('Missing:', missing.join(', '));
     else console.log('All required variables set.');
   "
   ```

2. Verify `.env` file exists in the project root (not in `server/`).

3. Check for port conflicts:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   # macOS/Linux
   lsof -i :3000
   ```

### "Cannot find module" Error

**Symptoms**: `Error: Cannot find module '@/config/...'`

**Cause**: TypeScript path aliases (`@/`) not resolved in compiled output.

**Solutions**:

1. Ensure `tsc-alias` is installed and runs after build:
   ```bash
   npm run build && npx tsc-alias -p tsconfig.build.json
   ```

2. For Docker builds, verify the Dockerfile includes the `tsc-alias` step.

### "Prisma Client not generated" Error

**Symptoms**: `Error: @prisma/client did not initialize yet`

**Solutions**:

```bash
cd server
npx prisma generate
```

---

## Development Issues

### Vite Dev Server Won't Start

**Solutions**:

1. Clear the Vite cache:
   ```bash
   cd client
   rm -rf node_modules/.vite
   npm run dev
   ```

2. Check for port conflicts on 5173.

3. Verify `node_modules` is installed:
   ```bash
   cd client && npm install
   ```

### Backend Dev Server Crash Loop

**Solutions**:

1. Check for TypeScript compilation errors:
   ```bash
   cd server && npx tsc --noEmit
   ```

2. Verify database is running and accessible:
   ```bash
   cd server && npx prisma db push
   ```

3. Check `.env` file has correct `DATABASE_URL`.

### Hot Module Replacement (HMR) Not Working

**Solutions**:

1. Check if file watcher limit is reached:
   ```bash
   # Linux/macOS
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. Add `watchOptions` to `vite.config.ts` if on a network drive.

---

## Deployment Issues

### Render Deployment Fails

**Check logs**:
1. Go to Render dashboard → Your service → **Logs**.
2. Look for the specific error message.

**Common causes**:

| Error | Solution |
|---|---|
| `Missing environment variable` | Add the required variable in Render dashboard → **Environment** |
| `Cannot find module @/config` | `tsc-alias` not running in Dockerfile. Ensure build step includes alias resolution. |
| `Prisma generate failed` | Ensure `prisma` is in dependencies (not just devDependencies) |
| `npm ci ERR` | Lock file out of sync. Run `npm install` locally and commit `package-lock.json` |
| `Application failed to respond` | Health check failing. Check app starts on correct PORT (Render injects `PORT` env var) |

### Vercel Build Fails

**Common causes**:

| Error | Solution |
|---|---|
| `Type check failed` | Run `npx tsc --noEmit` in `client/` and fix errors |
| `Module not found` | Run `npm install` in `client/` and commit `package-lock.json` |
| `Build command failed` | Check `vercel.json` build configuration |

### CORS Errors in Production

**Symptoms**: Browser console shows `Access-Control-Allow-Origin` errors.

**Solutions**:

1. Verify `CLIENT_URL` environment variable matches the frontend URL exactly (including protocol).
2. Check CORS configuration allows the correct origin.
3. Ensure cookies are set with `SameSite=None; Secure` for cross-origin.

### Cold Start Delays (Render Free Tier)

**Symptoms**: First request after idle takes 30-60 seconds.

**Solutions**:

1. Set up a keep-alive ping with UptimeRobot (free):
   - URL: `https://your-service.onrender.com/api/health`
   - Interval: 5 minutes

2. Upgrade to Render Starter plan ($7/month) for always-on.

---

## Database Issues

### Connection Refused

**Solutions**:

1. Verify database URL format:
   ```
   postgresql://username:password@host:port/database_name
   ```

2. Check if PostgreSQL is running (local) or service is active (Render).

3. Verify the database name matches your PostgreSQL database.

### Migration Failures

**Solutions**:

1. Check migration status:
   ```bash
   cd server && npx prisma migrate status
   ```

2. If migrations are out of sync, create a migration:
   ```bash
   npx prisma migrate dev --name fix-sync
   ```

3. For production, always use `prisma migrate deploy` (never `migrate dev`).

### "Table already exists" Error

**Cause**: Database has tables but Prisma doesn't have corresponding migrations.

**Solution**:

```bash
# Reset and re-migrate (DESTRUCTIVE - backs up data first)
npx prisma migrate reset

# Or create a baseline migration
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > baseline.sql
```

### High Database CPU

**Solutions**:

1. Add missing indexes for frequently queried columns.
2. Optimize slow queries with `EXPLAIN ANALYZE`.
3. Implement connection pooling.
4. Consider upgrading the database tier.

---

## Authentication Issues

### "Invalid credentials" on Correct Password

**Solutions**:

1. Check if account is locked:
   ```sql
   SELECT "isLocked", "lockUntil", "failedAttempts"
   FROM users WHERE email = 'user@example.com';
   ```

2. Unlock manually if needed:
   ```sql
   UPDATE users SET "isLocked" = false, "failedAttempts" = 0, "lockUntil" = NULL
   WHERE email = 'user@example.com';
   ```

3. Verify password hash matches (bcrypt rehashing).

### Refresh Token Not Working

**Solutions**:

1. Check cookie is being sent (`withCredentials: true` in Axios).
2. Verify `CLIENT_URL` matches the frontend domain exactly.
3. Check if `SameSite` cookie attribute is correct for cross-origin requests.
4. Ensure `Secure` flag is set for HTTPS.

### JWT Token Expired Immediately

**Cause**: Clock skew between server and client.

**Solutions**:

1. Verify server time is correct.
2. Check `JWT_EXPIRES_IN` format (e.g., `15m` not `15min`).

### CORS Preflight Fails

**Solutions**:

1. Ensure CORS middleware is before route handlers.
2. Check `allowedHeaders` includes `Authorization`.
3. Verify `methods` includes all required HTTP methods.

---

## Performance Issues

### Slow API Responses

**Diagnosis**:

1. Check Render metrics for CPU/memory usage.
2. Review database query performance.
3. Check for N+1 query patterns.

**Solutions**:

1. Add database indexes.
2. Implement pagination for list endpoints.
3. Enable compression (already configured via `compression` middleware).
4. Cache frequently accessed data.

### Frontend Slow to Load

**Solutions**:

1. Verify code splitting is working (check Network tab for chunk files).
2. Check bundle size:
   ```bash
   cd client && npx vite build --mode analyze
   ```
3. Ensure static assets are cached (check `Cache-Control` headers).

### Memory Leaks

**Diagnosis**:

```bash
# Monitor Node.js memory
node --inspect dist/index.js
# Then connect Chrome DevTools
```

**Solutions**:

1. Check for unclosed database connections.
2. Verify Prisma client is singleton (not creating new instances).
3. Check for event listener leaks.

---

## Docker Issues

### Build Fails

**Solutions**:

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Build with verbose output:
   ```bash
   docker compose build --no-cache
   ```

3. Check Dockerfile syntax.

### Container Exits Immediately

**Solutions**:

1. Check container logs:
   ```bash
   docker compose logs server
   ```

2. Verify environment variables are set in `docker-compose.yml`.

3. Check health check is passing:
   ```bash
   docker inspect --format='{{.State.Health.Status}}' password_checker_server
   ```

### Cannot Connect to Database Container

**Solutions**:

1. Verify containers are on the same network:
   ```bash
   docker network ls
   docker network inspect password-strength-checker_app-network
   ```

2. Use container name as hostname (e.g., `db` not `localhost`).

3. Wait for database health check to pass before server starts.

### Port Already in Use

**Solutions**:

```bash
# Find process using the port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # macOS/Linux

# Kill the process or change the port in docker-compose.yml
```
