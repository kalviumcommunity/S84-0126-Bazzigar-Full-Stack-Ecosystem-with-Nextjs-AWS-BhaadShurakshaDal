# 🌊 BhaadShurakshaDal

### 🚨 AI-Powered Flood Early Warning & Community Alert System

**By Team Baazigaar**

BhaadShurakshaDal is a full-stack web platform that provides real-time flood risk monitoring and early alerts to help communities prepare before disasters strike.  
It uses free weather APIs, intelligent risk logic, and cloud notifications.

---

## 🎯 Problem Statement

Floods cause massive damage every year due to:

- Late warnings
- Poor local awareness
- Lack of real-time accessible data

Most people don’t receive early alerts or understand risk levels clearly.

---

## 💡 Solution

The platform provides:

✅ Live weather monitoring  
✅ Flood risk prediction  
✅ Location-based alerts  
✅ Map visualization  
✅ Emergency safety guidance  
✅ Admin alert broadcasting

---

## 🚀 Features

### 👤 User Features

- 📍 Select district / pincode
- 🌧️ View real-time rainfall & forecast
- 🚦 Risk level indicator
- 🗺️ Map visualization
- 📢 Alerts via SMS / Email / In-app
- 🧭 Safety tips and emergency contacts

### 🛠️ Admin Features

- Add flood-prone zones
- Broadcast alerts
- View registered users
- Monitor alerts

## Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

### Overview

This assignment explores how we deployed **BhaadShurakshaDal** from local development to the cloud using **Docker**, **CI/CD**, and **AWS/Azure**. The goal was to ensure consistent environments, automate deployment, and handle secrets securely.

### Dockerization

We containerized the app for reliable environments.

**Dockerfile** highlights:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose** for local dev (Next.js + Postgres + Redis):

```yaml
version: "3.8"
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bhaad
  redis:
    image: redis:7
```

---

### CI/CD Pipeline

Automated with **GitHub Actions**:

- Build Docker image
- Run unit tests & linting
- Push image to cloud registry
- Deploy to AWS ECS / Azure App Service

Snippet:

```yaml
name: CI/CD Pipeline
on: [push]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: node-version: '18'
      - run: npm install
      - run: npm test
      - run: docker build -t bhaadshurakshadal .
      - run: ./deploy.sh
```

---

### Cloud Deployment

**AWS:** ECS + RDS + SNS
**Azure:** App Service + PostgreSQL + Communication Services

Secrets and environment variables were securely managed via GitHub Secrets and environment configs.

---

### Reflection

**Challenges:** Docker networking, CI/CD build errors, secure secrets handling
**Successes:** Consistent environments, automated deployments, simplified infrastructure
**Future:** Add monitoring/logging and rollback strategies, explore IaC (Terraform/Bicep)

## 🗄️ Database Migrations & Seeding Guide

This section explains how **Prisma migrations** keep the database schema synchronized with the codebase, and how **idempotent seeding** ensures consistent test data.

### 📋 Overview

The Bhaad Suraksha Dal database uses **Prisma ORM** with **PostgreSQL** to manage schema changes and maintain referential integrity. The project includes:

- **Migration System**: Reproducible schema changes tracked in version control
- **Seed Script**: Idempotent data population (safe to run multiple times)
- **Verification Tools**: Ensure database consistency after operations

### 🔄 Migration Workflow

#### What is a Migration?

A migration is a **versioned SQL script** that transforms the database schema. Each migration:

- Has a unique timestamp/name (e.g., `20250202100000_init_schema`)
- Contains up/down logic (create/drop tables)
- Is stored in `prisma/migrations/` directory
- Is tracked in the database via `_prisma_migrations` table

#### Migrations in This Project

**Migration 1: `0_init_schema`** — Foundation tables

Creates the core schema with:

- **Members table**: Users with roles (ADMIN, COMMANDER, VOLUNTEER)
- **Teams table**: Organizational units led by members
- **TeamMembership table**: Many-to-many relationship (Members ↔ Teams)
- **Duties table**: Tasks assigned to teams with status/priority tracking
- **IncidentReport table**: Emergency reports filed during duties

All tables include:

- Proper foreign key constraints with `ON DELETE RESTRICT/CASCADE`
- Strategic indexes on foreign keys and filter columns (status, priority, timestamps)
- Unique constraints to prevent duplicates (email, phone, team name)
- Timestamps for audit trails (createdAt, updatedAt)

**Migration 2: `1_add_case_table`** — New related model

Adds the **Case table** demonstrating a one-to-many relationship:

