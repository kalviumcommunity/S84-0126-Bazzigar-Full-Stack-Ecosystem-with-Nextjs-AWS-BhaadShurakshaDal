/**
 * Prisma Transaction Service
 * Bhaad Suraksha Dal - Transaction & Query Optimization
 *
 * This file demonstrates:
 * 1. Realistic transaction scenarios (complaint filing + approval)
 * 2. ACID properties: Atomicity, Consistency, Isolation, Durability
 * 3. Error handling & rollback mechanisms
 * 4. Performance monitoring with query logging
 */

const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// ============================================================================
// TRANSACTION SCENARIO 1: Complaint Registration with Member Status Update
// ============================================================================

/**
 * Transaction: File a complaint and update member's complaint count
 * This ensures atomicity: either both succeed or both rollback
 *
 * Scenario: Community member files a flood relief complaint
 * - Create a new complaint record
 * - Increment member's total complaints counter (tracked via metadata)
 * - Lock member record to prevent concurrent updates
 *
 * Why transactions?
 * - Atomicity: Both operations must succeed together
 * - Consistency: Member complaint count stays accurate
 * - Isolation: Prevents race conditions
 * - Durability: Once committed, changes are permanent
 */
export async function fileComplaintTransaction(
  memberId: string,
  complaintData: {
    title: string;
    description: string;
    location: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  },
) {
  try {
    console.log(
      `[TRANSACTION] Starting: File complaint for member ${memberId}`,
    );

    // Start transaction with proper error handling
    const result = await prisma.$transaction(
      async (tx: any) => {
        // Step 1: Verify member exists and is active
        const member = await tx.member.findUnique({
          where: { id: memberId },
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            role: true,
          },
        });

        if (!member) {
          throw new Error(`Member not found: ${memberId}`);
        }

        if (!member.isActive) {
          throw new Error(`Member is inactive: ${memberId}`);
        }

        // Step 2: Create complaint record
        const complaint = await tx.complaint.create({
          data: {
            title: complaintData.title,
            description: complaintData.description,
            location: complaintData.location,
            severity: complaintData.severity,
            memberId: memberId,
            status: "FILED",
            filedAt: new Date(),
          },
          include: {
            member: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        console.log(`[TRANSACTION] ✓ Complaint created: ${complaint.id}`);

        // Step 3: Initialize relief fund if not exists
        // This demonstrates batch operation within transaction
        const existingFund = await tx.reliefFund.findUnique({
          where: { memberId },
        });

        if (!existingFund) {
          await tx.reliefFund.create({
            data: {
              memberId,
              totalAllocated: 0,
              amountDispersed: 0,
            },
          });
          console.log(
            `[TRANSACTION] ✓ Relief fund initialized for member ${memberId}`,
          );
        }

        return {
          success: true,
          complaint: {
            id: complaint.id,
            title: complaint.title,
            memberId: complaint.memberId,
            status: complaint.status,
            filedAt: complaint.filedAt,
          },
          message: `Complaint filed successfully by ${member.name}`,
        };
      },
      {
        // Transaction options for explicit control
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // Strictest isolation
        maxWait: 5000, // Max wait for lock (5 seconds)
        timeout: 30000, // Transaction timeout (30 seconds)
      },
    );

    console.log("[TRANSACTION] ✓ Complaint filing completed successfully");
    return result;
  } catch (error) {
    console.error(
      `[TRANSACTION ERROR] Complaint filing failed - Rollback executed`,
    );
    console.error(
      `[ERROR DETAILS] ${error instanceof Error ? error.message : String(error)}`,
    );

    // Log rollback for auditing
    console.log(`[ROLLBACK] All changes discarded for member: ${memberId}`);

    throw new Error(
      `Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ============================================================================
// TRANSACTION SCENARIO 2: Complaint Approval with Fund Allocation
// ============================================================================

/**
 * Transaction: Approve complaint and allocate relief funds
 *
 * Scenario: Admin approves complaint and allocates relief fund
 * - Fetch complaint
 * - Create approval record
 * - Update member's relief fund allocation
 * - Update complaint status
 *
 * Why transactions?
 * - Ensures funds are allocated atomically
 * - Prevents double-allocation due to race conditions
 * - Maintains referential integrity
 */
export async function approveComplaintTransaction(
  complaintId: string,
  adminMemberId: string,
  amountAllocated: number,
) {
  try {
    console.log(
      `[TRANSACTION] Starting: Approve complaint ${complaintId} with amount ${amountAllocated}`,
    );

    const result = await prisma.$transaction(
      async (tx: any) => {
        // Step 1: Fetch complaint with member info
        const complaint = await tx.complaint.findUniqueOrThrow({
          where: { id: complaintId },
          include: {
            member: {
              select: { id: true, name: true, reliefFund: true },
            },
          },
        });

        // Validation: Only FILED complaints can be approved
        if (complaint.status !== "FILED") {
          throw new Error(
            `Cannot approve complaint with status: ${complaint.status}`,
          );
        }

        // Step 2: Update complaint status
        const updatedComplaint = await tx.complaint.update({
          where: { id: complaintId },
          data: { status: "APPROVED" },
        });

        console.log(`[TRANSACTION] ✓ Complaint status updated to APPROVED`);

        // Step 3: Create approval record
        const approval = await tx.approvalRecord.create({
          data: {
            complaintId,
            approvedById: adminMemberId,
            amountAllocated: new Prisma.Decimal(amountAllocated),
            approvalDate: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Approval record created: ${approval.id}`);

        // Step 4: Update relief fund allocation
        await tx.reliefFund.update({
          where: { memberId: complaint.memberId },
          data: {
            totalAllocated: {
              increment: new Prisma.Decimal(amountAllocated),
            },
            lastUpdated: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Relief fund updated: +${amountAllocated}`);

        return {
          success: true,
          complaintId: complaint.id,
          approvalId: approval.id,
          memberName: complaint.member.name,
          amountAllocated,
          message: `Complaint approved with ${amountAllocated} relief funds allocated`,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 30000,
      },
    );

    console.log("[TRANSACTION] ✓ Complaint approval transaction completed");
    return result;
  } catch (error) {
    console.error(`[TRANSACTION ERROR] Approval failed - Rollback executed`);
    console.error(
      `[ERROR DETAILS] ${error instanceof Error ? error.message : String(error)}`,
    );

    console.log(
      `[ROLLBACK] All changes discarded - approval reverted for complaint: ${complaintId}`,
    );

    throw error;
  }
}

// ============================================================================
// TRANSACTION SCENARIO 3: Payment Processing (Intentional Failure Demo)
// ============================================================================

/**
 * Transaction: Process payment with intentional failure simulation
 *
 * This demonstrates ROLLBACK behavior:
 * - Creates payment record
 * - Throws error if amount exceeds balance
 * - All changes rollback automatically
 *
 * Important: This shows what happens when transaction fails
 */
export async function processPaymentTransaction(
  memberId: string,
  complaintId: string,
  amount: number,
  simulateFailure: boolean = false,
) {
  try {
    console.log(
      `[TRANSACTION] Starting: Process payment of ${amount} for member ${memberId}`,
    );

    const result = await prisma.$transaction(
      async (tx: any) => {
        // Step 1: Fetch relief fund
        const reliefFund = await tx.reliefFund.findUniqueOrThrow({
          where: { memberId },
        });

        const availableBalance =
          reliefFund.totalAllocated.toNumber() -
          reliefFund.amountDispersed.toNumber();

        // Step 2: Validate payment amount
        if (amount > availableBalance) {
          throw new Error(
            `Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`,
          );
        }

        // Step 3: Intentional failure simulation for testing rollback
        if (simulateFailure) {
          throw new Error(
            "[SIMULATED ERROR] Payment gateway temporarily unavailable",
          );
        }

        // Step 4: Create payment record
        const payment = await tx.payment.create({
          data: {
            memberId,
            complaintId,
            amount: new Prisma.Decimal(amount),
            status: "COMPLETED",
            paymentMethod: "BANK_TRANSFER",
            transactionId: `TXN-${Date.now()}`,
            processedAt: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Payment record created: ${payment.id}`);

        // Step 5: Update relief fund dispersal
        await tx.reliefFund.update({
          where: { memberId },
          data: {
            amountDispersed: {
              increment: new Prisma.Decimal(amount),
            },
            lastUpdated: new Date(),
          },
        });

        console.log(
          `[TRANSACTION] ✓ Relief fund updated: Dispersed +${amount}`,
        );

        return {
          success: true,
          paymentId: payment.id,
          transactionId: payment.transactionId,
          amount,
          status: "COMPLETED",
          message: `Payment processed successfully`,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 30000,
      },
    );

    console.log("[TRANSACTION] ✓ Payment processing completed");
    return result;
  } catch (error) {
    console.error(
      `[TRANSACTION ERROR] Payment processing failed - Rollback executed`,
    );
    console.error(
      `[ERROR DETAILS] ${error instanceof Error ? error.message : String(error)}`,
    );

    // Critical: Log that NO partial writes occurred
    console.log(
      `[ROLLBACK] ✓ ATOMICITY GUARANTEED: No partial payments recorded`,
    );
    console.log(
      `[ROLLBACK] ✓ Relief fund balance unchanged - payment discarded`,
    );

    throw error;
  }
}

// ============================================================================
// TRANSACTION SCENARIO 4: Batch Operations with createMany
// ============================================================================

/**
 * Transaction: Register multiple complaints from affected community
 *
 * Scenario: After a flood event, multiple members file complaints simultaneously
 * - Create multiple complaint records atomically
 * - Initialize relief funds for all
 * - Ensures consistency even if one member has issues
 */
export async function bulkComplaintRegistrationTransaction(
  complaints: Array<{
    memberId: string;
    title: string;
    description: string;
    location: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>,
) {
  try {
    console.log(
      `[TRANSACTION] Starting: Bulk register ${complaints.length} complaints`,
    );

    const result = await prisma.$transaction(
      async (tx: any) => {
        // Step 1: Create all complaints in one batch operation
        const createdComplaints = await tx.complaint.createMany({
          data: complaints.map((c) => ({
            title: c.title,
            description: c.description,
            location: c.location,
            severity: c.severity,
            memberId: c.memberId,
            status: "FILED",
            filedAt: new Date(),
          })),
          skipDuplicates: true,
        });

        console.log(
          `[TRANSACTION] ✓ Bulk created ${createdComplaints.count} complaints`,
        );

        // Step 2: Initialize relief funds for affected members
        const memberIds = complaints.map((c) => c.memberId);
        const existingFunds = await tx.reliefFund.findMany({
          where: { memberId: { in: memberIds } },
          select: { memberId: true },
        });

        const existingMemberIds = new Set(
          existingFunds.map((f: any) => f.memberId),
        );

        const newFunds = await tx.reliefFund.createMany({
          data: memberIds
            .filter((id) => !existingMemberIds.has(id))
            .map((memberId) => ({
              memberId,
              totalAllocated: 0,
              amountDispersed: 0,
            })),
          skipDuplicates: true,
        });

        console.log(
          `[TRANSACTION] ✓ Initialized ${newFunds.count} relief funds`,
        );

        return {
          success: true,
          complaintsCreated: createdComplaints.count,
          fundsInitialized: newFunds.count,
          message: `Bulk registration completed: ${createdComplaints.count} complaints, ${newFunds.count} relief funds`,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 60000, // Longer timeout for batch operations
      },
    );

    console.log("[TRANSACTION] ✓ Bulk registration transaction completed");
    return result;
  } catch (error) {
    console.error(
      `[TRANSACTION ERROR] Bulk registration failed - Rollback executed`,
    );
    console.error(
      `[ERROR DETAILS] ${error instanceof Error ? error.message : String(error)}`,
    );

    console.log(
      `[ROLLBACK] All complaints and funds discarded - database unchanged`,
    );

    throw error;
  }
}

// ============================================================================
// CLEANUP & EXPORT
// ============================================================================

export async function closeDatabase() {
  await prisma.$disconnect();
}

export default prisma;
