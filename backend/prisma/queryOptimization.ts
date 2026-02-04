/**
 * Query Optimization & Performance Patterns
 * Bhaad Suraksha Dal - Query Optimization Examples
 *
 * This file demonstrates:
 * 1. N+1 Query Problem & Solutions
 * 2. Over-fetching with include vs. select
 * 3. Batch inserts with createMany
 * 4. Pagination with skip/take
 * 5. Efficient filtering with indexes
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

// Enable query logging for performance monitoring
prisma.$on("query", (e: any) => {
  console.log("\n[QUERY LOG]");
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});

// ============================================================================
// ANTI-PATTERN 1: N+1 Query Problem
// ============================================================================

/**
 * ❌ INEFFICIENT: N+1 Query Problem
 * Problem: 1 query to fetch members + N queries for each member's complaints
 * Total Queries: 1 + N (where N = number of members)
 *
 * Database Impact:
 * - 1,000 members = 1,001 queries
 * - High latency from round trips
 * - Connection pool exhaustion
 */
export async function getComplaintsPerMemberInefficient() {
  console.log("\n[PERFORMANCE] ❌ INEFFICIENT: N+1 Query Problem Example");

  // Query 1: Fetch all active members
  const members = await prisma.member.findMany({
    where: { isActive: true },
    take: 10, // Limit for demonstration
  });

  console.log(`Query 1: Fetched ${members.length} members`);

  // Query 2 to N: Fetch complaints for EACH member (N queries!)
  const results = [];
  for (const member of members) {
    const complaints = await prisma.complaint.findMany({
      where: { memberId: member.id },
    });
    results.push({
      memberId: member.id,
      name: member.name,
      complaintCount: complaints.length,
    });
    console.log(
      `Query ${results.length + 1}: Fetched complaints for ${member.id}`,
    );
  }

  return results;
  // Total Queries: 1 + members.length
}

/**
 * ✅ OPTIMIZED: Solution 1 - Using include with relations
 * Problem: Still fetches all complaint fields even if we only need count
 * Benefit: Reduced to 1 database call
 * Trade-off: Over-fetching if you don't need all fields
 */
export async function getComplaintsPerMemberOptimized1() {
  console.log("\n[PERFORMANCE] ✅ OPTIMIZED: include (1 query)");

  const members = await prisma.member.findMany({
    where: { isActive: true },
    take: 10,
    include: {
      complaintsFiled: {
        select: {
          id: true,
          title: true,
          status: true,
          filedAt: true,
        },
      },
    },
  });

  console.log("[METRIC] Total queries: 1 (JOIN operation)");
  return members;
  // Total Queries: 1 (with JOIN)
}

/**
 * ✅ OPTIMIZED: Solution 2 - Using select (more efficient)
 * Problem: None - only fetches needed data
 * Benefit: 1 query, no over-fetching
 * Trade-off: Must be explicit about what you need
 */
export async function getComplaintsPerMemberOptimized2() {
  console.log(
    "\n[PERFORMANCE] ✅ OPTIMIZED: select (1 query, no over-fetching)",
  );

  const members = await prisma.member.findMany({
    where: { isActive: true },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      complaintsFiled: {
        select: {
          id: true,
          title: true,
          status: true,
          filedAt: true,
        },
      },
    },
  });

  console.log("[METRIC] Total queries: 1 (SELECT with JOIN)");
  return members;
  // Total Queries: 1 (with JOIN, no over-fetching)
}

/**
 * ✅ OPTIMIZED: Solution 3 - Raw query with aggregation
 * Scenario: You only need the count, not all complaint details
 * Benefit: Single aggregation query
 * Use Case: Dashboards, summary statistics
 */
export async function getMemberComplaintCounts() {
  console.log("\n[PERFORMANCE] ✅ OPTIMIZED: Aggregation query (minimal data)");

  const results = await prisma.member.findMany({
    where: { isActive: true },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          complaintsFiled: true,
        },
      },
    },
  });

  console.log("[METRIC] Total queries: 1 (aggregation query)");
  return results;
  // Total Queries: 1 (with COUNT aggregation)
}

// ============================================================================
// PATTERN 2: Batch Inserts with createMany
// ============================================================================

/**
 * ❌ INEFFICIENT: Loop with individual creates
 * Problem: N separate INSERT queries
 * Database Impact:
 * - 1,000 records = 1,000 queries
 * - Slow, high latency
 * - Risk of partial failures
 */
export async function bulkCreateComplaintsInefficient(
  complaints: Array<{
    memberId: string;
    title: string;
    description: string;
    location: string;
  }>,
) {
  console.log("\n[PERFORMANCE] ❌ INEFFICIENT: Loop with individual creates");

  const results = [];
  for (const complaint of complaints) {
    const created = await prisma.complaint.create({
      data: {
        ...complaint,
        severity: "MEDIUM",
        status: "FILED",
      },
    });
    results.push(created);
    console.log(`Created complaint ${results.length}/${complaints.length}`);
  }

  console.log(`[METRIC] Total queries: ${complaints.length} (one per record)`);
  return results;
}