- **Cases table**: Formal issue tracking linked to Members
- Supports case routing: `reportedById` → reporter, `assignedToId` → handler
- Status enum (OPEN, UNDER_REVIEW, IN_PROGRESS, RESOLVED, CLOSED)
- Priority enum (LOW, MEDIUM, HIGH, URGENT)
- Includes indexes on FK columns and filter columns for query performance

### 📝 Migration Commands

**1. View Migration Status**

```bash
npx prisma migrate status
```

Output:

```
Status
2 migrations found in prisma/migrations

Your local migration history and the migrations table from your database are in sync.
Last migration: 1_add_case_table
```

**2. Create a New Migration**

When you modify `prisma/schema.prisma`, create a migration:

```bash
npx prisma migrate dev --name add_new_feature
```

This:

- ✅ Detects schema changes
- ✅ Generates SQL migration file
- ✅ Applies to local development database
- ✅ Updates Prisma Client

**3. Apply Existing Migrations**

To apply pending migrations:

```bash
npx prisma migrate dev
```

or (without generating new migration):

```bash
npx prisma migrate deploy
```

**4. Reset Database (Development Only)**

⚠️ **WARNING: Deletes all data. Use only on dev environments!**

```bash
npx prisma migrate reset
```

This:

- 🗑️ Drops and recreates the database
- 🔄 Re-applies all migrations in order
- 🌱 Runs the seed script automatically

### 🌱 Seeding Strategy

#### Why Idempotent Seeding?

Traditional seeding uses `create()`, which **fails if data exists**:

```typescript
// ❌ BAD: Fails on second run
await prisma.member.create({
  data: { email: "admin@example.com", ... }
});
// Error: Unique constraint violation on email
```

**Idempotent seeding uses `upsert()`**, which is **safe to run multiple times**:

```typescript
// ✅ GOOD: Succeeds whether data exists or not
await prisma.member.upsert({
  where: { email: "admin@example.com" },
  update: { name: "Updated Name" },
  create: { email: "admin@example.com", name: "Initial Name", ... }
});
```

#### Seed Script Features

The `prisma/seed.ts` script implements idempotent seeding:

**Seed Functions** (in dependency order):

1. **seedMembers()**: Creates 5 sample members (admin, commanders, volunteers)
   - Uses `upsert` with email as unique key
   - Prevents duplicate accounts

2. **seedTeams()**: Creates 3 teams led by admin
   - Uses `upsert` with team name as unique key
   - Ensures single instance of each team

3. **seedTeamMemberships()**: Assigns members to teams
   - Uses `upsert` with (teamId, memberId) compound unique key
   - Prevents duplicate memberships

4. **seedDuties()**: Creates 3 sample duties/tasks
   - Uses `upsert` with stable generated ID
   - Ensures consistent duty IDs across runs

5. **seedCases()**: Creates 3 sample cases
   - Uses `upsert` with generated case ID
   - Demonstrates Member → Case relationship

**Error Handling**:

- ✅ Validates dependencies (e.g., Teams exist before creating Duties)
- ✅ Throws clear errors if prerequisites are missing
- ✅ Proper Prisma Client lifecycle management (disconnect in finally block)
- ✅ Logging at each step for debugging

### 🚀 Seeding Commands

**1. Run Seed Script**

```bash
npx prisma db seed
```

Output:

```
🌱 Starting database seed...

📝 Seeding Members...
   ✓ 5 members seeded
🏢 Seeding Teams...
   ✓ 3 teams seeded
👥 Seeding Team Memberships...
   ✓ 9 team memberships seeded
📋 Seeding Duties...
   ✓ 3 duties seeded
📂 Seeding Cases...
   ✓ 3 cases seeded

✅ Database seeding completed successfully!
📊 All sample data has been inserted or updated (idempotent).
```

**2. Seed After Database Reset**

```bash
npx prisma migrate reset
# This automatically seeds the database!
```

**3. Manual Seed via TypeScript**

```bash
npx ts-node prisma/seed.ts
```

### ✅ Verification Steps

**1. Check Migration History**

```bash
npx prisma migrate status
```

Confirms all migrations are applied.

**2. Verify Data in Prisma Studio**

```bash
npx prisma studio
```

Opens visual database browser at `http://localhost:5555`.

**3. Verify Data via SQL**

```bash
psql -U postgres -d bhaad_suraksha

-- Check members table
SELECT count(*) as member_count FROM members;
-- Expected: 5

-- Check teams
SELECT name FROM teams ORDER BY name;
-- Expected: "Community Outreach", "Disaster Management Unit", "Emergency Response Team"

-- Check idempotency: run seed twice
-- Member count should still be 5 (no duplicates created)
```

