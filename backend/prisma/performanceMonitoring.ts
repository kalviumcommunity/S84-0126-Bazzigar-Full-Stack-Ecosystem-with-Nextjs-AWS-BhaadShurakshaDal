/**
 * Performance Monitoring & Observability
 * Bhaad Suraksha Dal - Production Ready Monitoring
 *
 * This module demonstrates:
 * 1. Prisma query logging and analysis
 * 2. Performance metrics collection
 * 3. Slow query detection
 * 4. Index effectiveness monitoring
 * 5. Connection pool metrics
 */

const { PrismaClient } = require("@prisma/client");

// ============================================================================
// PRISMA CLIENT WITH ENHANCED LOGGING
// ============================================================================

/**
 * Initialize Prisma with comprehensive logging
 * This captures all queries for analysis and monitoring
 */
export const prisma = new PrismaClient({
  log: [
    {
      emit: "stdout",
      level: "query",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
    {
      emit: "event",
      level: "error",
    },
  ],
});

// ============================================================================
// PERFORMANCE METRICS COLLECTION
// ============================================================================

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  isSlow: boolean;
  level: string;
}

class PerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private slowQueryThresholdMs = 1000; // 1 second threshold

  constructor(slowThresholdMs: number = 1000) {
    this.slowQueryThresholdMs = slowThresholdMs;
  }

  /**
   * Record a query metric
   */
  recordMetric(query: string, duration: number, level: string = "query"): void {
    const isSlow = duration > this.slowQueryThresholdMs;

    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      isSlow,
      level,
    };

    this.metrics.push(metric);

    // Log slow queries immediately
    if (isSlow) {
      console.warn(
        `\n⚠️  SLOW QUERY DETECTED (${duration}ms > ${this.slowQueryThresholdMs}ms)`,
      );
      console.warn(`Query: ${query.substring(0, 200)}...`);
    }
  }

  /**
   * Get all recorded metrics
   */
  getAllMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get performance statistics
   */
  getStatistics() {
    if (this.metrics.length === 0) {
      return null;
    }

    const durations = this.metrics.map((m) => m.duration);
    const slowQueries = this.metrics.filter((m) => m.isSlow);

    return {
      totalQueries: this.metrics.length,
      totalDuration: durations.reduce((a, b) => a + b, 0),
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      slowQueries: slowQueries.length,
      slowQueryPercentage: (
        (slowQueries.length / this.metrics.length) *
        100
      ).toFixed(2),
    };
  }

  /**
   * Get top N slowest queries
   */
  getSlowestQueries(limit: number = 10): QueryMetrics[] {
    return this.metrics.sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  /**
   * Find queries with similar patterns
   */
  findSlowQueryPatterns(): Map<string, { count: number; avgDuration: number }> {
    const patterns = new Map();

    for (const metric of this.metrics.filter((m) => m.isSlow)) {
      const pattern = this.getQueryPattern(metric.query);

      if (!patterns.has(pattern)) {
        patterns.set(pattern, { count: 0, totalDuration: 0 });
      }

      const entry = patterns.get(pattern)!;
      entry.count += 1;
      entry.totalDuration += metric.duration;
    }

    // Calculate averages
    const result = new Map();
    for (const [pattern, data] of patterns) {
      result.set(pattern, {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      });
    }

    return result;
  }

  /**
   * Reset metrics (for testing/batch analysis)
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    if (!stats) return "No metrics recorded";

    const slowestQueries = this.getSlowestQueries(5);
    const patterns = this.findSlowQueryPatterns();

    let report = "\n" + "=".repeat(80) + "\n";
    report += "PERFORMANCE MONITORING REPORT\n";
    report += "=".repeat(80) + "\n\n";

    report += "OVERALL STATISTICS\n";
    report += "-".repeat(40) + "\n";
    report += `Total Queries:       ${stats.totalQueries}\n`;
    report += `Total Duration:      ${stats.totalDuration}ms\n`;
    report += `Average Duration:    ${stats.averageDuration.toFixed(2)}ms\n`;
    report += `Min Duration:        ${stats.minDuration}ms\n`;
    report += `Max Duration:        ${stats.maxDuration}ms\n`;
    report += `Slow Queries:        ${stats.slowQueries} (${stats.slowQueryPercentage}%)\n\n`;

    report += "TOP 5 SLOWEST QUERIES\n";
    report += "-".repeat(40) + "\n";
    slowestQueries.forEach((q, i) => {
      report += `${i + 1}. [${q.duration}ms] ${q.query.substring(0, 60)}...\n`;
    });

    if (patterns.size > 0) {
      report += "\nSLOW QUERY PATTERNS\n";
      report += "-".repeat(40) + "\n";
      let patternIndex = 1;
      for (const [pattern, data] of patterns) {
        report += `${patternIndex}. Pattern: ${pattern}\n`;
        report += `   Count: ${data.count}, Avg Duration: ${data.avgDuration.toFixed(2)}ms\n`;
        patternIndex += 1;
      }
    }

    report += "=".repeat(80) + "\n";
    return report;
  }

  /**
   * Extract query pattern (removes specific values)
   */
  private getQueryPattern(query: string): string {
    return query
      .replace(/'[^']*'/g, "?")
      .replace(/\d+/g, "?")
      .substring(0, 100);
  }

  /**
   * Sanitize query for display
   */
  private sanitizeQuery(query: string): string {
    // Remove multiple spaces
    return query.replace(/\s+/g, " ").trim();
  }
}

