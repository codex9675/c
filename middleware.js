import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public routes
  if (pathname.startsWith("/auth") || pathname === "/") {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // User dashboard protection
  if (pathname.startsWith("/user/")) {
    const userId = pathname.split("/")[2];
    if (token.sub !== userId) {
      return NextResponse.redirect(
        new URL(`/user/${token.sub}/dashboard`, request.url)
      );
    }
  }

  // Master routes protection
  if (pathname.startsWith("/master") && token.role !== "MASTER") {
    return NextResponse.redirect(
      new URL("/auth/login?error=Unauthorized", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
