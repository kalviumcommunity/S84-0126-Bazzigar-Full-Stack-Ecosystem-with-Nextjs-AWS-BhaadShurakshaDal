# Bhaad Suraksha Dal - Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BHAAD SURAKSHA DAL                              │
│                    Emergency Response Management System                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Next.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Dashboard   │  │  Forms       │  │  Analytics   │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         └────────────────┬──────────────────┘                           │
│                          ▼                                              │
│                    React Components                                     │
│                    TailwindCSS Styling                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js API Routes)                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ /api/members     │  │ /api/teams       │  │ /api/duties      │     │
│  │ CRUD operations  │  │ Team management  │  │ Duty scheduling  │     │
│  └─────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│           ▼                      ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │        Authentication & Authorization Middleware         │          │
│  └────────────────────────────┬─────────────────────────────┘          │
│                               ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │           Error Handling & Response Formatting           │          │
│  └────────────────────────────┬─────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    QUERY LAYER (Reusable Functions)                     │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  lib/queries.ts - All database query operations          │          │
│  │  ┌────────────────────────────────────────────────────┐  │          │
│  │  │ • getMembersByRole()    • getTeamDetails()         │  │          │
│  │  │ • getOngoingDuties()    • getCriticalIncidents()   │  │          │
│  │  │ • updateDutyStatus()    • reportIncident()         │  │          │
│  │  │ • Transactions          • Aggregations             │  │          │
│  │  └────────────────────────────────────────────────────┘  │          │
│  └────────────────────────┬─────────────────────────────────┘          │
└────────────────────────────┼───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER (Prisma ORM)                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │              Prisma Client (lib/prisma.ts)              │          │
│  │  ┌────────────────────────────────────────────────────┐ │          │
│  │  │ • Singleton pattern for connection pooling       │ │          │
│  │  │ • Type-safe queries with auto-completion        │ │          │
│  │  │ • Hot-reload safe configuration                │ │          │
│  │  │ • Automatic error formatting                   │ │          │
│  │  └────────────────────────────────────────────────────┘ │          │
│  └────────────────────────┬─────────────────────────────────┘          │
└────────────────────────────┼───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA LAYER (Prisma)                       │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ 5 Models + 6 Enums + 21 Indexes + Constraints           │          │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │          │
│  │ │   Member     │  │    Team      │  │TeamMembership│    │          │
│  │ │  (Users)     │  │  (Groups)    │  │  (Junction)  │    │          │
│  │ └──────────────┘  └──────────────┘  └──────────────┘    │          │
│  │ ┌──────────────┐  ┌──────────────┐                      │          │
│  │ │    Duty      │  │IncidentReport│                      │          │
│  │ │  (Tasks)     │  │  (Events)    │                      │          │
│  │ └──────────────┘  └──────────────┘                      │          │
│  └────────────────────────┬─────────────────────────────────┘          │
└────────────────────────────┼───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ PostgreSQL Database (bhaad_suraksha_dal)                │          │
│  │ ┌────────────┐  ┌────────────┐  ┌────────────┐         │          │
│  │ │  members   │  │   teams    │  │   duties   │         │          │
│  │ │  (people)  │  │  (groups)  │  │  (tasks)   │         │          │
│  │ └────────────┘  └────────────┘  └────────────┘         │          │
│  │ ┌────────────────────┐  ┌──────────────────────┐        │          │
│  │ │team_memberships    │  │incident_reports      │        │          │
│  │ │(team rosters)      │  │(emergency events)    │        │          │
│  │ └────────────────────┘  └──────────────────────┘        │          │
│  └────────────────────────┬─────────────────────────────────┘          │
└────────────────────────────┼───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   SERVICES & UTILITIES                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  Redis Cache     │  │  Session Store   │  │  Logging Service │     │
│  │  (Performance)   │  │  (State)         │  │  (Monitoring)    │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Create Member Flow

```
User Form Input
      ▼
┌──────────────────────────────┐
│  API Route /api/members POST │
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  Validate Input              │
│  • Email format              │
│  • Phone format              │
│  • Role enum                 │
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  Check Uniqueness            │
│  • Email not exists          │
│  • Phone not exists          │
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  prisma.member.create()      │
│  (Singleton client)          │
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  Database Insert             │
│  (PostgreSQL)                │
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  Return Created Record       │
│  (With auto-generated ID)    │
└──────────────────────────────┘
      ▼
Client Response
```

### Query Team with Relations Flow

