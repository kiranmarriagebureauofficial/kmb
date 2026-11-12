import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { StaffUser } from '../types';
import { getActiveUserById } from './auth-db';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

export async function getServerSessionUser(): Promise<StaffUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return getActiveUserById(payload.userId);
}

export async function requireServerSessionUser(): Promise<StaffUser> {
  const user = await getServerSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdminUserApi(): Promise<
  { ok: true; user: StaffUser } | { ok: false; response: NextResponse }
> {
  const user = await getServerSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }
  if (user.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }),
    };
  }
  return { ok: true, user };
}

export function isHttpsRequest(req: Request): boolean {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0].trim() === 'https';
  }
  return req.url.startsWith('https://');
}

