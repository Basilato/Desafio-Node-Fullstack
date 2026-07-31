import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE = 'localis_session_present';

const PUBLIC_ROUTES = ['/login', '/_next', '/favicon.ico', '/api', '/fonts', '/images'];
const ROOT_ONLY_PUBLIC = ['/'];
const LOGIN_URL = '/login';

function isPublic(url: URL): boolean {
  const path = url.pathname;
  if (PUBLIC_ROUTES.some((p) => path === p || path.startsWith(`${p}/`))) return true;
  if (ROOT_ONLY_PUBLIC.includes(path)) return true;
  if (path === '/locais' || path.startsWith('/locais/')) {
    if (path === '/locais/new' || path === '/locais/novo' || path.endsWith('/edit')) return false;
    return true;
  }
  if (path === '/eventos' || path.startsWith('/eventos/')) {
    if (path === '/eventos/new' || path === '/eventos/novo' || path.endsWith('/edit')) return false;
    return true;
  }
  return false;
}

function hasSession(request: NextRequest): boolean {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  return Boolean(value && value === '1');
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/locais/:path*',
    '/eventos/:path*',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname, origin, search } = request.nextUrl;

  const authenticated = hasSession(request);
  const url = request.nextUrl;

  const onLogin = pathname === LOGIN_URL;
  if (onLogin) {
    if (authenticated) {
      const dest = new URL('/', origin);
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  if (!isPublic(url) && !authenticated) {
    const redirectTo = new URL(LOGIN_URL, origin);
    const current = `${pathname}${search ?? ''}`;
    if (pathname !== '/') redirectTo.searchParams.set('redirect', current);
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.next();
}