```
API Request for Team Details
      ▼
┌──────────────────────────────────┐
│  API Route /api/teams/:id GET    │
└──────────────────────────────────┘
      ▼
┌──────────────────────────────────┐
│  getTeamDetails(teamId)          │
│  (Reusable query function)       │
└──────────────────────────────────┘
      ▼
┌──────────────────────────────────┐
│  prisma.team.findUnique({        │
│    include: {                    │
│      leader: {...}               │
│      members: {...}              │
│      duties: {...}               │
│    }                             │
│  })                              │
└──────────────────────────────────┘
      ▼
┌──────────────────────────────────┐
│  Database Query Execution        │
│  (PostgreSQL - multiple joins)   │
└──────────────────────────────────┘
      ▼
┌──────────────────────────────────┐
│  Type-Safe Response              │
│  (TeamWithRelations type)        │
└──────────────────────────────────┘
      ▼
Client Response with Full Team Data
```

---

## Database Relationship Diagram

```
                           ┌──────────────┐
                           │   Member     │
                           ├──────────────┤
                           │ id (PK)      │
                           │ email (U)    │
                           │ phone (U)    │
                           │ name         │
                           │ role (Enum)  │
                           │ isActive     │
                           └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
         (1:M) LeadedBy  (1:M) CreatedBy  (1:M) ReportedBy
                    │             │             │
                    ▼             ▼             ▼
        ┌──────────────────┐  ┌──────────┐  ┌────────────────┐
        │      Team        │  │  Duty    │  │IncidentReport  │
        ├──────────────────┤  ├──────────┤  ├────────────────┤
        │ id (PK)          │  │ id (PK)  │  │ id (PK)        │
        │ name (U)         │  │ title    │  │ incidentType   │
        │ leaderId (FK)    │  │ teamId   │  │ severity (Enum)│
        │ description      │  │ status   │  │ status (Enum)  │
        └────────┬─────────┘  │ priority │  │ description    │
                 │            └────┬─────┘  └────────┬───────┘
                 │                 │                 │
         (M:M) via Junction   (1:M) assigns     (N:1) relates
                 │                 │                 │
        ┌────────▼──────────────────┘                │
        │                                            │
        ▼                                            │
┌──────────────────────┐                           │
│  TeamMembership      │                           │
├──────────────────────┤                           │
│ id (PK)              │                           │
│ teamId (FK)◄─────────┼───────────────────────────┘
│ memberId (FK)        │
│ joinedAt             │
└──────────────────────┘
        ▲
        │
  (M:M) Member
        │
    ┌───┴────┐
    │        │
 Member   Team
(N side) (1 side)
```

---

## Enum Hierarchy

```
System
├── MemberRole (Access Control)
│   ├── ADMIN (Full system access)
│   ├── COMMANDER (Team leadership)
│   └── VOLUNTEER (Limited access)
│
├── DutyStatus (Lifecycle)
│   ├── PLANNED (Scheduled)
│   ├── ONGOING (In progress)
│   ├── COMPLETED (Finished)
│   └── CANCELLED (Abandoned)
│
├── DutyPriority (Urgency Level)
│   ├── LOW (Non-urgent)
│   ├── MEDIUM (Standard)
│   ├── HIGH (Important)
│   └── CRITICAL (Emergency)
│
├── IncidentType (Classification)
│   ├── INJURY (Personnel harm)
│   ├── ACCIDENT (Mishap)
│   ├── SECURITY_THREAT (Safety concern)
│   ├── PROPERTY_DAMAGE (Asset loss)
│   ├── HEALTH_EMERGENCY (Medical crisis)
│   ├── FIRE (Fire incident)
│   ├── NATURAL_DISASTER (Calamity)
│   ├── CIVIL_UNREST (Disorder)
│   └── OTHER (Miscellaneous)
│
├── IncidentSeverity (Impact Level)
│   ├── LOW (Minor impact)
│   ├── MEDIUM (Moderate impact)
│   ├── HIGH (Serious impact)
│   └── CRITICAL (Life-threatening)
│
└── IncidentStatus (Resolution Stage)
    ├── OPEN (New, unattended)
    ├── UNDER_INVESTIGATION (Being reviewed)
    ├── RESOLVED (Handled)
    └── CLOSED (Finalized)
```

---

## Index Strategy

```
Performance Optimization Through Indexing

Member Table Indexes:
  ├── email        → Fast user lookups by email
  ├── phone        → Fast user lookups by phone
  ├── role         → Fast role-based filtering
  └── isActive     → Fast active member queries

Team Table Indexes:
  ├── leaderId     → Fast leader lookups
  └── name         → Fast team name searches

TeamMembership Table Indexes:
  ├── teamId       → Fast team member lookups
  └── memberId     → Fast member team lookups

Duty Table Indexes:
  ├── teamId       → Fast team duty lookups
  ├── createdById  → Fast creator lookups
  ├── status       → Fast status filtering
  ├── priority     → Fast priority filtering
  ├── startDateTime → Fast date range queries
  └── endDateTime  → Fast duration queries

IncidentReport Table Indexes:
  ├── dutyId       → Fast duty incident lookups
  ├── reportedById → Fast reporter lookups
  ├── status       → Fast status filtering
  ├── severity     → Fast severity filtering
  ├── incidentType → Fast type filtering
  └── reportedAt   → Fast date range queries
```

