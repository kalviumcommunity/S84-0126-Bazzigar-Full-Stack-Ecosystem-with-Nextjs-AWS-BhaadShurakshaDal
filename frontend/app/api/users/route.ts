import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/user.schema";

export async function PUT(req: Request) {
  const body = await req.json();

  const validatedData = userSchema.parse(body);

  return NextResponse.json({
    success: true,
    data: validatedData,
  });
}
