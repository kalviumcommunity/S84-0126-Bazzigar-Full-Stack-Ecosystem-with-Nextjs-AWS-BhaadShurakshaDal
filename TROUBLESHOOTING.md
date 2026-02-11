# Troubleshooting Guide

Common issues and their solutions for BhaadShurakshaDal.

## Installation Issues

### Issue: npm install fails

**Symptoms:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. Clear npm cache:

```bash
npm cache clean --force
```

2. Delete node_modules and package-lock.json:

```bash
rm -rf node_modules package-lock.json
npm install
```

3. Use legacy peer deps:

```bash
npm install --legacy-peer-deps
```

### Issue: Prisma Client generation fails

**Symptoms:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**

```bash
npx prisma generate
```

## Database Issues

### Issue: Cannot connect to PostgreSQL

**Symptoms:**

```
Error: P1001: Can't reach database server at localhost:5432
```

**Solutions:**

1. Check if PostgreSQL is running:

```bash
# Windows
sc query postgresql

# Linux/Mac
sudo systemctl status postgresql
```

2. Verify DATABASE_URL in .env:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Check PostgreSQL is listening:

```bash
psql -U postgres -c "SELECT 1"
```

4. Restart PostgreSQL:

```bash
# Windows
net stop postgresql
net start postgresql

# Linux
sudo systemctl restart postgresql

# Mac
brew services restart postgresql
```

### Issue: Migration fails

**Symptoms:**

```
Error: P3009: migrate found failed migrations
```

**Solutions:**

1. Check migration status:

```bash
npx prisma migrate status
```

2. Reset database (development only):

```bash
npx prisma migrate reset
```

3. Mark migration as applied:

```bash
npx prisma migrate resolve --applied "migration_name"
```

### Issue: Prisma Studio won't open

**Symptoms:**

```
Error: Port 5555 is already in use
```

**Solution:**

```bash
# Kill process on port 5555
# Windows
netstat -ano | findstr :5555
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5555 | xargs kill -9

# Or use different port
npx prisma studio --port 5556
```

## Redis Issues

### Issue: Cannot connect to Redis

**Symptoms:**

```
Error: Redis connection to localhost:6379 failed
```

**Solutions:**

1. Check if Redis is running:

```bash
# Windows (if using WSL)
redis-cli ping

# Linux
sudo systemctl status redis

# Mac
brew services list | grep redis
```

2. Start Redis:

```bash
# Windows (WSL)
sudo service redis-server start

# Linux
sudo systemctl start redis

# Mac
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:7
```

3. Verify REDIS_URL in .env:

```env
REDIS_URL="redis://localhost:6379"
```

### Issue: Redis authentication fails

**Symptoms:**

```
Error: NOAUTH Authentication required
```

**Solution:**

Update .env with password:

```env
REDIS_URL="redis://:password@localhost:6379"
```

## Development Server Issues

### Issue: Port 3000 already in use

**Symptoms:**

```
Error: Port 3000 is already in use
```

**Solutions:**

1. Kill process on port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

2. Use different port:

```bash
PORT=3001 npm run dev
```

### Issue: Hot reload not working

**Symptoms:**
Changes not reflecting in browser

**Solutions:**

1. Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

2. Check file watcher limits (Linux):

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. Disable browser cache in DevTools

### Issue: Build fails

**Symptoms:**

```
Error: Build failed with errors
```

**Solutions:**

1. Check TypeScript errors:

```bash
npm run type-check
```

2. Check ESLint errors:

```bash
npm run lint
```

3. Clear build cache:

```bash
rm -rf .next
npm run build
```

## API Issues

### Issue: API returns 500 Internal Server Error

**Symptoms:**
All API calls fail with 500 error

**Solutions:**

1. Check server logs:

```bash
# Development
npm run dev

# Production
docker-compose logs -f app
```

2. Verify environment variables are set

3. Check database connection

4. Verify Prisma Client is generated:

```bash
npx prisma generate
```

### Issue: CORS errors

**Symptoms:**

```
Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:3001' has been blocked by CORS
```

**Solution:**

