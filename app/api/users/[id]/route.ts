import { NextResponse } from 'next/server';
import { deleteUserByAdmin, updateUserByAdmin } from '@/lib/server/auth-db';
import { requireAdminUserApi } from '@/lib/server/auth-helpers';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUserApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  try {
    const body = await req.json();
    const result = updateUserByAdmin(id, guard.user, {
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      role: body?.role,
      active: typeof body?.active === 'boolean' ? body.active : undefined,
      approvalStatus: body?.approvalStatus,
      permissions: body?.permissions,
      newPassword: body?.newPassword,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminUserApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const result = deleteUserByAdmin(id, guard.user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

