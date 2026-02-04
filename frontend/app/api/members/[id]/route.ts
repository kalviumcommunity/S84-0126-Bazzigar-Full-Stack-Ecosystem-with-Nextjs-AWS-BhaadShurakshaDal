import { NextResponse } from "next/server";

const members = [
  { id: 1, name: "Ramesh Kumar", role: "Volunteer" },
  { id: 2, name: "Sita Devi", role: "Coordinator" },
];

// GET /api/members/:id → get one member
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const member = members.find((m) => m.id === Number(params.id));

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}

// PUT /api/members/:id → update member
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const index = members.findIndex((m) => m.id === Number(params.id));

  if (index === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const body = await req.json();
  members[index] = { ...members[index], ...body };

  return NextResponse.json(members[index]);
}

// DELETE /api/members/:id → delete member
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const index = members.findIndex((m) => m.id === Number(params.id));

  if (index === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  members.splice(index, 1);

  return NextResponse.json({ message: "Member deleted successfully" });
}
