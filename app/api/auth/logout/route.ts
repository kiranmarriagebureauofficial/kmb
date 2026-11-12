import { NextResponse } from 'next/server';
import { isHttpsRequest } from '@/lib/server/auth-helpers';
import { SESSION_COOKIE_NAME } from '@/lib/server/session';

export async function POST(req: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isHttpsRequest(req),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

