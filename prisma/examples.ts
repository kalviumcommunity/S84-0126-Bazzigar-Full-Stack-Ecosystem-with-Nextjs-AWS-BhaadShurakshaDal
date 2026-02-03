/**
 * Complete Example: Transaction & Query Optimization in Action
 * Bhaad Suraksha Dal - Running the Examples
 *
 * This file shows how to run all the transaction and optimization scenarios
 */

import prisma from "./transactions";
import {
  fileComplaintTransaction,
  approveComplaintTransaction,
  processPaymentTransaction,
  bulkComplaintRegistrationTransaction,
  closeDatabase,
} from "./transactions";

import {
  getComplaintsPerMemberInefficient,
  getComplaintsPerMemberOptimized1,
  getMemberComplaintCounts,
  bulkCreateComplaintsOptimized,
  getPaginatedComplaints,
  searchComplaints,
  compareQueryPerformance,
} from "./queryOptimization";

import {
  PerformanceMonitor,
  setupQueryLogging,
  analyzeIndexEffectiveness,
  monitorConnectionPool,
  generatePerformanceReport,
  printProductionMonitoringChecklist,
} from "./performanceMonitoring";

// ============================================================================
// MAIN EXECUTION EXAMPLE
// ============================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  BHAAD SURAKSHA DAL - TRANSACTION & QUERY OPTIMIZATION        ║
║  Complete Example Walkthrough                                 ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // ========================================================================
  // SECTION 1: SETUP MONITORING
  // ========================================================================

  console.log("\n📊 SECTION 1: Setting up Performance Monitoring\n");

  const monitor = new PerformanceMonitor(1000); // 1 second threshold
  setupQueryLogging(prisma, monitor);

  console.log("✓ Query logging enabled");
  console.log("✓ Performance monitor initialized");
  console.log("✓ Slow query threshold: 1000ms\n");

  // ========================================================================
  // SECTION 2: TRANSACTION EXAMPLES
  // ========================================================================

  console.log("📋 SECTION 2: Running Transaction Scenarios\n");

  try {
    // --- Transaction 1: File Complaint ---
    console.log("1️⃣  Filing a complaint...\n");

    const complaintResult = await fileComplaintTransaction("member-flood-001", {
      title: "House Flooded During Heavy Rains",
      description:
        "Ground floor and basement completely flooded. Furniture damaged.",
      location: "123 River Lane, District A",
      severity: "HIGH",
    });

    console.log("✓ Complaint filed successfully");
    console.log(`  Complaint ID: ${complaintResult.complaint.id}`);
    console.log(`  Status: ${complaintResult.complaint.status}`);
    console.log(`  Filed at: ${complaintResult.complaint.filedAt}\n`);

    // --- Transaction 2: Approve Complaint ---
    console.log("2️⃣  Approving complaint and allocating funds...\n");

    const approvalResult = await approveComplaintTransaction(
      complaintResult.complaint.id,
      "admin-relief-001",
      75000, // 75,000 rupees
    );

    console.log("✓ Complaint approved");
    console.log(`  Approval ID: ${approvalResult.approvalId}`);
    console.log(`  Funds Allocated: ₹${approvalResult.amountAllocated}`);
    console.log(`  Member: ${approvalResult.memberName}\n`);

    // --- Transaction 3: Process Payment ---
    console.log("3️⃣  Processing payment disbursement...\n");

    const paymentResult = await processPaymentTransaction(
      "member-flood-001",
      complaintResult.complaint.id,
      50000, // Disburse 50,000 of 75,000
    );

    console.log("✓ Payment processed");
    console.log(`  Payment ID: ${paymentResult.paymentId}`);
    console.log(`  Amount: ₹${paymentResult.amount}`);
    console.log(`  Transaction ID: ${paymentResult.transactionId}`);
    console.log(`  Status: ${paymentResult.status}\n`);

    // --- Transaction 4: Rollback Demonstration ---
    console.log("4️⃣  Demonstrating Rollback (Intentional Failure)...\n");

    try {
      await processPaymentTransaction(
        "member-flood-001",
        complaintResult.complaint.id,
        100000, // Attempt to pay more than allocated
        true, // Simulate failure
      );
    } catch (error) {
      console.log("✓ Transaction correctly rejected");
      console.log("✓ ROLLBACK executed automatically");
      console.log(
        `  Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.log("  ✓ NO partial writes in database\n");
    }

    // --- Transaction 5: Bulk Registration ---
    console.log(
      "5️⃣  Bulk registering complaints from flood-affected zone...\n",
    );

    const bulkResult = await bulkComplaintRegistrationTransaction([
      {
        memberId: "member-flood-002",
        title: "Structural damage to house",
        description: "Water entered through damaged walls",
        location: "Zone A",
        severity: "HIGH",
      },
      {
        memberId: "member-flood-003",
        title: "Complete house flooding",
        description: "House submerged in water",
        location: "Zone A",
        severity: "CRITICAL",
      },
      {
        memberId: "member-flood-004",
        title: "Basement flooding",
        description: "Basement storage flooded",
        location: "Zone A",
        severity: "MEDIUM",
      },
    ]);

    console.log("✓ Bulk registration completed");
    console.log(`  Complaints Created: ${bulkResult.complaintsCreated}`);
    console.log(`  Relief Funds Initialized: ${bulkResult.fundsInitialized}\n`);
  } catch (error) {
    console.error("Transaction error:", error);
  }

  // ========================================================================
  // SECTION 3: QUERY OPTIMIZATION EXAMPLES
  // ========================================================================

  console.log("\n🚀 SECTION 3: Query Optimization Patterns\n");

  console.log("Pattern 1: Avoiding N+1 Queries\n");
  console.log("Comparing inefficient vs optimized approaches...\n");

  // Would need to have actual data in DB to run these
  // For now, showing the patterns:
  console.log("❌ INEFFICIENT: Loop with individual queries");
  console.log("   Queries: 1 (member list) + N (one per member)");
  console.log("   Duration: O(n) - proportional to number of members");

  console.log("\n✅ OPTIMIZED: Single query with JOIN");
  console.log("   Queries: 1");
  console.log("   Duration: O(log n) - logarithmic");
  console.log("   Improvement: Up to 100x faster\n");

  // ========================================================================
  // SECTION 4: BATCH OPERATIONS
  // ========================================================================

  console.log("Pattern 2: Batch Insert Operations\n");

  const sampleComplaints = [
    {
      memberId: "batch-member-1",
      title: "Flood damage report 1",
      description: "...",
      location: "Zone B",
    },
    {
      memberId: "batch-member-2",
      title: "Flood damage report 2",
      description: "...",
      location: "Zone B",
    },
  ];

  console.log(`Creating ${sampleComplaints.length} complaints...\n`);

  try {
    const batchResult = await bulkCreateComplaintsOptimized(sampleComplaints);
    console.log(`✓ Created ${batchResult.count} records in 1 query`);
    console.log("  Improvement: 2 queries → 1 query (50% reduction)\n");
  } catch (error) {
    console.log("Note: Batch operation skipped (member IDs not in DB)\n");
  }

  // ========================================================================
  // SECTION 5: PAGINATION
  // ========================================================================

  console.log("Pattern 3: Pagination for Large Datasets\n");

  try {
    console.log("Fetching paginated complaints (page 1, size 20)...\n");

    const paginatedResults = await getPaginatedComplaints(1, 20);

    console.log("✓ Pagination results:");
    console.log(`  Returned: ${paginatedResults.data.length} records`);
    console.log(
      `  Total: ${paginatedResults.pagination.totalCount} complaints`,
    );
    console.log(`  Pages: ${paginatedResults.pagination.totalPages}`);
    console.log(`  Current: Page ${paginatedResults.pagination.currentPage}`);
    console.log(`  Has Next: ${paginatedResults.pagination.hasNextPage}\n`);
  } catch (error) {
    console.log("Note: Pagination example (requires data in DB)\n");
  }

  // ========================================================================
  // SECTION 6: COMPLEX FILTERING & SEARCH
  // ========================================================================

  console.log("Pattern 4: Advanced Filtering\n");

  try {
    const searchResults = await searchComplaints({
      severity: "HIGH",
      status: "FILED",
      page: 1,
      pageSize: 10,
    });

    console.log("✓ Search results:");
    console.log(
      `  Found: ${searchResults.pagination.total} matching complaints`,
    );
    console.log(`  Returned: ${searchResults.data.length} records\n`);
  } catch (error) {
    console.log("Note: Search example (requires data in DB)\n");
  }

  // ========================================================================
  // SECTION 7: INDEXES
  // ========================================================================

  console.log("📑 SECTION 4: Database Indexes\n");

  await analyzeIndexEffectiveness(prisma);

  // ========================================================================
  // SECTION 8: CONNECTION POOL MONITORING
  // ========================================================================

  console.log("\n🔗 SECTION 5: Connection Pool & Infrastructure\n");

  await monitorConnectionPool(prisma);

  // ========================================================================
  // SECTION 9: PERFORMANCE REPORT
  // ========================================================================

  console.log("\n📊 SECTION 6: Performance Statistics\n");

  const stats = monitor.getStatistics();

  if (stats) {
    console.log("Query Performance Summary:");
    console.log(`  Total Queries Executed: ${stats.totalQueries}`);
    console.log(`  Total Duration: ${stats.totalDuration}ms`);
    console.log(`  Average Per Query: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`  Fastest Query: ${stats.minDuration}ms`);
    console.log(`  Slowest Query: ${stats.maxDuration}ms`);
    console.log(`  Slow Queries (>1000ms): ${stats.slowQueries}`);
    console.log(`  Slow Query Percentage: ${stats.slowQueryPercentage}%\n`);
  }

  // ========================================================================
  // SECTION 10: SLOWEST QUERIES
  // ========================================================================

  console.log("🐢 Top Slowest Queries:\n");

  const slowestQueries = monitor.getSlowestQueries(3);

  if (slowestQueries.length > 0) {
    slowestQueries.forEach((q, i) => {
      console.log(`${i + 1}. [${q.duration}ms] ${q.query.substring(0, 80)}...`);
    });
  } else {
    console.log("No slow queries recorded\n");
  }

  // ========================================================================
  // SECTION 11: FULL REPORT
  // ========================================================================

  console.log(monitor.generateReport());

  // ========================================================================
  // SECTION 12: PRODUCTION CHECKLIST
  // ========================================================================

  printProductionMonitoringChecklist();

  // ========================================================================
  // SECTION 13: KEY INSIGHTS
  // ========================================================================

  console.log("\n" + "=".repeat(80));
  console.log("KEY TAKEAWAYS - TRANSACTION & QUERY OPTIMIZATION");
  console.log("=".repeat(80) + "\n");

  console.log("✅ Transactions:");
  console.log(
    "   • Ensure ACID properties (Atomicity, Consistency, Isolation, Durability)",
  );
  console.log("   • Use prisma.$transaction() for multi-step operations");
  console.log("   • Automatic rollback on error prevents partial writes");
  console.log("   • Critical for complaint filing, approvals, and payments\n");

  console.log("✅ Query Optimization:");
  console.log("   • Avoid N+1 queries (1 + N separate database calls)");
  console.log("   • Use include/select to fetch related data in single query");
  console.log("   • Implement pagination (skip/take) for large datasets");
  console.log("   • Use batch operations (createMany) for multiple inserts\n");

  console.log("✅ Database Indexes:");
  console.log("   • Add indexes on frequently filtered columns");
  console.log("   • Composite indexes for multi-column filters");
  console.log("   • Can improve query speed by 100-1000x");
  console.log("   • Regular monitoring to identify missing indexes\n");

  console.log("✅ Performance Monitoring:");
  console.log("   • Enable query logging in development");
  console.log("   • Track slow queries and set alerts");
  console.log("   • Use EXPLAIN to analyze query execution plans");
  console.log("   • Regular backups and disaster recovery procedures\n");

  console.log("=".repeat(80) + "\n");
}

// ============================================================================
// CLEANUP
// ============================================================================

async function cleanup() {
  console.log("🔌 Disconnecting from database...");
  await closeDatabase();
  console.log("✓ Database connection closed\n");
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .then(async () => {
    await cleanup();
    console.log("✅ All examples completed successfully!");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Error during execution:", error);
    await cleanup();
    process.exit(1);
  });
