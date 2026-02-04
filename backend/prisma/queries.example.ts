// ============================================================================
// BHAAD SURAKSHA DAL - DATABASE SCHEMA REFERENCE
// ============================================================================
// This file contains TypeScript type definitions and example usage patterns
// for the Bhaad Suraksha Dal database schema.

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

/**
 * Member with all relations
 */
type MemberWithRelations = Prisma.MemberGetPayload<{
  include: {
    teamLeaderships: true;
    teamMemberships: { include: { team: true } };
    dutyAssignments: true;
    incidentReports: true;
  };
}>;

/**
 * Team with all relations
 */
type TeamWithRelations = Prisma.TeamGetPayload<{
  include: {
    leader: true;
    members: { include: { member: true } };
    duties: { include: { incidentReports: true } };
  };
}>;

/**
 * Duty with all relations
 */
type DutyWithRelations = Prisma.DutyGetPayload<{
  include: {
    team: { include: { leader: true } };
    createdBy: true;
    incidentReports: { include: { reportedBy: true } };
  };
}>;

/**
 * Incident Report with all relations
 */
type IncidentWithRelations = Prisma.IncidentReportGetPayload<{
  include: {
    duty: { include: { team: true } };
    reportedBy: true;
  };
}>;

// ============================================================================
// EXAMPLE QUERIES & USE CASES
// ============================================================================

/**
 * USE CASE 1: Register a new member
 */
async function createNewMember(data: {
  email: string;
  name: string;
  phone: string;
  role: "ADMIN" | "COMMANDER" | "VOLUNTEER";
}) {
  return prisma.member.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      dateOfJoining: new Date(),
      isActive: true,
    },
  });
}

/**
 * USE CASE 2: Create a new team with a leader
 */
async function createTeam(data: {
  name: string;
  description?: string;
  leaderEmail: string;
}) {
  // Find the leader
  const leader = await prisma.member.findUniqueOrThrow({
    where: { email: data.leaderEmail },
  });

  return prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      leaderId: leader.id,
    },
    include: { leader: true },
  });
}

/**
 * USE CASE 3: Add members to a team
 */
async function addMembersToTeam(teamId: string, memberEmails: string[]) {
  const members = await prisma.member.findMany({
    where: { email: { in: memberEmails } },
    select: { id: true },
  });

  return prisma.teamMembership.createMany({
    data: members.map((member: any) => ({
      teamId,
      memberId: member.id,
      joinedAt: new Date(),
    })),
    skipDuplicates: true,
  });
}

/**
 * USE CASE 4: Create a duty and assign to team
 */
async function createDuty(data: {
  title: string;
  description?: string;
  teamId: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdByEmail: string;
}) {
  const creator = await prisma.member.findUniqueOrThrow({
    where: { email: data.createdByEmail },
  });

  return prisma.duty.create({
    data: {
      title: data.title,
      description: data.description,
      teamId: data.teamId,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      location: data.location,
      priority: data.priority,
      status: "PLANNED",
      createdById: creator.id,
    },
    include: {
      team: true,
      createdBy: true,
    },
  });
}

/**
 * USE CASE 5: Report an incident
 */
async function reportIncident(data: {
  dutyId: string;
  reportedByEmail: string;
  incidentType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  location: string;
}) {
  const reporter = await prisma.member.findUniqueOrThrow({
    where: { email: data.reportedByEmail },
  });

  return prisma.incidentReport.create({
    data: {
      dutyId: data.dutyId,
      reportedById: reporter.id,
      incidentType: data.incidentType as any,
      severity: data.severity,
      description: data.description,
      location: data.location,
      reportedAt: new Date(),
      status: "OPEN",
    },
    include: {
      duty: true,
      reportedBy: true,
    },
  });
}

// ============================================================================
// SEARCH & FILTER QUERIES
// ============================================================================

/**
 * Query 1: Find all members of a specific role
 */
async function getMembersByRole(role: "ADMIN" | "COMMANDER" | "VOLUNTEER") {
  return prisma.member.findMany({
    where: { role, isActive: true },
    orderBy: { dateOfJoining: "asc" },
  });
}

/**
 * Query 2: Get team with all member details
 */
async function getTeamDetails(teamId: string) {
  return prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      leader: true,
      members: {
        include: { member: true },
        orderBy: { joinedAt: "asc" },
      },
      duties: {
        include: { incidentReports: true },
        orderBy: { startDateTime: "desc" },
      },
    },
  });
}

/**
 * Query 3: Get all ongoing duties
 */
async function getOngoingDuties() {
  return prisma.duty.findMany({
    where: { status: "ONGOING" },
    include: {
      team: true,
      createdBy: true,
      incidentReports: true,
    },
    orderBy: { startDateTime: "asc" },
  });
}

/**
 * Query 4: Get critical incidents
 */
