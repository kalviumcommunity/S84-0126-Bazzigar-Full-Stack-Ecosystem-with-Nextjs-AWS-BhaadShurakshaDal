/**
 * Database Seeding Script for Bhaad Suraksha Dal
 *
 * This script initializes the database with sample data using Prisma ORM.
 *
 * KEY FEATURES:
 * - Uses UPSERT operations for idempotency (safe to run multiple times)
 * - Prevents duplicate data by using unique identifiers
 * - Includes error handling and informative logging
 * - Properly manages Prisma Client lifecycle
 * - Suitable for development and staging environments
 *
 * IDEMPOTENCY:
 * All operations use upsert() instead of create() to ensure:
 * - Re-running the seed script doesn't create duplicates
 * - Data can be safely updated if needed
 * - Script is safe for CI/CD pipelines and automated testing
 *
 * USAGE:
 * Run via: npx prisma db seed
 * Or manually: npx ts-node prisma/seed.ts
 */

import {
  PrismaClient,
  MemberRole,
  CaseStatus,
  CasePriority,
} from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Main seeding function
 * Orchestrates the creation of all seed data in proper dependency order
 */
async function main() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Seed Members first (no dependencies)
    await seedMembers();

    // Seed Teams (depends on Members)
    await seedTeams();

    // Seed Team Memberships (depends on Members and Teams)
    await seedTeamMemberships();

    // Seed Duties (depends on Teams and Members)
    await seedDuties();

    // Seed Cases (depends on Members)
    await seedCases();

    console.log("\n✅ Database seeding completed successfully!");
    console.log(
      "📊 All sample data has been inserted or updated (idempotent).\n",
    );
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Seed sample members/users
 *
 * IDEMPOTENCY: Uses upsert with email as unique identifier
 * This ensures that if a member with the same email exists,
 * their data is updated rather than creating duplicates.
 */
async function seedMembers() {
  console.log("📝 Seeding Members...");

  const members = [
    {
      email: "admin@bhaadsuraksha.com",
      name: "Rajesh Kumar",
      phone: "+91-9876543210",
      role: MemberRole.ADMIN,
    },
    {
      email: "commander@bhaadsuraksha.com",
      name: "Priya Sharma",
      phone: "+91-9876543211",
      role: MemberRole.COMMANDER,
    },
    {
      email: "volunteer1@bhaadsuraksha.com",
      name: "Arjun Patel",
      phone: "+91-9876543212",
      role: MemberRole.VOLUNTEER,
    },
    {
      email: "volunteer2@bhaadsuraksha.com",
      name: "Neha Singh",
      phone: "+91-9876543213",
      role: MemberRole.VOLUNTEER,
    },
    {
      email: "coordinator@bhaadsuraksha.com",
      name: "Vikram Desai",
      phone: "+91-9876543214",
      role: MemberRole.COMMANDER,
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        phone: member.phone,
        role: member.role,
      },
      create: {
        email: member.email,
        name: member.name,
        phone: member.phone,
        role: member.role,
      },
    });
  }

  console.log(`   ✓ ${members.length} members seeded`);
}

/**
 * Seed sample teams
 *
 * IDEMPOTENCY: Uses upsert with team name as unique identifier
 * Each team must have a valid leader (Member) reference
 */
async function seedTeams() {
  console.log("🏢 Seeding Teams...");

  // First, fetch the admin member to use as default leader
  const adminMember = await prisma.member.findUnique({
    where: { email: "admin@bhaadsuraksha.com" },
  });

  if (!adminMember) {
    throw new Error("Admin member not found. Ensure members are seeded first.");
  }

  const teams = [
    {
      name: "Emergency Response Team",
      description: "Primary team for emergency response operations",
      leaderId: adminMember.id,
    },
    {
      name: "Disaster Management Unit",
      description: "Handles disaster preparedness and mitigation",
      leaderId: adminMember.id,
    },
    {
      name: "Community Outreach",
      description: "Focuses on community awareness and education",
      leaderId: adminMember.id,
    },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: {
        description: team.description,
        leaderId: team.leaderId,
      },
      create: team,
    });
  }

  console.log(`   ✓ ${teams.length} teams seeded`);
}

/**
 * Seed team memberships
 *
 * IDEMPOTENCY: Uses upsert with unique constraint (teamId, memberId)
 * Prevents duplicate team memberships
 */
