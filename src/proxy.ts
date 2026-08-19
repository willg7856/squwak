import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/home", "/journal", "/bookmarks", "/settings"];

function secretKey() {
  const secret = process.env.SESSION_SECRET ?? "dev-squwak-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get("squwak_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, secretKey());
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/home/:path*",
    "/home",
    "/journal/:path*",
    "/journal",
    "/bookmarks/:path*",
    "/bookmarks",
    "/settings/:path*",
    "/settings",
  ],
};
