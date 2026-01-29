/**
 * PRISMA QUERY UTILITIES - BHAAD SURAKSHA DAL
 * ============================================================================
 *
 * Reusable query functions for common database operations.
 * Import and use these functions in API routes, server actions, or components.
 */

import { prisma } from "@/lib/prisma";

// ============================================================================
// MEMBER QUERIES
// ============================================================================

/**
 * Get all active members by role
 */
export async function getMembersByRole(
  role: "ADMIN" | "COMMANDER" | "VOLUNTEER"
) {
  return prisma.member.findMany({
    where: { role, isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      dateOfJoining: true,
    },
    orderBy: { dateOfJoining: "asc" },
  });
}

/**
 * Get member with full relations
 */
export async function getMemberWithRelations(memberId: string) {
  return prisma.member.findUnique({
    where: { id: memberId },
    include: {
      teamLeaderships: {
        select: { id: true, name: true, description: true },
      },
      teamMemberships: {
        include: {
          team: { select: { id: true, name: true } },
        },
      },
      dutyAssignments: {
        select: { id: true, title: true, status: true },
        take: 5,
      },
      incidentReports: {
        select: { id: true, incidentType: true, severity: true, status: true },
        take: 5,
      },
    },
  });
}

/**
 * Search members by email or name
 */
export async function searchMembers(query: string, limit = 10) {
  return prisma.member.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    take: limit,
  });
}

// ============================================================================
// TEAM QUERIES
// ============================================================================

/**
 * Get team with full composition
 */
export async function getTeamDetails(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      leader: {
        select: { id: true, name: true, email: true, role: true },
      },
      members: {
        include: {
          member: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      duties: {
        select: { id: true, title: true, status: true, priority: true },
        orderBy: { startDateTime: "desc" },
        take: 10,
      },
    },
  });
}

/**
 * Get team statistics
 */
export async function getTeamStats(teamId: string) {
  const [team, memberCount, dutyStats, incidents] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.teamMembership.count({ where: { teamId } }),
    prisma.duty.groupBy({
      by: ["status"],
      where: { teamId },
      _count: { id: true },
    }) as any,
    prisma.incidentReport.count({
      where: { duty: { teamId } },
    }),
  ]);

  return {
    team,
    memberCount,
    duties: Object.fromEntries(dutyStats.map((d) => [d.status, d._count.id])),
    totalIncidents: incidents,
  };
}

/**
 * Get all teams with member count
 */