Add CORS headers in next.config.js:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
        ],
      },
    ];
  },
};
```

### Issue: Authentication not working

**Symptoms:**
User cannot login or session expires immediately

**Solutions:**

1. Check JWT_SECRET is set in .env

2. Verify token expiration:

```typescript
// Check token payload
const decoded = jwt.decode(token);
console.log(decoded);
```

3. Clear browser cookies and localStorage

4. Check Redis connection for session storage

## Docker Issues

### Issue: Docker build fails

**Symptoms:**

```
Error: failed to solve with frontend dockerfile.v0
```

**Solutions:**

1. Check Dockerfile syntax

2. Clear Docker cache:

```bash
docker builder prune -a
```

3. Build without cache:

```bash
docker build --no-cache -t bhaadshurakshadal .
```

### Issue: Container exits immediately

**Symptoms:**

```
docker-compose up
Container exits with code 1
```

**Solutions:**

1. Check container logs:

```bash
docker-compose logs app
```

2. Run container interactively:

```bash
docker run -it bhaadshurakshadal sh
```

3. Verify environment variables in docker-compose.yml

### Issue: Cannot connect to database from container

**Symptoms:**
App container cannot reach database container

**Solutions:**

1. Use service name instead of localhost:

```env
DATABASE_URL="postgresql://user:password@db:5432/dbname"
```

2. Check network configuration:

```bash
docker network ls
docker network inspect <network-name>
```

3. Ensure containers are on same network in docker-compose.yml

## Performance Issues

### Issue: Slow page load

**Symptoms:**
Pages take > 5 seconds to load

**Solutions:**

1. Enable caching:

```typescript
// Check Redis cache is working
const cached = await redis.get("key");
```

2. Optimize database queries:

```bash
# Check slow queries
npx prisma studio
```

3. Add indexes to frequently queried columns

4. Use pagination for large datasets

### Issue: High memory usage

**Symptoms:**
Application crashes with out of memory error

**Solutions:**

1. Check for memory leaks:

```bash
node --inspect npm run dev
```

2. Increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

3. Optimize database connection pool:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 10
}
```

## Environment Variable Issues

### Issue: Environment variables not loading

**Symptoms:**

```
Error: DATABASE_URL is not defined
```

**Solutions:**

1. Check .env file exists in root directory

2. Restart development server after changing .env

3. For Next.js client-side variables, use NEXT*PUBLIC* prefix:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

4. Verify .env is not in .gitignore (it should be)

## Git Issues

### Issue: Husky pre-commit hook fails

**Symptoms:**

```
husky - pre-commit hook exited with code 1
```

**Solutions:**

1. Install Husky:

```bash
npm run prepare
```

2. Fix linting errors:

```bash
npm run lint
npm run format
```

3. Skip hooks temporarily (not recommended):

```bash
git commit --no-verify -m "message"
```

## Common Error Messages

### "Module not found"

**Solution:**

```bash
npm install
# or
npm install <missing-module>
```

### "Cannot find module '@prisma/client'"

**Solution:**

```bash
npx prisma generate
```

### "Invalid hook call"

**Solution:**
Check React hooks are used correctly (only in function components, not in loops/conditions)

### "Hydration failed"

**Solution:**
Ensure server and client render the same content. Check for:

- Date formatting differences
- Random values
- Browser-only APIs used during SSR

## Getting Help

If you're still experiencing issues:

1. Check existing GitHub issues
2. Search Stack Overflow
3. Open a new GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Relevant logs

## Useful Commands

### Check versions

```bash
node --version
npm --version
npx prisma --version
```

### View logs

```bash
# Development
npm run dev

# Docker
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

### Database commands

```bash
# Connect to database
psql $DATABASE_URL

# View tables
\dt

# Describe table
\d table_name

# Exit
\q
```

### Redis commands

```bash
# Connect to Redis
redis-cli

# Check connection
PING

# View all keys
KEYS *

# Get value
GET key

# Clear all data
FLUSHALL

# Exit
exit
```

## Debug Mode

Enable debug logging:

```env
# .env
DEBUG=*
LOG_LEVEL=debug
```

View detailed logs:

```bash
npm run dev
```

## Health Checks

Verify system components:

```bash
# Check database
psql $DATABASE_URL -c "SELECT 1"

# Check Redis
redis-cli ping

# Check API
curl http://localhost:3000/api/health

# Check all services
docker-compose ps
```

## Reset Everything

If all else fails, complete reset:

```bash
# Stop all services
docker-compose down -v

# Remove node_modules
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Clear caches
npm cache clean --force
rm -rf .next

# Reinstall
npm install
cd frontend && npm install

# Reset database
npm run db:reset

# Restart
npm run dev
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
