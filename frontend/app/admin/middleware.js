import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const permsCookie = req.cookies.get("perms")?.value;

  // If not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Only enforce for observer
  if (role === "Observer") {
    let allowedRoutes = [];

    try {
      allowedRoutes = permsCookie ? JSON.parse(permsCookie) : [];
    } catch {
      allowedRoutes = [];
    }

    const hasAccess = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!hasAccess) {
      // Rewrite → shows not-found UI but URL stays same
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
  }

  return NextResponse.next();
}
