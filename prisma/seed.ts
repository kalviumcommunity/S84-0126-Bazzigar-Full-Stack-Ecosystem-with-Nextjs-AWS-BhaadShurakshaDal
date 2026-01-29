import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Bhaad Suraksha Dal database seed...");

  // Clear existing data
  await prisma.incidentReport.deleteMany();
  await prisma.duty.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.member.deleteMany();
  console.log("✨ Cleared existing data");

  // ============================================================================
  // CREATE MEMBERS
  // ============================================================================
  const admin = await prisma.member.create({
    data: {
      email: "admin@bhaadsuraksha.com",
      name: "Rajesh Kumar",
      phone: "+919876543210",
      role: "ADMIN",
      dateOfJoining: new Date("2024-01-01"),
      isActive: true,
    },
  });
  console.log("✓ Created ADMIN member:", admin.name);

  const commander1 = await prisma.member.create({
    data: {
      email: "commander1@bhaadsuraksha.com",
      name: "Priya Singh",
      phone: "+919876543211",
      role: "COMMANDER",
      dateOfJoining: new Date("2024-02-01"),
      isActive: true,
    },
  });
  console.log("✓ Created COMMANDER member:", commander1.name);

  const commander2 = await prisma.member.create({
    data: {
      email: "commander2@bhaadsuraksha.com",
      name: "Vikram Patel",
      phone: "+919876543212",
      role: "COMMANDER",
      dateOfJoining: new Date("2024-02-15"),
      isActive: true,
    },
  });
  console.log("✓ Created COMMANDER member:", commander2.name);

  const volunteers = await Promise.all([
    prisma.member.create({
      data: {
        email: "volunteer1@bhaadsuraksha.com",
        name: "Amit Sharma",
        phone: "+919876543213",
        role: "VOLUNTEER",
        dateOfJoining: new Date("2024-03-01"),
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        email: "volunteer2@bhaadsuraksha.com",
        name: "Neha Verma",
        phone: "+919876543214",
        role: "VOLUNTEER",
        dateOfJoining: new Date("2024-03-05"),
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        email: "volunteer3@bhaadsuraksha.com",
        name: "Rohan Desai",
        phone: "+919876543215",
        role: "VOLUNTEER",
        dateOfJoining: new Date("2024-03-10"),
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        email: "volunteer4@bhaadsuraksha.com",
        name: "Anjali Gupta",
        phone: "+919876543216",
        role: "VOLUNTEER",
        dateOfJoining: new Date("2024-03-15"),
        isActive: true,
      },
    }),
    prisma.member.create({
      data: {
        email: "volunteer5@bhaadsuraksha.com",
        name: "Sanjay Kumar",
        phone: "+919876543217",
        role: "VOLUNTEER",
        dateOfJoining: new Date("2024-03-20"),
        isActive: true,
      },
    }),
  ]);
  console.log("✓ Created 5 VOLUNTEER members");

  // ============================================================================
  // CREATE TEAMS
  // ============================================================================
  const team1 = await prisma.team.create({
    data: {
      name: "North District Rapid Response",
      description: "Rapid response team covering North district areas",
      leaderId: commander1.id,
    },
  });
  console.log("✓ Created team:", team1.name);

  const team2 = await prisma.team.create({
    data: {
      name: "South District Relief Squad",
      description: "Relief and rescue operations for South district",
      leaderId: commander2.id,
    },
  });
  console.log("✓ Created team:", team2.name);

  // ============================================================================
  // CREATE TEAM MEMBERSHIPS
  // ============================================================================
  await prisma.teamMembership.createMany({
    data: [
      {
        teamId: team1.id,
        memberId: commander1.id,
        joinedAt: new Date("2024-02-01"),
      },
      {
        teamId: team1.id,
        memberId: volunteers[0].id,
        joinedAt: new Date("2024-03-01"),
      },
      {
        teamId: team1.id,
        memberId: volunteers[1].id,
        joinedAt: new Date("2024-03-05"),
      },
      {
        teamId: team1.id,
        memberId: volunteers[2].id,
        joinedAt: new Date("2024-03-10"),
      },
      {
        teamId: team2.id,
        memberId: commander2.id,
        joinedAt: new Date("2024-02-15"),
      },
      {
        teamId: team2.id,
        memberId: volunteers[3].id,
        joinedAt: new Date("2024-03-15"),
      },
      {
        teamId: team2.id,
        memberId: volunteers[4].id,
        joinedAt: new Date("2024-03-20"),
      },
    ],
  });
  console.log("✓ Created team memberships");

  // ============================================================================
  // CREATE DUTIES
  // ============================================================================
  const now = new Date();
  const duty1 = await prisma.duty.create({
    data: {
      title: "Flood Relief Distribution",
      description: "Distribute relief materials in flood-affected areas",
      teamId: team1.id,
      startDateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endDateTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
      status: "PLANNED",
      location: "North District - Residential Zone",
      priority: "CRITICAL",
      createdById: admin.id,
    },
  });
  console.log("✓ Created duty:", duty1.title);

  const duty2 = await prisma.duty.create({
    data: {
      title: "Community Shelter Setup",
      description: "Set up temporary shelter for displaced persons",
      teamId: team2.id,
      startDateTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      endDateTime: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
      status: "ONGOING",
      location: "South District - Community Center",
      priority: "HIGH",
      createdById: commander2.id,
    },
  });
  console.log("✓ Created duty:", duty2.title);

  const duty3 = await prisma.duty.create({
    data: {
      title: "Medical Assistance Camp",
      description: "Medical aid and health checkups",
      teamId: team1.id,
      startDateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      endDateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: "COMPLETED",
      location: "North District - Health Center",
      priority: "HIGH",
      createdById: commander1.id,
    },
  });
  console.log("✓ Created duty:", duty3.title);

  // ============================================================================
  // CREATE INCIDENT REPORTS
  // ============================================================================
  const incident1 = await prisma.incidentReport.create({
    data: {
      dutyId: duty3.id,
      reportedById: volunteers[0].id,
      incidentType: "INJURY",
      severity: "MEDIUM",
      description: "Minor cut sustained by volunteer during material handling",
      location: "North District - Health Center",
      reportedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: "RESOLVED",
    },
  });
  console.log("✓ Created incident report: INJURY");

  const incident2 = await prisma.incidentReport.create({
    data: {
      dutyId: duty2.id,
      reportedById: volunteers[3].id,
      incidentType: "HEALTH_EMERGENCY",
      severity: "HIGH",
      description: "Affected person experiencing breathing difficulty",
      location: "South District - Community Center",
      reportedAt: new Date(),
      status: "UNDER_INVESTIGATION",
    },
  });
  console.log("✓ Created incident report: HEALTH_EMERGENCY");

  const incident3 = await prisma.incidentReport.create({
    data: {
      dutyId: duty1.id,
      reportedById: commander1.id,
      incidentType: "PROPERTY_DAMAGE",
      severity: "MEDIUM",
      description: "Equipment damage during transport",
      location: "North District - Residential Zone",
      reportedAt: new Date(now.getTime() - 30 * 60 * 1000),
      status: "OPEN",
    },
  });
  console.log("✓ Created incident report: PROPERTY_DAMAGE");

  // ============================================================================
  // PRINT SUMMARY STATISTICS
  // ============================================================================
  console.log("\n📊 Database Seed Summary:");
  console.log("─".repeat(50));
  const memberCount = await prisma.member.count();
  const teamCount = await prisma.team.count();
  const membershipCount = await prisma.teamMembership.count();
  const dutyCount = await prisma.duty.count();
  const incidentCount = await prisma.incidentReport.count();

  console.log(`Total Members: ${memberCount}`);
  console.log(`  - ADMINs: 1`);
  console.log(`  - COMMANDERs: 2`);
  console.log(`  - VOLUNTEERs: 5`);
  console.log(`Total Teams: ${teamCount}`);
  console.log(`Team Memberships: ${membershipCount}`);
  console.log(`Total Duties: ${dutyCount}`);
  console.log(`Incident Reports: ${incidentCount}`);
  console.log("─".repeat(50));
  console.log("\n✅ Database seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: any) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
