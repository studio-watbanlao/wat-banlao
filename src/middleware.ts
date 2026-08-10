import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'wb_admin_access_token';
const REFRESH_COOKIE = 'wb_admin_refresh_token';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
