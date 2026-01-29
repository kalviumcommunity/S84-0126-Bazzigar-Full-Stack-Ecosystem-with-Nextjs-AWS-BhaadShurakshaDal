/**
 * API Route Example - Member Query
 * ============================================================================
 *
 * This example demonstrates how to use Prisma in a Next.js API route
 * to fetch members from the Bhaad Suraksha Dal database.
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/members
 *
 * Query Parameters:
 * - role?: ADMIN | COMMANDER | VOLUNTEER (filter by role)
 * - active?: true | false (filter by isActive status)
 * - page?: number (pagination, default: 1)
 * - limit?: number (items per page, default: 10)
 *
 * Returns: Array of members with optional relations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const role = searchParams.get("role");
    const active = searchParams.get("active") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: Record<string, unknown> = {};
    if (role) {
      where.role = role;
    }
    if (searchParams.get("active") !== null) {
      where.isActive = active;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch members with optional relations
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          teamLeaderships: {
            select: { id: true, name: true },
          },
          teamMemberships: {
            select: {
              team: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { dateOfJoining: "asc" },
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/members] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch members",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/members
 *
 * Request Body:
 * {
 *   email: string (required, unique)
 *   name: string (required)
 *   phone: string (required, unique)
 *   role: "ADMIN" | "COMMANDER" | "VOLUNTEER" (required)
 * }
 *
 * Returns: Created member object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { email, name, phone, role } = body;
    if (!email || !name || !phone || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, name, phone, role",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "COMMANDER", "VOLUNTEER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        email,
        name,
        phone,
        role,
        dateOfJoining: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/members] Error:", error);

    // Handle unique constraint violations
    if (
      error instanceof Object &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      const field = (error as any).meta?.target?.[0] || "field";
      return NextResponse.json(
        {
          success: false,
          error: `${field} already exists`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create member",
      },
      { status: 500 }
    );
  }
}
