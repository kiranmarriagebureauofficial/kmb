import { NextResponse } from 'next/server';
import { setupMasterAdmin } from '@/lib/server/auth-db';
import { isHttpsRequest } from '@/lib/server/auth-helpers';
import { createSessionToken, getCookieOptions, SESSION_COOKIE_NAME } from '@/lib/server/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body || {};

    const result = setupMasterAdmin({
      name: String(name || ''),
      email: String(email || ''),
      password: String(password || ''),
      phone: phone ? String(phone) : '',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const token = createSessionToken(result.user.id, result.user.role);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(isHttpsRequest(req)));
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}

