import { NextResponse } from 'next/server';
import { createUserByAdmin, listAllUsers } from '@/lib/server/auth-db';
import { requireAdminUserApi } from '@/lib/server/auth-helpers';

export async function GET() {
  const guard = await requireAdminUserApi();
  if (!guard.ok) return guard.response;

  const users = listAllUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const guard = await requireAdminUserApi();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const result = createUserByAdmin(guard.user, {
      name: String(body?.name || ''),
      email: String(body?.email || ''),
      password: String(body?.password || ''),
      role: body?.role === 'admin' ? 'admin' : 'staff',
      phone: body?.phone ? String(body.phone) : '',
      approvalStatus: body?.approvalStatus === 'pending' ? 'pending' : 'approved',
      permissions: body?.permissions,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid user payload.' }, { status: 400 });
  }
}

