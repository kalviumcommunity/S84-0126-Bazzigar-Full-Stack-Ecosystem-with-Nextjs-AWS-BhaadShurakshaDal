-- CreateEnum for MemberRole
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'COMMANDER', 'VOLUNTEER');

-- CreateEnum for DutyStatus
CREATE TYPE "DutyStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum for DutyPriority
CREATE TYPE "DutyPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum for IncidentType
CREATE TYPE "IncidentType" AS ENUM ('INJURY', 'ACCIDENT', 'SECURITY_THREAT', 'PROPERTY_DAMAGE', 'HEALTH_EMERGENCY', 'FIRE', 'NATURAL_DISASTER', 'CIVIL_UNREST', 'OTHER');

-- CreateEnum for IncidentSeverity
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum for IncidentStatus
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED');

-- Create members table
-- This is the foundation of the system: all users and personnel are Members
-- Email and phone are enforced as unique to prevent duplicate accounts
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "phone" TEXT NOT NULL UNIQUE,
    "role" "MemberRole" NOT NULL,
    "dateOfJoining" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes on members table for common query patterns
CREATE INDEX "members_email_idx" ON "members"("email");
CREATE INDEX "members_phone_idx" ON "members"("phone");
CREATE INDEX "members_role_idx" ON "members"("role");
CREATE INDEX "members_isActive_idx" ON "members"("isActive");

-- Create teams table
-- Teams are organizational units that can be led by Members
-- Team names must be unique within the system
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on teams table
CREATE INDEX "teams_leaderId_idx" ON "teams"("leaderId");
CREATE INDEX "teams_name_idx" ON "teams"("name");

-- Create team_memberships junction table
-- This implements the many-to-many relationship between Teams and Members
-- Each membership is unique (a member can only be on a team once)
CREATE TABLE "team_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "team_memberships_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_memberships_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("teamId", "memberId")
);

-- Create indexes on team_memberships table
CREATE INDEX "team_memberships_teamId_idx" ON "team_memberships"("teamId");
CREATE INDEX "team_memberships_memberId_idx" ON "team_memberships"("memberId");

-- Create duties table
-- Duties are tasks/assignments allocated to teams
-- Status and priority are indexed for filtering common queries
CREATE TABLE "duties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "teamId" TEXT NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "status" "DutyStatus" NOT NULL DEFAULT 'PLANNED',
    "location" VARCHAR(255) NOT NULL,
    "priority" "DutyPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "duties_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "duties_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on duties table
CREATE INDEX "duties_teamId_idx" ON "duties"("teamId");
CREATE INDEX "duties_createdById_idx" ON "duties"("createdById");
CREATE INDEX "duties_status_idx" ON "duties"("status");
CREATE INDEX "duties_priority_idx" ON "duties"("priority");
CREATE INDEX "duties_startDateTime_idx" ON "duties"("startDateTime");
CREATE INDEX "duties_endDateTime_idx" ON "duties"("endDateTime");

-- Create incident_reports table
-- Incident reports track emergencies and incidents reported during duties
-- Status and severity are indexed for filtering and analytics queries
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dutyId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "incidentType" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "incident_reports_dutyId_fkey" FOREIGN KEY ("dutyId") REFERENCES "duties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "incident_reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes on incident_reports table
CREATE INDEX "incident_reports_dutyId_idx" ON "incident_reports"("dutyId");
CREATE INDEX "incident_reports_reportedById_idx" ON "incident_reports"("reportedById");
CREATE INDEX "incident_reports_status_idx" ON "incident_reports"("status");
CREATE INDEX "incident_reports_severity_idx" ON "incident_reports"("severity");
CREATE INDEX "incident_reports_incidentType_idx" ON "incident_reports"("incidentType");
CREATE INDEX "incident_reports_reportedAt_idx" ON "incident_reports"("reportedAt");

-- Create Prisma migrations tracking table
-- This is automatically created by Prisma to track applied migrations
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP NULL,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP NULL,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