**4. Verify Relationships**

```sql
-- Members and their team memberships
SELECT m.name, t.name as team_name
FROM members m
JOIN team_memberships tm ON m.id = tm."memberId"
JOIN teams t ON tm."teamId" = t.id
ORDER BY m.name, t.name;
```

### 🔄 Rollback Strategy

#### Scenario 1: Undo Last Migration

```bash
# Reset database to previous state
npx prisma migrate resolve --rolled-back migration_name
# Then recreate from current schema
npx prisma migrate dev
```

#### Scenario 2: Recover from Production Disaster

⚠️ **For Production Databases:**

1. **Stop the application** (prevent new connections)
2. **Create backup** (automatic daily via cloud provider)
3. **Restore from backup** to point-in-time
4. **Verify data integrity** before resuming operations

```bash
# AWS RDS backup example
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier bhaad-suraksha-prod-restored \
  --db-snapshot-identifier backup-20250202-1200
```

#### Scenario 3: Development Environment Reset

```bash
# Completely wipe and recreate
npx prisma migrate reset

# Or selective reset (via Prisma Studio)
# 1. Open Prisma Studio
# 2. Delete records manually from tables
# 3. Re-run seed
```

### 🛡️ Production Data Protection

#### 1. Automatic Backups

**AWS RDS:**

```bash
# Automatic daily snapshots (default 7-day retention)
aws rds describe-db-snapshots --db-instance-identifier prod-db
```

**Azure Database for PostgreSQL:**

```bash
# Automatic geo-redundant backups (35-day retention)
# Accessible via Azure Portal → Backups
```

#### 2. Staging Environment Testing

Before deploying migrations to production:

```bash
# Deploy to staging first
npx prisma migrate deploy --skip-seed
npx prisma db seed

# Run integration tests on staging
npm test -- --env=staging

# Only if all tests pass, apply to production
npx prisma migrate deploy
```

#### 3. Schema Change Safeguards

**For Adding Columns with Default Values:**

```typescript
// ✅ Safe: minimal table lock
model Member {
  isVerified Boolean @default(false)  // No rewrite needed
}

// ⚠️ Risky: triggers table rewrite
model Member {
  createdAt DateTime @default(now())  // Rewrite for old rows!
}
```

**Zero-Downtime Alternative:**

```sql
-- Step 1: Add nullable column (fast)
ALTER TABLE members ADD COLUMN created_at TIMESTAMP;

-- Step 2: Populate existing rows (can be slow but non-blocking)
UPDATE members SET created_at = NOW();

-- Step 3: Add NOT NULL constraint (fast with existing data)
ALTER TABLE members ALTER COLUMN created_at SET NOT NULL;
```

#### 4. Monitoring & Alerts

