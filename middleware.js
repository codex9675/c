// middleware.js or middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/user',
  '/dashboard',
  '/uploadProduct',
  '/portfolio',
];

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Allow public paths (static, api, auth pages, etc.)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/uploads') ||
    pathname === '/' ||
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register')
  ) {
    return NextResponse.next();
  }

  // No token? Redirect to login page
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); // optional: return to original path
    return NextResponse.redirect(loginUrl);
  }

  // If MASTER user, always allow
  if (token.role === 'MASTER') {
    return NextResponse.next();
  }

  // Admin route restriction based on expiration
  if (token.role === 'ADMIN' && token.passwordExpires) {
    const isExpired = new Date(token.passwordExpires) < new Date();
    if (isExpired) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Account expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /master routes
  if (pathname.startsWith('/master') && token.role !== 'MASTER') {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Optional: protect user routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Middleware applies to all routes
export const config = {
  matcher: ['/((?!_next|api/auth|auth|uploads|favicon.ico).*)'],
};