export async function getAllTeams(limit = 50) {
  return prisma.team.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      leader: { select: { name: true, email: true } },
      _count: { select: { members: true, duties: true } },
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

// ============================================================================
// DUTY QUERIES
// ============================================================================

/**
 * Get ongoing duties
 */
export async function getOngoingDuties() {
  return prisma.duty.findMany({
    where: { status: "ONGOING" },
    include: {
      team: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { startDateTime: "asc" },
  });
}

/**
 * Get upcoming duties
 */
export async function getUpcomingDuties(days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.duty.findMany({
    where: {
      status: "PLANNED",
      startDateTime: { gte: now, lte: future },
    },
    include: {
      team: { select: { name: true } },
    },
    orderBy: { startDateTime: "asc" },
  });
}

/**
 * Get critical priority duties
 */
export async function getCriticalDuties() {
  return prisma.duty.findMany({
    where: { priority: "CRITICAL" },
    include: {
      team: { select: { name: true, leader: { select: { name: true } } } },
      incidentReports: true,
    },
    orderBy: { startDateTime: "asc" },
  });
}

/**
 * Get duty with incident reports
 */
export async function getDutyWithIncidents(dutyId: string) {
  return prisma.duty.findUnique({
    where: { id: dutyId },
    include: {
      team: true,
      createdBy: { select: { name: true, email: true } },
      incidentReports: {
        include: {
          reportedBy: { select: { name: true, email: true } },
        },
        orderBy: { reportedAt: "desc" },
      },
    },
  });
}

// ============================================================================
// INCIDENT QUERIES
// ============================================================================

/**
 * Get critical incidents
 */
export async function getCriticalIncidents() {
  return prisma.incidentReport.findMany({
    where: {
      severity: "CRITICAL",
      status: { in: ["OPEN", "UNDER_INVESTIGATION"] },
    },
    include: {
      duty: {
        select: { id: true, title: true, team: { select: { name: true } } },
      },
      reportedBy: { select: { name: true, email: true } },
    },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get incidents by date range
 */
export async function getIncidentsByDateRange(from: Date, to: Date) {
  return prisma.incidentReport.findMany({
    where: {
      reportedAt: { gte: from, lte: to },
    },
    include: {
      duty: { select: { title: true } },
      reportedBy: { select: { name: true } },
    },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get incident statistics
 */
export async function getIncidentStats() {
  const [byType, bySeverity, byStatus] = await Promise.all([
    prisma.incidentReport.groupBy({
      by: ["incidentType"],
      _count: { id: true },
    }),
    prisma.incidentReport.groupBy({
      by: ["severity"],
      _count: { id: true },
    }),
    prisma.incidentReport.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  return {
    byType: Object.fromEntries(
      byType.map((t: any) => [t.incidentType, t._count.id])
    ),
    bySeverity: Object.fromEntries(
      bySeverity.map((s: any) => [s.severity, s._count.id])
    ),
    byStatus: Object.fromEntries(
      byStatus.map((s: any) => [s.status, s._count.id])
    ),
  };
}

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Create new duty and assign to team
 */
export async function createDutyForTeam(data: {
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
    include: { team: true, createdBy: { select: { name: true } } },
  });
}

/**
 * Report incident during duty
 */
export async function reportIncident(data: {
  dutyId: string;
  reportedByEmail: string;
  incidentType: string; // IncidentType enum
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
      incidentType: data.incidentType,
      severity: data.severity,
      description: data.description,
      location: data.location,
      status: "OPEN",
    },
    include: {
      duty: { select: { title: true } },
      reportedBy: { select: { name: true } },
    },
  });
}

/**
 * Update duty status
 */
export async function updateDutyStatus(
  dutyId: string,
  status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED"
) {
  return prisma.duty.update({
    where: { id: dutyId },
    data: { status },
  });
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  incidentId: string,
  status: "OPEN" | "UNDER_INVESTIGATION" | "RESOLVED" | "CLOSED"
) {
  return prisma.incidentReport.update({
    where: { id: incidentId },
    data: { status },
  });
}

/**
 * Add member to team
 */
export async function addMemberToTeam(teamId: string, memberId: string) {
  return prisma.teamMembership.create({
    data: {
      teamId,
      memberId,
    },
  });
}

/**
 * Remove member from team
 */
export async function removeMemberFromTeam(teamId: string, memberId: string) {
  return prisma.teamMembership.delete({
    where: {
      teamId_memberId: { teamId, memberId },
    },
  });
}

/**
 * Deactivate member (soft delete)
 */
export async function deactivateMember(memberId: string) {
  return prisma.member.update({
    where: { id: memberId },
    data: { isActive: false },
  });
}

// ============================================================================
// TRANSACTION EXAMPLES
// ============================================================================

/**
 * Complete duty and resolve all incidents
 */
export async function completeDutyWithIncidents(dutyId: string) {
  return prisma.$transaction(async (tx) => {
    // Update duty status
    const duty = await tx.duty.update({
      where: { id: dutyId },
      data: { status: "COMPLETED" },
    });

    // Resolve all open incidents
    const incidents = await tx.incidentReport.updateMany({
      where: {
        dutyId,
        status: { in: ["OPEN", "UNDER_INVESTIGATION"] },
      },
      data: { status: "RESOLVED" },
    });

    return {
      duty,
      updatedIncidents: incidents.count,
    };
  });
}

/**
 * Create team with initial members
 */
export async function createTeamWithMembers(
  teamData: { name: string; description?: string; leaderId: string },
  memberIds: string[]
) {
  return prisma.$transaction(async (tx) => {
    // Create team
    const team = await tx.team.create({
      data: teamData,
    });

    // Add members
    await tx.teamMembership.createMany({
      data: memberIds.map((memberId) => ({
        teamId: team.id,
        memberId,
      })),
    });

    return team;
  });
}
