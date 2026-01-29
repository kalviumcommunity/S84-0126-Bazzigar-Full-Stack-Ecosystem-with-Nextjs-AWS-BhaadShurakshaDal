import { NextResponse } from 'next/server';

type User = {
  id: number;
  name: string;
};

let users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

/**
 * GET /api/users
 * GET /api/users?id=1
 * GET /api/users?page=1&limit=10
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get('id');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  // Get user by ID
  if (id) {
    const user = users.find(u => u.id === Number(id));
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  return NextResponse.json({
    page,
    limit,
    total: users.length,
    data: users.slice(start, end)
  });
}

/**
 * POST /api/users
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: Date.now(),
      name: body.name
    };

    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/users?id=1
 */
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const body = await req.json();
  const index = users.findIndex(u => u.id === Number(id));

  if (index === -1) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  users[index] = { ...users[index], ...body };
  return NextResponse.json(users[index]);
}

/**
 * DELETE /api/users?id=1
 */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const index = users.findIndex(u => u.id === Number(id));

  if (index === -1) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  users.splice(index, 1);

  return NextResponse.json(
    { message: 'User deleted successfully' },
    { status: 200 }
  );
}