/**
 * ✅ OPTIMIZED: Batch insert with createMany
 * Benefit:
 * - Single INSERT ... VALUES (...), (...), (...) query
 * - Can insert thousands in one query
 * - Atomic operation
 * - Dramatically faster
 */
export async function bulkCreateComplaintsOptimized(
  complaints: Array<{
    memberId: string;
    title: string;
    description: string;
    location: string;
  }>,
) {
  console.log("\n[PERFORMANCE] ✅ OPTIMIZED: Batch insert with createMany");

  const result = await prisma.complaint.createMany({
    data: complaints.map((c) => ({
      ...c,
      severity: "MEDIUM",
      status: "FILED",
      filedAt: new Date(),
    })),
    skipDuplicates: true, // Ignore duplicates instead of error
  });

  console.log(`[METRIC] Total queries: 1 (batch INSERT)`);
  console.log(`[RESULT] Created ${result.count} records in single query`);
  return result;
}

// ============================================================================
// PATTERN 3: Pagination for Large Datasets
// ============================================================================

/**
 * Pagination prevents memory overload
 * Large datasets can crash application if fetched all at once
 * Use skip/take to load data in chunks
 */

/**
 * ❌ INEFFICIENT: Fetch all records
 * Problem: Loading 100,000 complaint records into memory
 * Memory Impact: Potential OutOfMemory error
 */
export async function getAllComplaintsInefficient() {
  console.log(
    "\n[PERFORMANCE] ❌ INEFFICIENT: Fetch all records without pagination",
  );

  try {
    const complaints = await prisma.complaint
      .findMany
      // No skip/take = ALL records fetched!
      ();

    console.log(`[METRIC] Fetched ${complaints.length} records`);
    console.log(`[WARNING] High memory usage potential with large datasets`);
    return complaints;
  } catch (error) {
    console.error("[ERROR] Likely OutOfMemory error with large datasets");
    throw error;
  }
}

/**
 * ✅ OPTIMIZED: Pagination with skip/take
 * Benefit:
 * - Load data in manageable chunks
 * - Enable pagination UI (previous/next)
 * - Reduced memory usage
 * - Better UX with "load more"
 */
