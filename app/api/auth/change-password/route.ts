import { NextResponse } from 'next/server';
import { updateOwnCredentials } from '@/lib/server/auth-db';
import { getServerSessionUser } from '@/lib/server/auth-helpers';

export async function POST(req: Request) {
  const sessionUser = await getServerSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = updateOwnCredentials(sessionUser.id, {
      currentPassword: String(body?.currentPassword || ''),
      newName: body?.newName !== undefined ? String(body.newName) : undefined,
      newEmail: body?.newEmail !== undefined ? String(body.newEmail) : undefined,
      newPassword: body?.newPassword ? String(body.newPassword) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

