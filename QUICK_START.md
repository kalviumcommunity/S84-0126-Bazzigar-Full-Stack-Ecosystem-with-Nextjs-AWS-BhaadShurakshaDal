# 🚀 Bhaad Suraksha Dal - Quick Start Guide

## 5-Minute Setup

### Step 1: Configure Database (1 min)

```bash
# Edit .env file with your PostgreSQL credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/bhaad_suraksha_dal"
```

### Step 2: Install Dependencies (2 min)

```bash
npm install
```

### Step 3: Create Database & Run Migrations (1 min)

```bash
npm run db:migrate
```

This creates all tables with proper constraints and indexes.

### Step 4: Seed Sample Data (1 min)

```bash
npm run db:seed
```

Sample data includes:

- 1 ADMIN, 2 COMMANDERS, 5 VOLUNTEERS
- 2 Teams with members
- 3 Duties with different statuses
- 3 Incident Reports

### Step 5: Verify Installation

```bash
npm run db:verify
```

✅ **Done!** Your database is ready.

---

## Useful Commands

### View Data Visually

```bash
npm run db:studio
# Opens http://localhost:5555
```

### Check Migration Status

```bash
npm run db:status
```

### Reset Database (⚠️ Deletes all data)

```bash
npm run db:reset
```

### Apply Migrations to Production

```bash
npm run db:push
```

---

## Database Overview

### 5 Main Tables

**1. Members** - Users with roles (ADMIN, COMMANDER, VOLUNTEER)

- 8 members in seed data
- Indexed: email, phone, role

**2. Teams** - Groups led by commanders

- 2 teams in seed data
- Leader relationship enforced

**3. TeamMemberships** - M2M junction table

- 7 memberships in seed data
- Prevents duplicate assignments

**4. Duties** - Tasks assigned to teams

- 3 duties (PLANNED, ONGOING, COMPLETED)
- Priority levels: LOW, MEDIUM, HIGH, CRITICAL

**5. IncidentReports** - Emergency events

- 3 reports (INJURY, HEALTH_EMERGENCY, PROPERTY_DAMAGE)
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL

---

## Key Features

### ✅ Normalization

- 1NF, 2NF, 3NF compliant
- No data redundancy
- Atomic values only

### ✅ Constraints

- UNIQUE: email, phone, team name
- PRIMARY KEYS: CUID (distributed-safe)
- FOREIGN KEYS: CASCADE and RESTRICT policies
- NOT NULL: critical fields

### ✅ Indexes

- 20+ indexes for performance
- Foreign keys indexed
- Status/Priority fields indexed
- Timestamps indexed for range queries

### ✅ Relationships

- 1:N Team → Members (via TeamMembership)
- 1:N Team → Duties
- 1:N Duty → Incidents
- Proper referential integrity

---

## Sample TypeScript Queries

### Find Team with Members

```typescript
const team = await prisma.team.findUnique({
  where: { id: teamId },
  include: { members: { include: { member: true } } },
});
```

### Get All CRITICAL Duties

```typescript
const critical = await prisma.duty.findMany({
  where: { priority: "CRITICAL", status: "ONGOING" },
});
```

### List Recent Incidents

```typescript
const incidents = await prisma.incidentReport.findMany({
  where: { reportedAt: { gte: new Date("2024-01-01") } },
  orderBy: { reportedAt: "desc" },
});
```

---

## File Structure

```
Sprint 1/
├── prisma/
│   ├── schema.prisma       ← Database schema
│   ├── seed.ts             ← Sample data
│   ├── verify.ts           ← Verification script
│   └── migrations/         ← Migration history
├── SCHEMA_DOCUMENTATION.md ← Detailed docs
├── DATABASE_SETUP.md       ← Setup guide
├── QUICK_START.md          ← This file
└── package.json            ← npm scripts
```

---

## Troubleshooting

### Connection Error

```bash
# Check PostgreSQL is running
psql -U user -d bhaad_suraksha_dal -h localhost

# If fails, verify DATABASE_URL in .env
```

### Migration Conflicts

```bash
# Reset and try again
npm run db:reset
```

### Seed Fails

```bash
# Check database is empty or reset first
npm run db:reset
npm run db:seed
```

---

## Next Steps

1. **Review Schema**: Read [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md)
2. **Start Querying**: Use Prisma Client in your code
3. **Add Features**: Extend schema with new models
4. **Deploy**: Use `npm run db:push` for production

---

## Support

- 📖 Schema Docs: [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md)
- 🔧 Setup Guide: [DATABASE_SETUP.md](DATABASE_SETUP.md)
- ✅ Verification: `npm run db:verify`
- 🎯 View Data: `npm run db:studio`

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: January 29, 2026
