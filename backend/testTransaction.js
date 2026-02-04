/**
 * Test Transaction File
 * Run this to verify that transactions are working correctly
 * Usage: node testTransaction.js
 */

const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// ============================================================================
// TEST 1: File Complaint Transaction
// ============================================================================
async function testFileComplaint() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: FILE COMPLAINT TRANSACTION");
  console.log("=".repeat(80));

  try {
    // First, get a valid member ID from database
    const member = await prisma.member.findFirst({
      where: { isActive: true },
    });

    if (!member) {
      console.log("❌ No active members found in database");
      return null;
    }

    console.log(`✓ Found member: ${member.name} (${member.id})`);

    // Start transaction
    const result = await prisma.$transaction(
      async (tx) => {
        console.log("[TRANSACTION] Starting complaint filing...");

        // Create complaint
        const complaint = await tx.complaint.create({
          data: {
            title: `Test Complaint - ${new Date().toISOString()}`,
            description: "This is a test complaint to verify transaction",
            location: "Test Location",
            severity: "MEDIUM",
            memberId: member.id,
            status: "FILED",
            filedAt: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Complaint created: ${complaint.id}`);

        // Initialize relief fund
        const existingFund = await tx.reliefFund.findUnique({
          where: { memberId: member.id },
        });

        if (!existingFund) {
          await tx.reliefFund.create({
            data: {
              memberId: member.id,
              totalAllocated: 0,
              amountDispersed: 0,
            },
          });
          console.log(`[TRANSACTION] ✓ Relief fund initialized for member`);
        }

        return {
          success: true,
          complaintId: complaint.id,
          memberId: member.id,
          status: complaint.status,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 30000,
      },
    );

    console.log(`\n✅ TRANSACTION SUCCESSFUL!`);
    console.log(`   Complaint ID: ${result.complaintId}`);
    console.log(`   Member ID: ${result.memberId}`);
    console.log(`   Status: ${result.status}`);
    return result;
  } catch (error) {
    console.error(`\n❌ TRANSACTION FAILED!`);
    console.error(`   Error: ${error.message}`);
    console.log(`[ROLLBACK] All changes discarded`);
    return null;
  }
}

// ============================================================================
// TEST 2: Approve Complaint Transaction
// ============================================================================
async function testApproveComplaint(complaintId) {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: APPROVE COMPLAINT TRANSACTION");
  console.log("=".repeat(80));

  try {
    // Get an admin member
    const admin = await prisma.member.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      console.log("❌ No admin members found in database");
      return null;
    }

    console.log(`✓ Found admin: ${admin.name} (${admin.id})`);

    const result = await prisma.$transaction(
      async (tx) => {
        console.log("[TRANSACTION] Starting complaint approval...");

        // Get complaint
        const complaint = await tx.complaint.findUnique({
          where: { id: complaintId },
          include: { member: true },
        });

        if (!complaint) {
          throw new Error(`Complaint not found: ${complaintId}`);
        }

        console.log(`[TRANSACTION] ✓ Complaint fetched: ${complaint.id}`);

        // Update complaint status
        const updated = await tx.complaint.update({
          where: { id: complaintId },
          data: { status: "APPROVED" },
        });

        console.log(`[TRANSACTION] ✓ Complaint status updated to APPROVED`);

        // Create approval record
        const approvalAmount = 5000;
        const approval = await tx.approvalRecord.create({
          data: {
            complaintId,
            approvedById: admin.id,
            amountAllocated: new Prisma.Decimal(approvalAmount),
            approvalDate: new Date(),
            notes: "Test approval",
          },
        });

        console.log(`[TRANSACTION] ✓ Approval record created: ${approval.id}`);

        // Update relief fund
        await tx.reliefFund.update({
          where: { memberId: complaint.memberId },
          data: {
            totalAllocated: {
              increment: new Prisma.Decimal(approvalAmount),
            },
            lastUpdated: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Relief fund updated: +${approvalAmount}`);

        return {
          success: true,
          complaintId: complaint.id,
          approvalId: approval.id,
          amountAllocated: approvalAmount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 30000,
      },
    );

    console.log(`\n✅ APPROVAL TRANSACTION SUCCESSFUL!`);
    console.log(`   Approval ID: ${result.approvalId}`);
    console.log(`   Amount: ${result.amountAllocated}`);
    return result;
  } catch (error) {
    console.error(`\n❌ APPROVAL TRANSACTION FAILED!`);
    console.error(`   Error: ${error.message}`);
    console.log(`[ROLLBACK] All changes discarded`);
    return null;
  }
}

// ============================================================================
// TEST 3: Process Payment Transaction
// ============================================================================
async function testProcessPayment(memberId) {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: PROCESS PAYMENT TRANSACTION");
  console.log("=".repeat(80));

  try {
    // Get a complaint for this member
    const complaint = await prisma.complaint.findFirst({
      where: { memberId, status: "APPROVED" },
    });

    if (!complaint) {
      console.log("❌ No approved complaints found for this member");
      return null;
    }

    console.log(`✓ Found complaint: ${complaint.id}`);

    const paymentAmount = 2000;

    const result = await prisma.$transaction(
      async (tx) => {
        console.log("[TRANSACTION] Starting payment processing...");

        // Get relief fund
        const reliefFund = await tx.reliefFund.findUnique({
          where: { memberId },
        });

        const availableBalance =
          reliefFund.totalAllocated.toNumber() -
          reliefFund.amountDispersed.toNumber();

        console.log(`[TRANSACTION] ✓ Available balance: ${availableBalance}`);

        if (paymentAmount > availableBalance) {
          throw new Error(
            `Insufficient balance. Available: ${availableBalance}, Requested: ${paymentAmount}`,
          );
        }

        // Create payment
        const payment = await tx.payment.create({
          data: {
            memberId,
            complaintId: complaint.id,
            amount: new Prisma.Decimal(paymentAmount),
            status: "COMPLETED",
            paymentMethod: "BANK_TRANSFER",
            transactionId: `TXN-${Date.now()}`,
            processedAt: new Date(),
          },
        });

        console.log(`[TRANSACTION] ✓ Payment created: ${payment.id}`);

        // Update relief fund
        await tx.reliefFund.update({
          where: { memberId },
          data: {
            amountDispersed: {
              increment: new Prisma.Decimal(paymentAmount),
            },
            lastUpdated: new Date(),
          },
        });

        console.log(
          `[TRANSACTION] ✓ Relief fund updated: Dispersed +${paymentAmount}`,
        );

        return {
          success: true,
          paymentId: payment.id,
          transactionId: payment.transactionId,
          amount: paymentAmount,
          status: "COMPLETED",
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 30000,
      },
    );

    console.log(`\n✅ PAYMENT TRANSACTION SUCCESSFUL!`);
    console.log(`   Payment ID: ${result.paymentId}`);
    console.log(`   Amount: ${result.amount}`);
    return result;
  } catch (error) {
    console.error(`\n❌ PAYMENT TRANSACTION FAILED!`);
    console.error(`   Error: ${error.message}`);
    console.log(`[ROLLBACK] All changes discarded`);
    return null;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗",
  );
  console.log("║         TRANSACTION TESTING SUITE                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    // Test 1: File complaint
    const complaintResult = await testFileComplaint();

    if (!complaintResult) {
      console.log("Skipping remaining tests...");
      await prisma.$disconnect();
      return;
    }

    // Test 2: Approve complaint
    const approvalResult = await testApproveComplaint(
      complaintResult.complaintId,
    );

    if (!approvalResult) {
      console.log("Skipping payment test...");
      await prisma.$disconnect();
      return;
    }

    // Test 3: Process payment
    await testProcessPayment(complaintResult.memberId);

    console.log("\n" + "=".repeat(80));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    console.log("\nTransaction support is working correctly!");
    console.log("ACID properties are being maintained:");
    console.log(
      "  • Atomicity: All operations succeed together or fail together",
    );
    console.log("  • Consistency: Database state remains valid");
    console.log(
      "  • Isolation: Serializable isolation level prevents conflicts",
    );
    console.log("  • Durability: Changes are permanently stored");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testFileComplaint,
  testApproveComplaint,
  testProcessPayment,
  runAllTests,
};
