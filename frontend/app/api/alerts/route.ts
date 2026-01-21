import { NextResponse } from "next/server";
import { getFloodAlerts } from "@/services/alert.service";

export async function GET() {
  try {
    const data = await getFloodAlerts();

    return NextResponse.json({
      success: true,
      data,
      source: "redis + prisma",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
