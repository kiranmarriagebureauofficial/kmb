import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/server/session';

const PUBLIC_PATHS = ['/login', '/register'];
const PUBLIC_API_PREFIXES = ['/api/auth/login', '/api/auth/logout', '/api/auth/session', '/api/auth/setup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth endpoints
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow brand/static assets and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  // Allow standalone /login and /register without forcing redirect loop
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Root entry ALWAYS gates behind authentication
  if (pathname === '/') {
    const dest = session ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Protect API endpoints
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect all ERP/inventory application pages
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/.*|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)'],
};

