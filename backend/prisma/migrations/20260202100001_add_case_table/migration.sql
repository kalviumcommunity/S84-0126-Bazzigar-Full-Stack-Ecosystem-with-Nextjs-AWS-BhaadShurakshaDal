-- CreateEnum for CaseStatus
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum for CasePriority
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create cases table
-- Cases represent formal issue tracking for incidents and emergency management
-- Each case is linked to a Member (the case owner/reporter) for accountability
-- CaseStatus and CasePriority are indexed for filtering queries
-- This demonstrates a one-to-many relationship: Member → Case
CREATE TABLE "cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "reportedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cases_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cases_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes on cases table for common query patterns
-- reportedById and assignedToId indexed for efficient lookups
-- status and priority indexed for filtering operations
-- reportedAt and resolvedAt indexed for date range queries
CREATE INDEX "cases_reportedById_idx" ON "cases"("reportedById");
CREATE INDEX "cases_assignedToId_idx" ON "cases"("assignedToId");
CREATE INDEX "cases_status_idx" ON "cases"("status");
CREATE INDEX "cases_priority_idx" ON "cases"("priority");
CREATE INDEX "cases_reportedAt_idx" ON "cases"("reportedAt");
CREATE INDEX "cases_resolvedAt_idx" ON "cases"("resolvedAt");