async function getCriticalIncidents() {
  return prisma.incidentReport.findMany({
    where: {
      severity: "CRITICAL",
      status: { in: ["OPEN", "UNDER_INVESTIGATION"] },
    },
    include: {
      duty: { include: { team: true } },
      reportedBy: true,
    },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Query 5: Get incidents by date range
 */
async function getIncidentsByDateRange(from: Date, to: Date) {
  return prisma.incidentReport.findMany({
    where: {
      reportedAt: { gte: from, lte: to },
    },
    include: {
      duty: true,
      reportedBy: true,
    },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Query 6: Get team statistics
 */
async function getTeamStats(teamId: string) {
  const [team, duties, members, incidents] = await Promise.all([
    prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
    prisma.duty.findMany({ where: { teamId } }),
    prisma.teamMembership.count({ where: { teamId } }),
    prisma.incidentReport.findMany({
      where: { duty: { teamId } },
    }),
  ]);

  return {
    teamName: team.name,
    memberCount: members,
    totalDuties: duties.length,
    completedDuties: duties.filter((d: any) => d.status === "COMPLETED").length,
    ongoingDuties: duties.filter((d: any) => d.status === "ONGOING").length,
    totalIncidents: incidents.length,
    criticalIncidents: incidents.filter((i: any) => i.severity === "CRITICAL")
      .length,
  };
}

/**
 * Query 7: Get member activity
 */
async function getMemberActivity(memberId: string) {
  const [teams, dutiesCreated, reportsFile] = await Promise.all([
    prisma.teamMembership.findMany({
      where: { memberId },
      include: { team: true },
    }),
    prisma.duty.findMany({
      where: { createdById: memberId },
    }),
    prisma.incidentReport.findMany({
      where: { reportedById: memberId },
    }),
  ]);

  return {
    teamsParticipating: teams.length,
    dutiesCreated: dutiesCreated.length,
    incidentsReported: reportsFile.length,
    teams: teams.map((t) => t.team.name),
  };
}

// ============================================================================
// UPDATE & MODIFICATION QUERIES
// ============================================================================

/**
 * Update duty status
 */
async function updateDutyStatus(
  dutyId: string,
  status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED",
) {
  return prisma.duty.update({
    where: { id: dutyId },
    data: { status },
  });
}

/**
 * Update incident status
 */
async function updateIncidentStatus(
  incidentId: string,
  status: "OPEN" | "UNDER_INVESTIGATION" | "RESOLVED" | "CLOSED",
) {
  return prisma.incidentReport.update({
    where: { id: incidentId },
    data: { status },
  });
}

/**
 * Deactivate a member
 */
async function deactivateMember(memberId: string) {
  return prisma.member.update({
    where: { id: memberId },
    data: { isActive: false },
  });
}

/**
 * Remove member from team
 */
async function removeMemberFromTeam(teamId: string, memberId: string) {
  return prisma.teamMembership.delete({
    where: {
      teamId_memberId: { teamId, memberId },
    },
  });
}

// ============================================================================
// AGGREGATION & ANALYTICS
// ============================================================================

/**
 * Get duty statistics
 */
async function getDutyStatistics() {
  return prisma.duty.groupBy({
    by: ["status", "priority"],
    _count: { id: true },
  });
}

/**
 * Get incident statistics by type
 */
async function getIncidentStatistics() {
  return prisma.incidentReport.groupBy({
    by: ["incidentType", "severity"],
    _count: { id: true },
  });
}

/**
 * Get most active teams
 */
async function getMostActivTeams() {
  const teams = await prisma.team.findMany({
    include: {
      _count: {
        select: {
          members: true,
          duties: true,
        },
      },
    },
  });

  return teams
    .map((team: any) => ({
      name: team.name,
      members: team._count.members,
      duties: team._count.duties,
    }))
    .sort((a: any, b: any) => b.duties - a.duties);
}

// ============================================================================
// TRANSACTION EXAMPLES
// ============================================================================

/**
 * Create team with initial members in a transaction
 */
async function createTeamWithMembers(
  teamName: string,
  leaderEmail: string,
  memberEmails: string[],
) {
  return prisma.$transaction(async (tx: any) => {
    // Create team
    const team = await tx.team.create({
      data: {
        name: teamName,
        leader: { connect: { email: leaderEmail } },
      },
    });

    // Add members
    const members = await tx.member.findMany({
      where: { email: { in: memberEmails } },
      select: { id: true },
    });

    await tx.teamMembership.createMany({
      data: members.map((member: any) => ({
        teamId: team.id,
        memberId: member.id,
        joinedAt: new Date(),
      })),
    });

    return team;
  });
}

/**
 * Complete duty and archive incidents
 */
async function completeDutyWithIncidents(dutyId: string) {
  return prisma.$transaction(async (tx: any) => {
    // Update duty status
    const duty = await tx.duty.update({
      where: { id: dutyId },
      data: { status: "COMPLETED" },
    });

    // Close all open incidents
    const incidents = await tx.incidentReport.updateMany({
      where: {
        dutyId,
        status: { in: ["OPEN", "UNDER_INVESTIGATION"] },
      },
      data: { status: "RESOLVED" },
    });

    return { duty, updatedIncidents: incidents.count };
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  createNewMember,
  createTeam,
  addMembersToTeam,
  createDuty,
  reportIncident,
  getMembersByRole,
  getTeamDetails,
  getOngoingDuties,
  getCriticalIncidents,
  getIncidentsByDateRange,
  getTeamStats,
  getMemberActivity,
  updateDutyStatus,
  updateIncidentStatus,
  deactivateMember,
  removeMemberFromTeam,
  getDutyStatistics,
  getIncidentStatistics,
  getMostActivTeams,
  createTeamWithMembers,
  completeDutyWithIncidents,
};
