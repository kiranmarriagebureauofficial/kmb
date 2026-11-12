import { NextResponse } from 'next/server';
import { authenticateUser, isSetupRequired } from '@/lib/server/auth-db';
import { isHttpsRequest } from '@/lib/server/auth-helpers';
import { createSessionToken, getCookieOptions, SESSION_COOKIE_NAME } from '@/lib/server/session';

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(req: Request, email: string): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  return `${forwarded}:${email.toLowerCase()}`;
}

function isRateLimited(key: string): boolean {
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export async function POST(req: Request) {
  try {
    if (isSetupRequired()) {
      return NextResponse.json(
        { error: 'Admin account setup is required first.', code: 'SETUP_REQUIRED' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.', code: 'INVALID_CREDENTIALS' },
        { status: 400 }
      );
    }

    const limitKey = getRateLimitKey(req, email);
    if (isRateLimited(limitKey)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 15 minutes and try again.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const result = authenticateUser(email, password);
    if (!result.ok) {
      recordFailure(limitKey);
      const status = result.code === 'INVALID_CREDENTIALS' ? 401 : 403;
      const messages: Record<typeof result.code, string> = {
        INVALID_CREDENTIALS: 'Invalid email or password.',
        PENDING_APPROVAL: 'Your account is awaiting Administrator approval.',
        REJECTED: 'Your account request has been declined by the Administrator.',
        DISABLED: 'Your account has been disabled by the Administrator.',
      };
      return NextResponse.json({ error: messages[result.code], code: result.code }, { status });
    }

    failedAttempts.delete(limitKey);
    const token = createSessionToken(result.user.id, result.user.role);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(isHttpsRequest(req)));
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid login payload.' }, { status: 400 });
  }
}