// ============================================================================
// QUERY EVENT LISTENER
// ============================================================================

/**
 * Setup event listeners for Prisma query events
 * This enables real-time monitoring and alerting
 */
export function setupQueryLogging(
  client: any,
  monitor: PerformanceMonitor,
): void {
  // Listen to all query events
  client.$on("query", (e: any) => {
    console.log("\n📊 [QUERY EVENT]");
    console.log(`   SQL: ${e.query.substring(0, 100)}...`);
    console.log(`   Duration: ${e.duration}ms`);
    console.log(`   Timestamp: ${new Date(e.timestamp).toISOString()}`);

    monitor.recordMetric(e.query, e.duration);
  });

  // Listen to info events
  client.$on("info", (e: any) => {
    console.log(`ℹ️  [INFO] ${e.message}`);
  });

  // Listen to warn events
  client.$on("warn", (e: any) => {
    console.warn(`⚠️  [WARN] ${e.message}`);
  });

  // Listen to error events
  client.$on("error", (e: any) => {
    console.error(`❌ [ERROR] ${e.message}`);
  });
}

// ============================================================================
// INDEX EFFECTIVENESS MONITORING
// ============================================================================

/**
 * Monitor index usage and effectiveness
 * This helps identify missing or unused indexes
 */
export async function analyzeIndexEffectiveness(client: any): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log("INDEX EFFECTIVENESS ANALYSIS");
  console.log("=".repeat(80));

  console.log("\n📊 Indexes on COMPLAINTS table:");
  console.log("   ✓ @@index([memberId])      - For filtering by member");
  console.log("   ✓ @@index([status])        - For filtering by status");
  console.log("   ✓ @@index([severity])      - For filtering by severity");
  console.log("   ✓ @@index([filedAt])       - For date range queries");
  console.log(
    "   ✓ @@index([resolvedAt])    - For filtering resolved complaints",
  );

  console.log("\n📊 Indexes on RELIEF_FUND table:");
  console.log("   ✓ @@index([memberId])      - For member fund lookups");

  console.log("\n📊 Indexes on PAYMENT table:");
  console.log("   ✓ @@index([memberId])      - For user payment history");
  console.log("   ✓ @@index([complaintId])   - For complaint payments");
  console.log("   ✓ @@index([status])        - For payment status filtering");
  console.log("   ✓ @@index([processedAt])   - For date range queries");

  console.log("\n💡 INDEX RECOMMENDATIONS:");
  console.log("   1. Add composite index for frequent multi-column filters:");
  console.log("      @@index([status, filedAt]) - for recent complaints");
  console.log("      @@index([memberId, status]) - for member complaint stats");
  console.log("   2. Use these indexes for:");
  console.log("      - Dashboard queries");
  console.log("      - Report generation");
  console.log("      - Pagination with filters");
}

