// frontend/lib/responseHandler.ts

import { NextResponse } from "next/server";

/**
 * Generic Success Response Type
 */
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Error Object Type
 */
interface ErrorObject {
  code: string;
  details?: unknown;
}

/**
 * Error Response Type
 */
interface ErrorResponse {
  success: false;
  message: string;
  error: ErrorObject;
  timestamp: string;
}

/**
 * Success Handler
 */
export const sendSuccess = <T>(
  data: T,
  message: string = "Success",
  status: number = 200
) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
};

/**
 * Error Handler
 */
export const sendError = (
  message: string = "Something went wrong",
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  details?: unknown
) => {
  const response: ErrorResponse = {
    success: false,
    message,
    error: {
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
};
