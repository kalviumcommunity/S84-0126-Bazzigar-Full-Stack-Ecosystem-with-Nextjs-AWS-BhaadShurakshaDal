import { NextResponse } from "next/server";

const members = [
  { id: 1, name: "Ramesh Kumar", role: "Volunteer" },
  { id: 2, name: "Sita Devi", role: "Coordinator" },
];

// GET /api/members → get all members (with pagination)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const start = (page - 1) * limit;
  const end = start + limit;

  return NextResponse.json({
    page,
    limit,
    total: members.length,
    data: members.slice(start, end),
  });
}

// POST /api/members → create a new member
export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || !body.role) {
    return NextResponse.json(
      { error: "Name and role are required" },
      { status: 400 }
    );
  }

  const newMember = {
    id: members.length + 1,
    ...body,
  };

  members.push(newMember);

  return NextResponse.json(newMember, { status: 201 });
}
