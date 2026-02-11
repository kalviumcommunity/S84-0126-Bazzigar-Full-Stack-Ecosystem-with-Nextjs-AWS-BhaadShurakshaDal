import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { prisma } from "@/lib/prisma";
import { handleResponse, handleError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return handleError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invalid input data",
        validationResult.error.issues,
        400
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return handleError(
        ERROR_CODES.UNAUTHORIZED,
        "Invalid email or password",
        null,
        401
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return handleError(
        ERROR_CODES.FORBIDDEN,
        "Account is deactivated. Please contact support.",
        null,
        403
      );
    }

    // Verify password (in production, use bcrypt.compare)
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password; // Temporary for development

    if (!isPasswordValid) {
      return handleError(
        ERROR_CODES.UNAUTHORIZED,
        "Invalid email or password",
        null,
        401
      );
    }

    // Generate JWT token (in production, use proper JWT library)
    // const token = jwt.sign(
    //   { userId: user.id, email: user.email, role: user.role },
    //   process.env.JWT_SECRET!,
    //   { expiresIn: '24h' }
    // );

    const token = `temp-token-${user.id}`; // Temporary for development

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return handleResponse(
      {
        user: userWithoutPassword,
        token,
        message: "Login successful",
      },
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    return handleError(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to login",
      error,
      500
    );
  }
}
