# Bhaad Suraksha Dal - Database Schema Documentation

**Version:** 1.0  
**Date:** January 29, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Database Architecture](#database-architecture)
4. [Entity-Relationship Diagram](#entity-relationship-diagram)
5. [Schema Design](#schema-design)
6. [Normalization](#normalization)
7. [Relationships](#relationships)
8. [Data Constraints](#data-constraints)
9. [Indexes](#indexes)
10. [Sample Queries](#sample-queries)
11. [Setup Instructions](#setup-instructions)

---

## Executive Summary

The **Bhaad Suraksha Dal** (Emergency Security Force) database is a fully normalized relational schema built with PostgreSQL and Prisma ORM. It manages:

- **Members**: Users with role-based access (ADMIN, COMMANDER, VOLUNTEER)
- **Teams**: Groups of members led by commanders
- **Duties**: Tasks/assignments allocated to teams
- **Incident Reports**: Emergency events reported during duties

The schema is designed for **scalability**, **data integrity**, and **query performance**.

---

## System Overview

### Purpose

The system tracks emergency response operations, including team compositions, duty assignments, and incident reporting during crisis situations.

### Key Features

- ✅ Role-based member management
- ✅ Team organization with leadership hierarchy
- ✅ Duty lifecycle tracking (planned → ongoing → completed)
- ✅ Incident classification and severity tracking
- ✅ Audit trail through timestamps
- ✅ Production-ready constraints and validations

---

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL 12+
- **ORM**: Prisma 5+
- **Primary Key Type**: CUID (distributed system safe)
- **Host**: PostgreSQL instance

### Tables (5 Core Models)

```
┌─────────────────────────────────────────────────────────────┐
│                      MEMBERS                                │
│  (Users with roles: ADMIN, COMMANDER, VOLUNTEER)           │
└─────────────────────────────────────────────────────────────┘
  ↓ (leads)                              ↓ (member of)
┌──────────────────────────┐     ┌──────────────────────────┐
│         TEAMS            │     │  TEAM_MEMBERSHIPS        │
│  (Groups of members)     │ ← → │  (M2M Junction Table)    │
└──────────────────────────┘     └──────────────────────────┘
  ↓ (assigned to)
┌──────────────────────────────────────────────────────────────┐
│                      DUTIES                                  │
│  (Tasks with status: PLANNED, ONGOING, COMPLETED, CANCELLED)│
└──────────────────────────────────────────────────────────────┘
  ↓ (reported during)
┌──────────────────────────────────────────────────────────────┐
│                  INCIDENT_REPORTS                            │
│  (Emergencies: INJURY, ACCIDENT, FIRE, HEALTH, etc.)       │
└──────────────────────────────────────────────────────────────┘
```

---

## Schema Design

### 1. MEMBERS Table

**Purpose**: Store user accounts with role-based access control

| Column        | Type         | Constraints      | Purpose              |
| ------------- | ------------ | ---------------- | -------------------- |
| id            | CUID         | PK               | Unique identifier    |
| email         | String       | UNIQUE, NOT NULL | Contact & login      |
| name          | VarChar(255) | NOT NULL         | Full name            |
| phone         | String       | UNIQUE, NOT NULL | Contact number       |
| role          | Enum         | NOT NULL         | Access level         |
| dateOfJoining | DateTime     | NOT NULL         | Recruitment date     |
| isActive      | Boolean      | DEFAULT true     | Account status       |
| createdAt     | DateTime     | DEFAULT now()    | Record creation time |
| updatedAt     | DateTime     | Auto-updated     | Last modification    |

**Indexes**: email, phone, role, isActive

```typescript
enum MemberRole {
  ADMIN       // System administrator
  COMMANDER   // Team leader
  VOLUNTEER   // Volunteer member
}
```

---

### 2. TEAMS Table

**Purpose**: Organize members into operational groups

| Column      | Type         | Constraints          | Purpose           |
| ----------- | ------------ | -------------------- | ----------------- |
| id          | CUID         | PK                   | Unique identifier |
| name        | VarChar(255) | UNIQUE, NOT NULL     | Team name         |
| description | Text         | NULLABLE             | Team details      |
| leaderId    | String       | FK(Member), NOT NULL | Team commander    |
| createdAt   | DateTime     | DEFAULT now()        | Creation date     |
| updatedAt   | DateTime     | Auto-updated         | Last modification |

**Indexes**: leaderId, name  
**Foreign Keys**: leaderId → members.id (ON DELETE RESTRICT)

---

### 3. TEAM_MEMBERSHIPS Table (Junction)

**Purpose**: Manage many-to-many relationship between teams and members

| Column    | Type     | Constraints          | Purpose           |
| --------- | -------- | -------------------- | ----------------- |
| id        | CUID     | PK                   | Unique identifier |
| teamId    | String   | FK(Team), NOT NULL   | Team reference    |
| memberId  | String   | FK(Member), NOT NULL | Member reference  |
| joinedAt  | DateTime | DEFAULT now()        | Join date         |
| updatedAt | DateTime | Auto-updated         | Last modification |

**Unique Constraint**: (teamId, memberId) - prevents duplicate memberships  
**Indexes**: teamId, memberId  
**Foreign Keys**:

- teamId → teams.id (ON DELETE CASCADE)
- memberId → members.id (ON DELETE CASCADE)

---

### 4. DUTIES Table

**Purpose**: Track assignments and emergency operations

| Column        | Type         | Constraints          | Purpose            |
| ------------- | ------------ | -------------------- | ------------------ |
| id            | CUID         | PK                   | Unique identifier  |
| title         | VarChar(255) | NOT NULL             | Task name          |
| description   | Text         | NULLABLE             | Details            |
| teamId        | String       | FK(Team), NOT NULL   | Assigned team      |
| startDateTime | DateTime     | NOT NULL             | Start time         |
| endDateTime   | DateTime     | NOT NULL             | End time           |
| status        | Enum         | DEFAULT PLANNED      | Current state      |
| location      | VarChar(255) | NOT NULL             | Operation location |
| priority      | Enum         | DEFAULT MEDIUM       | Urgency level      |
| createdById   | String       | FK(Member), NOT NULL | Creator            |
| createdAt     | DateTime     | DEFAULT now()        | Creation date      |
| updatedAt     | DateTime     | Auto-updated         | Last modification  |

**Indexes**: teamId, createdById, status, priority, startDateTime, endDateTime  
**Foreign Keys**:

- teamId → teams.id (ON DELETE CASCADE)
- createdById → members.id (ON DELETE RESTRICT)

```typescript
enum DutyStatus {
  PLANNED      // Not yet started
  ONGOING      // Currently active
  COMPLETED    // Finished successfully
  CANCELLED    // Cancelled operation
}

enum DutyPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

---

### 5. INCIDENT_REPORTS Table

**Purpose**: Document emergencies and critical events

| Column       | Type         | Constraints          | Purpose           |
| ------------ | ------------ | -------------------- | ----------------- |
| id           | CUID         | PK                   | Unique identifier |
| dutyId       | String       | FK(Duty), NOT NULL   | Associated duty   |
| reportedById | String       | FK(Member), NOT NULL | Reporter          |
| incidentType | Enum         | NOT NULL             | Classification    |
| severity     | Enum         | NOT NULL             | Urgency level     |
| description  | Text         | NOT NULL             | Detailed account  |
| location     | VarChar(255) | NOT NULL             | Incident location |
| reportedAt   | DateTime     | DEFAULT now()        | Report time       |
| status       | Enum         | DEFAULT OPEN         | Current status    |
| createdAt    | DateTime     | DEFAULT now()        | Creation date     |
| updatedAt    | DateTime     | Auto-updated         | Last modification |

**Indexes**: dutyId, reportedById, status, severity, incidentType, reportedAt  
**Foreign Keys**:

- dutyId → duties.id (ON DELETE CASCADE)
- reportedById → members.id (ON DELETE RESTRICT)

```typescript
enum IncidentType {
  INJURY              // Physical harm
  ACCIDENT            // Unplanned event
  SECURITY_THREAT     // Safety risk
  PROPERTY_DAMAGE     // Asset loss
  HEALTH_EMERGENCY    // Medical crisis
  FIRE                // Fire incident
  NATURAL_DISASTER    // Natural calamity
  CIVIL_UNREST        // Social disturbance
  OTHER               // Miscellaneous
}

enum IncidentSeverity {
  LOW         // Minor impact
  MEDIUM      // Moderate impact
  HIGH        // Major impact
  CRITICAL    // Life-threatening
}

enum IncidentStatus {
  OPEN                    // Newly reported
  UNDER_INVESTIGATION     // Being reviewed
  RESOLVED                // Issue fixed
  CLOSED                  // Case closed
}
```

---

## Normalization

The schema adheres to all three normal forms:

### First Normal Form (1NF)

✅ All attributes are atomic (indivisible)  
✅ No repeating groups  
✅ Each column contains single values

Example: Member roles are stored as ENUM, not as comma-separated strings.

### Second Normal Form (2NF)

✅ Meets 1NF requirements  
✅ All non-key attributes fully depend on primary key  
✅ No partial dependencies

Example: Team description depends on Team ID, not on a composite key.

### Third Normal Form (3NF)

✅ Meets 2NF requirements  
✅ No transitive dependencies  
✅ Non-key attributes depend only on primary key

Example: Duty data doesn't include redundant team information; it references teamId.

---

## Relationships

### One-to-Many Relationships

#### Members → Teams (Leader)

```
One Member can lead many Teams
Many Teams have one Team Leader
Cardinality: 1:N
Constraint: ON DELETE RESTRICT (prevent orphaning)
```

#### Teams → Duties

```
One Team handles many Duties
Many Duties belong to one Team
Cardinality: 1:N
Constraint: ON DELETE CASCADE (remove duties if team deleted)
```

#### Members → Duties (Creator)

```
One Member creates many Duties
Many Duties are created by one Member
Cardinality: 1:N
Constraint: ON DELETE RESTRICT (maintain audit trail)
```

#### Duties → Incident Reports

```
One Duty has many Incident Reports
Many Reports reference one Duty
Cardinality: 1:N
Constraint: ON DELETE CASCADE (remove reports if duty deleted)
```

#### Members → Incident Reports (Reporter)

```
One Member files many Incident Reports
Many Reports are filed by one Member
Cardinality: 1:N
Constraint: ON DELETE RESTRICT (maintain audit trail)
```

### Many-to-Many Relationship

#### Members ↔ Teams (via TeamMembership)

```
Many Members belong to many Teams
Many Teams have many Members
Implementation: Junction Table (TEAM_MEMBERSHIP)
Unique Constraint: (teamId, memberId)
Cascade: Both sides on DELETE
```

---

## Data Constraints

### Primary Keys

- **Type**: CUID (Conflict-free Unique ID)
- **Advantage**: Safe for distributed systems, better than UUID for performance
- **Generation**: Automatic via Prisma

### Unique Constraints

- **Member.email**: Ensures unique email addresses
- **Member.phone**: Ensures unique phone numbers
- **Team.name**: Ensures unique team names
- **TeamMembership.teamId + memberId**: Prevents duplicate memberships

### Foreign Key Constraints

| Relationship                       | Delete Policy | Reason                  |
| ---------------------------------- | ------------- | ----------------------- |
| Team → Member (leader)             | RESTRICT      | Preserve team history   |
| Duty → Team                        | CASCADE       | Remove duties with team |
| Duty → Member (creator)            | RESTRICT      | Keep audit trail        |
| IncidentReport → Duty              | CASCADE       | Clean up reports        |
| IncidentReport → Member (reporter) | RESTRICT      | Maintain accountability |
| TeamMembership → Team              | CASCADE       | Auto-cleanup            |
| TeamMembership → Member            | CASCADE       | Auto-cleanup            |

### NOT NULL Constraints

Applied to critical fields:

- Member: email, name, phone, role
- Team: name, leaderId
- Duty: title, teamId, startDateTime, endDateTime, location, createdById
- IncidentReport: dutyId, reportedById, incidentType, severity, description, location

### Default Values

- `isActive`: true (members active by default)
- `createdAt`: now() (current timestamp)
- `updatedAt`: now() (auto-updated)
- `status`: PLANNED (duties), OPEN (incidents)
- `priority`: MEDIUM (duties)

---

## Indexes

### Single-Column Indexes

**Members Table**

- email (lookup by email)
- phone (lookup by phone)
- role (filter by role)
- isActive (active members filter)

**Teams Table**

- leaderId (find teams by leader)
- name (lookup by team name)

**TeamMemberships Table**

- teamId (find members in team)
- memberId (find teams for member)

**Duties Table**

- teamId (find duties for team)
- createdById (find duties by creator)
- status (filter by status)
- priority (filter by priority)
- startDateTime (time range queries)
- endDateTime (time range queries)

**IncidentReports Table**

- dutyId (find incidents for duty)
- reportedById (find reports by reporter)
- status (filter by status)
- severity (filter by severity)
- incidentType (filter by type)
- reportedAt (time range queries)

### Query Performance Impact

- **Foreign key indexes**: Enable fast JOINs
- **Status/Priority indexes**: Enable fast filtering
- **Timestamp indexes**: Enable fast range queries
- **Email/Phone indexes**: Enable fast lookups

---

## Sample Queries

### Query 1: Find all members of a team with their roles

```typescript
const teamWithMembers = await prisma.team.findUnique({
  where: { id: teamId },
  include: {
    members: {
      include: { member: true },
    },
    leader: true,
  },
});
```

### Query 2: Get all duties with HIGH or CRITICAL priority

```typescript
const importantDuties = await prisma.duty.findMany({
  where: {
    priority: { in: ["HIGH", "CRITICAL"] },
  },
  include: { team: true, createdBy: true },
});
```

### Query 3: Find incident reports by severity

```typescript
const criticalIncidents = await prisma.incidentReport.findMany({
  where: { severity: "CRITICAL" },
  include: {
    duty: true,
    reportedBy: true,
  },
});
```

### Query 4: Get team statistics

```typescript
const teamStats = await prisma.team.findMany({
  include: {
    _count: {
      select: { members: true, duties: true },
    },
  },
});
```

### Query 5: Find ongoing duties by team

```typescript
const ongoingDuties = await prisma.duty.findMany({
  where: {
    teamId: teamId,
    status: "ONGOING",
  },
  include: { incidentReports: true },
});
```

---

## Setup Instructions

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation Steps

#### 1. Configure Environment

```bash
# Create .env file in root directory
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/bhaad_suraksha_dal"' > .env
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Create Migration

```bash
npx prisma migrate dev --name init
```

#### 4. Seed Database

```bash
npx prisma db seed
```

#### 5. Verify Setup

```bash
npx ts-node prisma/verify.ts
```

#### 6. View Data

```bash
npx prisma studio
```

### Migration Commands

```bash
# Create new migration (development)
npx prisma migrate dev --name <migration-name>

# Create migration without running
npx prisma migrate dev --create-only

# Apply to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Check status
npx prisma migrate status
```

---

## Conclusion

The Bhaad Suraksha Dal database schema is:

✅ **Fully Normalized** - Follows 1NF, 2NF, 3NF principles  
✅ **Production-Ready** - Includes constraints, indexes, and error handling  
✅ **Scalable** - Uses distributed-safe IDs and efficient relationships  
✅ **Well-Documented** - Comprehensive schema documentation  
✅ **Verified** - Includes validation and verification scripts

The system is ready for deployment and supports the full lifecycle of emergency response operations.

---

**Document Version**: 1.0  
**Last Updated**: January 29, 2026  
**Status**: ✅ Production Ready