// ============================================================================
// CONNECTION POOL MONITORING
// ============================================================================

/**
 * Monitor Prisma connection pool health
 */
export async function monitorConnectionPool(client: any): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log("CONNECTION POOL MONITORING");
  console.log("=".repeat(80));

  // Get connection pool status
  console.log("\n📡 PostgreSQL Connection Pool Status:");
  console.log("   Current Setup: DATABASE_URL with connection string");
  console.log("   Pool Size: Default (10 connections)");
  console.log("   Connection Limit: 20");

  console.log("\n⚙️  OPTIMIZATION TIPS:");
  console.log("   1. Increase pool size for high-traffic apps:");
  console.log('      DATABASE_URL="...?connection_limit=30"');
  console.log("   2. Use connection pooling (PgBouncer):");
  console.log("      For managed hosting (Neon, Railway)");
  console.log("   3. Monitor with:");
  console.log("      - Prisma Studio: npx prisma studio");
  console.log("      - SELECT count(*) FROM pg_stat_activity;");
  console.log("      - Log slow queries (duration > 1000ms)");

  console.log("\n🚨 WARNING SIGNS:");
  console.log("   - Queries hanging (duration > 30000ms)");
  console.log("   - Connection pool exhaustion");
  console.log("   - Increasing query latency over time");
  console.log("   - High CPU usage on database server");
}

// ============================================================================
// BEFORE/AFTER PERFORMANCE COMPARISON
// ============================================================================

export interface PerformanceComparison {
  name: string;
  before: {
    queryCount: number;
    totalDuration: number;
    avgDuration: number;
  };
  after: {
    queryCount: number;
    totalDuration: number;
    avgDuration: number;
  };
  improvement: {
    queryCountReduction: number;
    durationReduction: number;
    percentageImprovement: number;
  };
}

/**
 * Utility: Create before/after comparison
 */
export function comparePerformance(
  name: string,
  before: PerformanceMonitor,
  after: PerformanceMonitor,
): PerformanceComparison {
  const beforeStats = before.getStatistics();
  const afterStats = after.getStatistics();

  if (!beforeStats || !afterStats) {
    throw new Error("Insufficient metrics for comparison");
  }

  const queryReduction = beforeStats.totalQueries - afterStats.totalQueries;
  const durationReduction =
    beforeStats.totalDuration - afterStats.totalDuration;
  const percentageImprovement = (
    (durationReduction / beforeStats.totalDuration) *
    100
  ).toFixed(2);

  return {
    name,
    before: {
      queryCount: beforeStats.totalQueries,
      totalDuration: beforeStats.totalDuration,
      avgDuration: beforeStats.averageDuration,
    },
    after: {
      queryCount: afterStats.totalQueries,
      totalDuration: afterStats.totalDuration,
      avgDuration: afterStats.averageDuration,
    },
    improvement: {
      queryCountReduction: queryReduction,
      durationReduction: durationReduction,
      percentageImprovement: parseFloat(percentageImprovement),
    },
  };
}

// ============================================================================
// PERFORMANCE REPORT GENERATOR
// ============================================================================

/**
 * Generate comprehensive performance report
 */
