// frontend/app/api/test-handler/route.ts

import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET() {
  try {
    const dummyData = {
      name: "StagePass Test API",
      status: "working",
    };

    return sendSuccess(dummyData, "Dummy API working");
  } catch (error) {
    return sendError(
      "Dummy API failed",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error
    );
  }
}
