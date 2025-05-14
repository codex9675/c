import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get token and user role
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Skip expiration check for MASTER account
  if (token?.role === 'MASTER') {
    return NextResponse.next();
  }

  // Check for expired ADMIN accounts (skip regular USER accounts)
  if (token?.role === 'ADMIN' && token.passwordExpires) {
    const isExpired = new Date(token.passwordExpires) < new Date();
    if (isExpired) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Account expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect routes under /master - only accessible by MASTER role
  if (pathname.startsWith('/master') && token?.role !== 'MASTER') {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