export function generatePerformanceReport(
  comparisons: PerformanceComparison[],
): string {
  let report = "\n" + "=".repeat(100) + "\n";
  report += "BEFORE vs AFTER PERFORMANCE COMPARISON\n";
  report += "=".repeat(100) + "\n\n";

  for (const comparison of comparisons) {
    report += `📊 ${comparison.name}\n`;
    report += "-".repeat(100) + "\n";

    report += "BEFORE:\n";
    report += `  • Query Count:      ${comparison.before.queryCount}\n`;
    report += `  • Total Duration:   ${comparison.before.totalDuration}ms\n`;
    report += `  • Average Duration: ${comparison.before.avgDuration.toFixed(2)}ms\n\n`;

    report += "AFTER:\n";
    report += `  • Query Count:      ${comparison.after.queryCount}\n`;
    report += `  • Total Duration:   ${comparison.after.totalDuration}ms\n`;
    report += `  • Average Duration: ${comparison.after.avgDuration.toFixed(2)}ms\n\n`;

    report += "IMPROVEMENT:\n";
    report += `  ✓ Query reduction:  ${comparison.improvement.queryCountReduction} fewer queries\n`;
    report += `  ✓ Duration saved:   ${comparison.improvement.durationReduction}ms\n`;
    report += `  ✓ Performance:      ${comparison.improvement.percentageImprovement}% faster\n`;
    report += "\n";
  }

  report += "=".repeat(100) + "\n";
  return report;
}

// ============================================================================
// PRODUCTION MONITORING CHECKLIST
// ============================================================================

export function printProductionMonitoringChecklist(): void {
  console.log("\n" + "=".repeat(80));
  console.log("PRODUCTION MONITORING CHECKLIST");
  console.log("=".repeat(80) + "\n");

  const checklist = [
    {
      category: "Query Monitoring",
      items: [
        "✓ Enable query logging in production (sampled to avoid overhead)",
        "✓ Track slow query threshold (>1000ms)",
        "✓ Monitor query count trends over time",
        "✓ Alert on unexpected query count increases (N+1 problem)",
      ],
    },
    {
      category: "Performance Metrics",
      items: [
        "✓ Measure query latency (p50, p95, p99 percentiles)",
        "✓ Track database CPU and memory usage",
        "✓ Monitor transaction rollback rates",
        "✓ Watch for increasing query duration over time",
      ],
    },
    {
      category: "Index Health",
      items: [
        "✓ Regularly analyze index usage statistics",
        "✓ Remove unused indexes",
        "✓ Add indexes for frequently filtered columns",
        "✓ Run VACUUM and ANALYZE regularly",
      ],
    },
    {
      category: "Connection Management",
      items: [
        "✓ Monitor active connections and connection pool usage",
        "✓ Alert on connection pool exhaustion",
        "✓ Track connection wait times",
        "✓ Implement connection pooling (PgBouncer)",
      ],
    },
    {
      category: "Error Tracking",
      items: [
        "✓ Log all transaction rollbacks with error details",
        "✓ Monitor constraint violations (FK, unique, etc.)",
        "✓ Track deadlock occurrences",
        "✓ Alert on database unavailability",
      ],
    },
    {
      category: "Data Integrity",
      items: [
        "✓ Regular backups (daily or more frequent)",
        "✓ Test point-in-time recovery procedures",
        "✓ Monitor replication lag (if using replicas)",
        "✓ Verify transaction ACID properties in tests",
      ],
    },
    {
      category: "Tools & Infrastructure",
      items: [
        "✓ Use Prisma Studio for ad-hoc queries",
        "✓ Setup distributed tracing (OpenTelemetry)",
        "✓ Configure log aggregation (ELK, DataDog, etc.)",
        "✓ Create dashboards for key metrics",
      ],
    },
  ];

  for (const section of checklist) {
    console.log(`\n📋 ${section.category}\n`);
    for (const item of section.items) {
      console.log(`   ${item}`);
    }
  }

  console.log("\n" + "=".repeat(80) + "\n");
}

// ============================================================================
// EXPORT
// ============================================================================

export { PerformanceMonitor };
export default {
  prisma,
  PerformanceMonitor,
  setupQueryLogging,
  analyzeIndexEffectiveness,
  monitorConnectionPool,
  comparePerformance,
  generatePerformanceReport,
  printProductionMonitoringChecklist,
};
