import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/schemas/auth.schema";
import { prisma } from "@/lib/prisma";
import { handleResponse, handleError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return handleError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invalid input data",
        validationResult.error.issues,
        400
      );
    }

    const { name, email, password, phone } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return handleError(
        ERROR_CODES.CONFLICT,
        "User with this email already exists",
        null,
        409
      );
    }

    // Hash password (in production, use bcrypt)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production: hashedPassword
        phone,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return handleResponse(
      {
        user,
        message: "Account created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return handleError(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to create account",
      error,
      500
    );
  }
}