```bash
# Monitor slow migrations
EXPLAIN ANALYZE ALTER TABLE members ADD COLUMN status VARCHAR(20);

# Check replication lag (if using replicas)
psql -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

### 📊 Package.json Database Commands

All database operations are configured as npm scripts:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio",
    "db:verify": "ts-node prisma/verify.ts",
    "db:push": "prisma db push",
    "db:status": "prisma migrate status"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Usage:**

```bash
npm run db:status          # Check migration status
npm run db:migrate         # Create new migration
npm run db:seed            # Run seeding
npm run db:reset           # Reset everything (dev only)
npm run db:studio          # Open visual browser
npm run db:verify          # Custom verification script
```

### 🎓 Key Takeaways

| Concept                      | Purpose                        | Safety                       |
| ---------------------------- | ------------------------------ | ---------------------------- |
| **Migrations**               | Version-control schema changes | Tracked, reversible, tested  |
| **Upsert Seeding**           | Idempotent data population     | Safe to run repeatedly       |
| **Migration Reset**          | Recreate schema from scratch   | Dev-only (dangerous in prod) |
| **Backups**                  | Disaster recovery              | Automatic + manual snapshots |
| **Staging Testing**          | Validate changes before prod   | Catches issues early         |
| **Zero-Downtime Migrations** | Deploy without downtime        | Use for large table changes  |

## 🏗️ High-Level Design (HLD)

### Overview

BhaadShurakshaDal is designed with a **Next.js frontend**, **API backend**, **PostgreSQL database**, and **Redis cache**, deployed on **AWS/Azure** for scalability and reliability.

### Architecture

- **Frontend (Next.js + TypeScript):**
  - Pages: `/login`, `/dashboard`, `/alerts`, `/map`
  - Data Fetching: Client-side fetch for public data, Server Actions / API Routes for sensitive requests

- **Backend (Next.js API Routes / Server Actions):**
  - Handles authentication, alert broadcasting, risk computation
  - Request validation and error handling

- **Database (PostgreSQL + Prisma):**
  - Tables: Users, Alerts, Locations
  - Read/write via Prisma ORM
  - Conceptual migrations for schema updates

- **Cache (Redis):**
  - Stores sessions, frequently accessed alerts
  - Cache-aside strategy with TTL for freshness

- **External Services:**
  - Auth: NextAuth
  - Notifications: AWS SNS / Email
  - File Storage: S3 / Azure Blob

- **Cloud Deployment (AWS/Azure):**
  - App: ECS / App Service
  - DB: RDS / Azure Database for PostgreSQL
  - Cache: ElastiCache / Azure Cache
  - CDN: CloudFront / Azure CDN

- **CI/CD (GitHub Actions):**
  - Build → Test → Migrate → Deploy
  - Dev / Stage / Prod environments

### Data Flow

Client → CDN → Frontend → Backend API → DB / Redis → External Services

### Security & Observability

- Secrets in AWS Secrets Manager / Azure Key Vault
- Logging: CloudWatch / App Insights
- Error tracking: Sentry

## Branch Naming Convention

Our team follows a structured Git branch naming pattern:

- feature/<name> → for new features
- fix/<name> → for bug fixes
- chore/<name> → for configuration or maintenance
- docs/<name> → for documentation updates

### Examples

- feature/flood-alert-ui
- feature/user-auth
- fix/api-timeout
- docs/readme-update

---

## 📊 Database Schema Design

This section documents the normalized PostgreSQL relational schema for the **BhaadShurakshaDal** flood alert system.

### 🎯 Core Entities (9 Primary Tables)

The system normalizes data across these core models:

1. **User** - System users and administrators
2. **District** - Geographic regions/states
3. **Zone** - Flood-prone zones within districts
4. **Location** - Specific user locations
5. **Alert** - Flood warnings and advisories
6. **Subscription** - User location monitoring preferences
7. **WeatherData** - Real-time weather measurements
8. **Notification** - Sent notifications (Email, SMS, In-app)
9. **SafetyGuidance** - Emergency instructions per alert

**Supporting Tables:** UserPreference, EmergencyContact, DistrictRiskProfile, AuditLog

### 🔗 Relational Model

```
User (1) ──── (Many) Subscription ──── (Many) Location
 |                                         |
 |                                         └─── (1) Zone ──── (1) District
 |
 ├──── (Many) UserAlert ──── (Many) Alert ──── (1) Location
 │
 ├──── (Many) Notification
 │
 ├──── (1) UserPreference
 │
 └──── (Many) EmergencyContact

Zone ──── (Many) WeatherData ──── (Optional) Location
District ──── (Many) DistrictRiskProfile
Alert ──── (Many) SafetyGuidance
```

### 🗂️ Normalization Analysis

#### ✅ First Normal Form (1NF)

All attributes are **atomic** and indivisible:

- WeatherData stores temperature, humidity, rainfall as separate columns (not composite "weather_info")
- Location.pincode is single atomic value
- No repeating groups stored as strings

#### ✅ Second Normal Form (2NF)

All non-key attributes depend on **entire primary key**:

- All tables use single-column UUID PKs
- Zone.floodProneness depends only on Zone.id (not on District.id)
- No partial dependencies

#### ✅ Third Normal Form (3NF)

No **transitive dependencies** between non-key attributes:

- District data NOT repeated in Zone or Location
- UserPreference separated from User (independent entity)
- DistrictRiskProfile separated from District (historical vs. current)
- SafetyGuidance separated from Alert (independent content)

#### ❌ Redundancy Avoided

- User info never duplicated across Notification, UserAlert, Subscription tables
- Risk scores computed on-demand, never pre-calculated/stored redundantly
- Historical data (DistrictRiskProfile, AuditLog) properly versioned/isolated

### 📈 Indexes for Query Performance

**Strategic index coverage for common patterns:**

```sql
-- User lookup (< 1ms)
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_phone ON "User"(phone);

-- Geographic queries (< 5ms)
CREATE INDEX idx_zone_districtId ON "Zone"(districtId);
CREATE INDEX idx_location_zoneId ON "Location"(zoneId);
CREATE INDEX idx_location_pincode ON "Location"(pincode);

-- Alert filtering (< 10ms)
CREATE INDEX idx_alert_locationId ON "Alert"(locationId);
CREATE INDEX idx_alert_severity ON "Alert"(severity);
CREATE INDEX idx_alert_status ON "Alert"(status);
CREATE INDEX idx_alert_issuedAt ON "Alert"(issuedAt);