---

## Query Pattern Examples

### Pattern 1: Simple Fetch

```
User Request
    ▼
GET /api/members?role=COMMANDER
    ▼
prisma.member.findMany({
  where: { role: "COMMANDER", isActive: true }
})
    ▼
Database executes query using role index
    ▼
Return typed results
```

### Pattern 2: Fetch with Relations

```
User Request
    ▼
GET /api/teams/:id
    ▼
getTeamDetails(teamId)
    ▼
prisma.team.findUnique({
  where: { id: teamId },
  include: {
    leader: true,
    members: { include: { member: true } },
    duties: true
  }
})
    ▼
Database joins multiple tables
    ▼
Return fully typed nested object
```

### Pattern 3: Aggregation

```
User Request
    ▼
GET /api/incidents/stats
    ▼
prisma.incidentReport.groupBy({
  by: ["severity"],
  _count: { id: true }
})
    ▼
Database groups and counts rows
    ▼
Return aggregated statistics
```

### Pattern 4: Transaction

```
User Action: Complete Duty
    ▼
prisma.$transaction(async (tx) => {
  await tx.duty.update(...);     // Update duty
  await tx.incidentReport
    .updateMany(...);            // Update incidents
})
    ▼
Database executes atomically
    ▼
Either all succeed or all rollback
```

---

## Deployment Architecture

```
Development
├── Local PostgreSQL
├── .env file with local DATABASE_URL
├── Prisma Studio for data browsing
└── Query logging enabled

Staging
├── Staging PostgreSQL (RDS/Cloud)
├── .env with staging DATABASE_URL
├── Migrations applied
└── Query logging enabled

Production
├── Production PostgreSQL (RDS/Cloud)
├── .env with production DATABASE_URL
├── All migrations applied
├── Connection pooling optimized
├── Query logging disabled
└── Backups automated
```

---

## Security Layers

```
Request
  ▼
┌─────────────────────────────┐
│ Authentication              │
│ (Verify user identity)      │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Authorization               │
│ (Check user permissions)    │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Input Validation            │
│ (Validate request data)     │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Prisma Query Execution      │
│ (Type-safe, parameterized)  │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ Database Constraints        │
│ (Enforce data integrity)    │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│ PostgreSQL Security         │
│ (User roles, SSL, etc)      │
└──────────┬──────────────────┘
           ▼
Response
```

---

## Performance Optimization Checklist

✅ **Indexing**

- 21 strategic indexes placed
- Foreign keys indexed
- Frequently filtered fields indexed
- Date range queries optimized

✅ **Connection Management**

- Singleton pattern implemented
- Connection pooling enabled
- Hot-reload safe configuration
- Automatic timeout management

✅ **Query Optimization**

- Selective field fetching with `select`
- Pagination with `skip`/`take`
- Eager loading with `include`
- Batch operations with `createMany`

✅ **Caching Strategy**

- Setup ready for Redis integration
- Invalidation patterns documented
- Cache-aside pattern supported

✅ **Monitoring**

- Query logging in development
- Error formatting configured
- Prisma Studio for exploration
- Verification scripts available

---

## Technology Stack

```
Frontend Layer
├── React 18.3.1
├── Next.js 14.2.35
└── TailwindCSS 4

API Layer
├── Next.js API Routes
├── TypeScript 5.3.3
└── Node.js 18+

Database Layer
├── PostgreSQL 12+
├── Prisma ORM 7.2.0
└── Prisma Client 7.2.0

Infrastructure
├── Environment: Node.js
├── Package Manager: npm
├── Version Control: Git
└── Container Ready (Docker)
```

---

## File Organization

```
Data Layer (Database)
├── prisma/schema.prisma     ← Schema definition
├── prisma.config.ts         ← Configuration
└── .env                      ← Connection credentials

ORM Layer (Prisma)
├── node_modules/@prisma/client  ← Generated client
├── frontend/lib/prisma.ts        ← Singleton wrapper
└── prisma/migrations/             ← Migration history

Query Layer
├── frontend/lib/queries.ts   ← Reusable functions
├── prisma/queries.example.ts ← Examples
└── prisma/seed.ts            ← Sample data

API Layer
├── frontend/app/api/members/
├── frontend/app/api/teams/
├── frontend/app/api/duties/
└── frontend/app/api/incidents/

Documentation
├── PRISMA_SETUP_GUIDE.md
├── PRISMA_SETUP_COMPLETE.md
├── SCHEMA_REFERENCE.md
└── SETUP_COMPLETE_SUMMARY.md
```

---

**Architecture Status**: ✅ Complete & Optimized
**Last Updated**: January 29, 2026
