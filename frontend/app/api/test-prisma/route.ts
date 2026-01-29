/**
 * BHAAD SURAKSHA DAL - PRISMA ORM TEST QUERY
 * ============================================================================
 *
 * This file demonstrates how to verify the Prisma setup and test database
 * connectivity with the Bhaad Suraksha Dal schema.
 */

import { prisma } from "@/lib/prisma";

/**
 * Test database connection and schema
 */
async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing Prisma ORM Setup...\n");
    console.log("═".repeat(60));

    // ========================================================================
    // 1. CONNECTION TEST
    // ========================================================================
    console.log("\n✅ Attempting database connection...");
    const connectionTest = await prisma.$queryRaw`SELECT NOW() as server_time`;
    console.log("✅ Database connection successful!");
    console.log("   Server time:", connectionTest);

    // ========================================================================
    // 2. SCHEMA VALIDATION
    // ========================================================================
    console.log("\n✅ Validating schema tables...");

    const memberCount = await prisma.member.count();
    const teamCount = await prisma.team.count();
    const dutyCount = await prisma.duty.count();
    const incidentCount = await prisma.incidentReport.count();

    console.log(`   Members: ${memberCount} record(s)`);
    console.log(`   Teams: ${teamCount} record(s)`);
    console.log(`   Duties: ${dutyCount} record(s)`);
    console.log(`   Incidents: ${incidentCount} record(s)`);

    // ========================================================================
    // 3. SAMPLE QUERY
    // ========================================================================
    console.log("\n✅ Running sample query...");

    // Query: Get all active members with their team leadership
    const activeMembersWithTeams = await prisma.member.findMany({
      where: { isActive: true },
      include: {
        teamLeaderships: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      take: 5,
    });

    console.log(`   Found ${activeMembersWithTeams.length} active member(s):`);
    activeMembersWithTeams.forEach((member: any) => {
      console.log(`   - ${member.name} (${member.role})`);
      if (member.teamLeaderships.length > 0) {
        console.log(
          `     Leads: ${member.teamLeaderships.map((t: any) => t.name).join(", ")}`
        );
      }
    });

    // ========================================================================
    // 4. PRISMA CLIENT INFO
    // ========================================================================
    console.log("\n✅ Prisma Client Configuration:");
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `   Query logging: ${process.env.NODE_ENV !== "production" ? "Enabled" : "Disabled"}`
    );

    console.log("\n" + "═".repeat(60));
    console.log("✅ All Prisma ORM tests passed successfully!\n");

    return {
      status: "success",
      message: "Prisma ORM setup is working correctly",
      stats: {
        members: memberCount,
        teams: teamCount,
        duties: dutyCount,
        incidents: incidentCount,
      },
    };
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection();
}

export { testDatabaseConnection };