async function seedTeamMemberships() {
  console.log("👥 Seeding Team Memberships...");

  // Fetch teams and members
  const teams = await prisma.team.findMany();
  const members = await prisma.member.findMany({
    where: { role: { in: [MemberRole.VOLUNTEER, MemberRole.COMMANDER] } },
  });

  if (teams.length === 0 || members.length === 0) {
    throw new Error("Teams and members must be seeded first.");
  }

  // Create memberships: assign volunteers and commanders to teams
  let membershipCount = 0;

  for (const team of teams) {
    for (const member of members) {
      await prisma.teamMembership.upsert({
        where: {
          teamId_memberId: {
            teamId: team.id,
            memberId: member.id,
          },
        },
        update: {},
        create: {
          teamId: team.id,
          memberId: member.id,
        },
      });
      membershipCount++;
    }
  }

  console.log(`   ✓ ${membershipCount} team memberships seeded`);
}

/**
 * Seed sample duties/assignments
 *
 * IDEMPOTENCY: Uses upsert with title + teamId as natural key
 * Each duty is assigned to a team and created by a member
 */
async function seedDuties() {
  console.log("📋 Seeding Duties...");

  // Fetch required data
  const teams = await prisma.team.findMany();
  const creator = await prisma.member.findUnique({
    where: { email: "admin@bhaadsuraksha.com" },
  });

  if (teams.length === 0 || !creator) {
    throw new Error("Teams and members must be seeded first.");
  }

  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const duties = [
    {
      title: "Morning Patrol",
      description: "Daily morning surveillance and patrol",
      teamId: teams[0].id,
      startDateTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
      endDateTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours from now
      location: "Zone A - Downtown",
      createdById: creator.id,
    },
    {
      title: "Emergency Preparedness Training",
      description: "Training session for emergency response",
      teamId: teams[1].id,
      startDateTime: futureDate,
      endDateTime: new Date(futureDate.getTime() + 3 * 60 * 60 * 1000),
      location: "Training Center",
      createdById: creator.id,
    },
    {
      title: "Community Education Session",
      description: "Public awareness session on disaster safety",
      teamId: teams[2].id,
      startDateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
      ),
      location: "Community Center",
      createdById: creator.id,
    },
  ];

  let dutyCount = 0;

  for (const duty of duties) {
    // Generate a stable ID for upsert based on title and team
    const dutyId = `${duty.teamId}-${duty.title.replace(/\s+/g, "-").toLowerCase()}`;

    await prisma.duty.upsert({
      where: { id: dutyId },
      update: {
        description: duty.description,
        location: duty.location,
      },
      create: {
        id: dutyId,
        ...duty,
      },
    });
    dutyCount++;
  }

  console.log(`   ✓ ${duties.length} duties seeded`);
}

/**
 * Seed sample cases
 *
 * IDEMPOTENCY: Uses upsert with a generated stable ID
 * Cases track formal issues and incident follow-ups
 */
async function seedCases() {
  console.log("📂 Seeding Cases...");

  // Fetch members for reporter and assignee
  const reporter = await prisma.member.findUnique({
    where: { email: "coordinator@bhaadsuraksha.com" },
  });

  const assignee = await prisma.member.findUnique({
    where: { email: "commander@bhaadsuraksha.com" },
  });

  if (!reporter || !assignee) {
    throw new Error("Reporter and assignee members must be seeded first.");
  }

  const cases = [
    {
      title: "Infrastructure Damage Report",
      description:
        "Assessment of damaged infrastructure in flood-affected zone",
      reportedById: reporter.id,
      assignedToId: assignee.id,
      status: CaseStatus.IN_PROGRESS,
      priority: CasePriority.HIGH,
    },
    {
      title: "Community Water Supply Issue",
      description: "Contaminated water supply affecting 500+ residents",
      reportedById: reporter.id,
      assignedToId: assignee.id,
      status: CaseStatus.UNDER_REVIEW,
      priority: CasePriority.URGENT,
    },
    {
      title: "Missing Persons Follow-up",
      description:
        "Investigation into reports of missing persons from evacuation zone",
      reportedById: reporter.id,
      assignedToId: null, // Unassigned case
      status: CaseStatus.OPEN,
      priority: CasePriority.URGENT,
    },
  ];

  for (const caseData of cases) {
    // Generate a stable ID for upsert based on title
    const caseId = `case-${caseData.title.replace(/\s+/g, "-").toLowerCase()}`;

    await prisma.case.upsert({
      where: { id: caseId },
      update: {
        description: caseData.description,
        status: caseData.status,
        priority: caseData.priority,
        assignedToId: caseData.assignedToId,
      },
      create: {
        id: caseId,
        ...caseData,
      },
    });
  }

  console.log(`   ✓ ${cases.length} cases seeded`);
}

// Execute the main seeding function
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: any) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
