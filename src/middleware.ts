import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'wb_admin_access_token';
const REFRESH_COOKIE = 'wb_admin_refresh_token';
const ROLE_COOKIE = 'wb_admin_role';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

const getRoleFromAccessToken = (token?: string) => {
  if (!token) return '';

  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(normalized)) as {
      app_metadata?: { role?: unknown };
    };
    return typeof decoded.app_metadata?.role === 'string' ? decoded.app_metadata.role : '';
  } catch {
    return '';
  }
};

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const hasSession = Boolean(accessToken || request.cookies.has(REFRESH_COOKIE));
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (isDashboardRoute && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = request.cookies.get(ROLE_COOKIE)?.value || getRoleFromAccessToken(accessToken);
  if (!isDashboardRoute && ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();
  if (
    isDashboardRoute ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/error/') ||
    pathname.startsWith('/coming-soon')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
