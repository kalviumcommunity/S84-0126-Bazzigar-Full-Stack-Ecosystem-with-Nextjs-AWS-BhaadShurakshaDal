/**
 * API Route - User Management
 * =========================================================
 * Uses Prisma + Next.js App Router
 * Works with existing schema.prisma (NO schema changes)
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserRole, UserStatus } from "@prisma/client";

/**
 * GET /api/users
 *
 * Query Params:
 * - role?: USER | ADMIN
 * - active?: true | false
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const role = searchParams.get("role") as UserRole | null;
    const active = searchParams.get("active");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (active !== null) {
      where.status =
        active === "true" ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/users] Error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 *
 * Body:
 * {
 *   email: string
 *   phone?: string
 *   firstName: string
 *   lastName?: string
 *   password: string
 *   role?: USER | ADMIN
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      phone,
      firstName,
      lastName,
      password,
      role = UserRole.USER,
    } = body;

    if (!email || !firstName || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, firstName, password",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        password,
        role,
        status: UserStatus.ACTIVE,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/users] Error:", error);

    // ✅ Proper Prisma error handling (NO `any`)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] ?? "field";
        return NextResponse.json(
          { success: false, error: `${field} already exists` },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