export async function getPaginatedComplaints(
  pageNumber: number = 1,
  pageSize: number = 20,
) {
  console.log(
    `\n[PERFORMANCE] ✅ OPTIMIZED: Paginated query (page ${pageNumber})`,
  );

  const skip = (pageNumber - 1) * pageSize;

  // Query 1: Get paginated data
  const complaints = await prisma.complaint.findMany({
    where: { status: "FILED" },
    skip: skip,
    take: pageSize,
    orderBy: {
      filedAt: "desc",
    },
  });

  // Query 2: Get total count for pagination metadata
  const totalCount = await prisma.complaint.count({
    where: { status: "FILED" },
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  console.log(`[METRIC] Total queries: 2 (findMany + count)`);
  console.log(`[METRIC] Records returned: ${complaints.length}/${totalCount}`);
  console.log(`[METRIC] Page ${pageNumber} of ${totalPages}`);

  return {
    data: complaints,
    pagination: {
      currentPage: pageNumber,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
}

/**
 * ✅ OPTIMIZED: Cursor-based pagination (better for APIs)
 * Advantage: Works with dynamic data (new records added while paginating)
 * Use Case: Real-time feeds, social media, live dashboards
 */
export async function getCursorPaginatedComplaints(
  cursor?: string,
  pageSize: number = 20,
) {
  console.log("\n[PERFORMANCE] ✅ OPTIMIZED: Cursor-based pagination");

  const complaints = await prisma.complaint.findMany({
    where: { status: "FILED" },
    take: pageSize + 1, // +1 to check if more data exists
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { filedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      filedAt: true,
    },
  });

  const hasMore = complaints.length > pageSize;
  const data = complaints.slice(0, pageSize);
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  console.log(`[METRIC] Returned ${data.length} records`);
  console.log(`[METRIC] Has more pages: ${hasMore}`);

  return {
    data,
    pageInfo: {
      hasMore,
      nextCursor,
    },
  };
}

// ============================================================================
// PATTERN 4: Efficient Filtering with Indexes
// ============================================================================

/**
 * Database indexes are crucial for query performance
 * Without indexes: Full table scans (O(n) complexity)
 * With indexes: Seek operations (O(log n) complexity)
 *
 * This example shows why indexes matter:
 */

/**
 * ❌ INEFFICIENT: Filtering on non-indexed field (without index)
 * Problem: Database must scan ALL complaint records
 * Table Scan: Slow for large datasets (1M+ records)
 */
export async function getHighSeverityComplaintsWithoutIndex() {
  console.log("\n[PERFORMANCE] ❌ WITHOUT INDEX: Full table scan");
  console.log("[SQL] SELECT * FROM complaints WHERE severity = 'CRITICAL'");
  console.log("[METRIC] Scan Type: FULL TABLE SCAN");
  console.log("[METRIC] Time Complexity: O(n) - proportional to table size");
  console.log("[METRIC] With 1M records: ~1000ms");

  const complaints = await prisma.complaint.findMany({
    where: { severity: "CRITICAL" },
    select: {
      id: true,
      title: true,
      severity: true,
      filedAt: true,
    },
  });

  return complaints;
}

/**
 * ✅ OPTIMIZED: Filtering on indexed field (with index)
 * Benefit:
 * - Index seek instead of table scan
 * - O(log n) complexity
 * - Massive performance improvement for large datasets
 *
 * Schema has: @@index([severity])
 */
export async function getHighSeverityComplaintsWithIndex() {
  console.log("\n[PERFORMANCE] ✅ WITH INDEX: Index seek (much faster)");
  console.log("[SQL] SELECT * FROM complaints WHERE severity = 'CRITICAL'");
  console.log("[METRIC] Scan Type: INDEX SEEK");
  console.log("[METRIC] Time Complexity: O(log n) - logarithmic");
  console.log("[METRIC] With 1M records: ~1ms (1000x faster!)");

  const complaints = await prisma.complaint.findMany({
    where: { severity: "CRITICAL" },
    select: {
      id: true,
      title: true,
      severity: true,
      filedAt: true,
    },
  });

  return complaints;
}

/**
 * ✅ OPTIMIZED: Composite index for multiple filters
 * Scenario: Frequently querying by status AND filed date range
 * Index benefits: Speeds up filters on status, filedAt, and both combined
 */
export async function getRecentOpenComplaints() {
  console.log("\n[PERFORMANCE] ✅ COMPOSITE INDEX: Multiple filtered columns");
  console.log(
    "[SQL] SELECT * FROM complaints WHERE status = 'FILED' AND filedAt > ?",
  );
  console.log("[INDEX] @@index([status, filedAt])");
  console.log("[METRIC] Scan Type: INDEX SEEK + RANGE SCAN");

  const complaints = await prisma.complaint.findMany({
    where: {
      status: "FILED",
      filedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    orderBy: { filedAt: "desc" },
    take: 50,
  });

  return complaints;
}

// ============================================================================
// PATTERN 5: Complex Filtering & Search
// ============================================================================

/**
 * Build dynamic filters based on query parameters
 * Useful for dashboard filters, search, advanced filtering
 */
export async function searchComplaints(filters: {
  severity?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  memberId?: string;
  search?: string; // Title or description contains
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;

  console.log("\n[PERFORMANCE] ✅ DYNAMIC FILTERING");

  // Build where condition dynamically
  const where: any = {};

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.memberId) {
    where.memberId = filters.memberId;
  }

  if (filters.startDate || filters.endDate) {
    where.filedAt = {};
    if (filters.startDate) where.filedAt.gte = filters.startDate;
    if (filters.endDate) where.filedAt.lte = filters.endDate;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  console.log(`[METRIC] Applied filters: ${Object.keys(filters).length}`);

  // Fetch with pagination
  const [data, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        filedAt: true,
        member: {
          select: { name: true, email: true },
        },
      },
      orderBy: { filedAt: "desc" },
    }),
    prisma.complaint.count({ where }),
  ]);

  console.log(`[METRIC] Results: ${data.length}/${total} (page ${page})`);

  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    },
  };
}

// ============================================================================
// PERFORMANCE COMPARISON HELPERS
// ============================================================================

/**
 * Utility: Measure query performance
 * Usage: Wrap queries to get execution time
 */
export async function measureQueryPerformance<T>(
  label: string,
  queryFn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  console.log(`\n[BENCHMARK] ${label}`);

  const startTime = performance.now();
  const result = await queryFn();
  const durationMs = performance.now() - startTime;

  console.log(`[METRIC] Execution time: ${durationMs.toFixed(2)}ms`);

  return { result, durationMs };
}

/**
 * Example: Compare before/after performance
 */
export async function compareQueryPerformance() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║     QUERY PERFORMANCE COMPARISON (Before vs After)       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Inefficient version
  const inefficient = await measureQueryPerformance(
    "N+1 Query Problem (Inefficient)",
    () => getComplaintsPerMemberInefficient(),
  );

  // Optimized version
  const optimized = await measureQueryPerformance(
    "JOIN with include (Optimized)",
    () => getComplaintsPerMemberOptimized1(),
  );

  // Calculate improvement
  const improvement = (
    ((inefficient.durationMs - optimized.durationMs) / inefficient.durationMs) *
    100
  ).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("PERFORMANCE IMPROVEMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Inefficient Query: ${inefficient.durationMs.toFixed(2)}ms`);
  console.log(`Optimized Query:   ${optimized.durationMs.toFixed(2)}ms`);
  console.log(`Improvement:       ${improvement}% faster`);
  console.log("=".repeat(60));

  return {
    inefficient: inefficient.durationMs,
    optimized: optimized.durationMs,
    improvement,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default prisma;