-- Weather time-series (< 20ms for 24-hr range)
CREATE INDEX idx_weatherData_zoneId ON "WeatherData"(zoneId);
CREATE INDEX idx_weatherData_recordedAt ON "WeatherData"(recordedAt);

-- Notification delivery tracking (< 5ms)
CREATE INDEX idx_notification_userId ON "Notification"(userId);
CREATE INDEX idx_notification_status ON "Notification"(status);
```

### 🚀 Key Design Decisions

**Why This Schema Scales:**

1. **UUID Primary Keys**
   - Enable distributed databases and horizontal sharding
   - Support replication without ID conflicts

2. **Time-based Partitioning Ready**
   - Alert table partitionable by issuedAt (time-series)
   - WeatherData by recordedAt (compress old data)
   - AuditLog by createdAt (compliance retention)

3. **Cascade Deletes**
   - Maintain referential integrity automatically
   - Delete zone → auto-remove zones, locations, alerts

4. **Unique Constraints**
   - Subscription(userId, locationId) → prevents duplicate monitoring
   - UserAlert(userId, alertId) → prevents duplicate notifications

5. **Soft Deletes Support**
   - User.deletedAt allows account deactivation without data loss

### 💡 Real-World Query Examples

```sql
-- 1. Dashboard: User's active alerts
SELECT a.* FROM "Alert" a
JOIN "Subscription" s ON a.locationId = s.locationId
WHERE s.userId = 'user-123' AND a.status = 'ACTIVE'
ORDER BY a.severity DESC;

-- 2. Risk Calculation: Recent weather in zone
SELECT * FROM "WeatherData"
WHERE zoneId = 'zone-456' AND recordedAt > NOW() - INTERVAL '6 hours'
ORDER BY recordedAt DESC;

-- 3. Notification Engine: Users to alert
SELECT DISTINCT u.* FROM "User" u
JOIN "Subscription" s ON u.id = s.userId
JOIN "Alert" a ON s.locationId = a.locationId
WHERE a.id = 'alert-789' AND s.notifyFor @> ARRAY[a.severity];

-- 4. Admin: Districts with recent floods
SELECT d.*, COUNT(a.id) as active_alerts
FROM "District" d
LEFT JOIN "Zone" z ON d.id = z.districtId
LEFT JOIN "Location" l ON z.id = l.zoneId
LEFT JOIN "Alert" a ON l.id = a.locationId AND a.status = 'ACTIVE'
GROUP BY d.id ORDER BY active_alerts DESC;
```

### ✅ Setup & Verification

**1. Apply Migrations**

```bash
cd frontend
npx prisma migrate dev --name init_schema
```

**2. Seed Sample Data**

```bash
npx prisma db seed
```

**3. View in Prisma Studio**

```bash
npx prisma studio  # Opens http://localhost:5555
```

**4. Manual Verification**

```bash
psql -U postgres -d bhaad
\dt  -- List all 14 tables
SELECT count(*) FROM "User";  -- Should show seeded users
SELECT count(*) FROM "Alert";  -- Should show seeded alerts
```

### 📊 Seeded Data Summary

| Entity          | Count | Details                              |
| --------------- | ----- | ------------------------------------ |
| Districts       | 3     | Mumbai, Pune, Kolkata                |
| Zones           | 5     | Mix of HIGH/MEDIUM/LOW risk          |
| Locations       | 6     | Dadar, Colaba, Bandra, Andheri, etc. |
| Users           | 3     | 1 Admin, 2 Regular Users             |
| Alerts          | 3     | CRITICAL, HIGH, MEDIUM severity      |
| Weather Records | 4     | Real-time readings per zone          |
| Subscriptions   | 3     | User → Location monitoring           |
| Notifications   | 3     | Sent via Email, SMS, In-app          |
| Audit Logs      | 3     | User login & alert creation          |

### 🎯 Why This Design Fits BhaadShurakshaDal

1. **Real-time Alerting**: Alert + UserAlert tables enable instant push to subscribed users
2. **Geographic Drill-down**: District → Zone → Location hierarchy supports region-level monitoring
3. **Risk Calculation**: WeatherData + DistrictRiskProfile enable intelligent flood risk scoring
4. **User Personalization**: UserPreference + Subscription allow custom alert channels and thresholds
5. **Emergency Response**: EmergencyContact + SafetyGuidance provide quick access to help resources
6. **Compliance**: AuditLog ensures all critical actions are tracked for disaster management audits

---
