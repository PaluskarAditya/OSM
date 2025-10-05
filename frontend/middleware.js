import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || ""; // e.g., evaluate.nexa.intelbuzz.in
  const hostParts = host.split(".");
  
  // Get the subdomain (first part)
  const subdomain = hostParts.length > 2 ? hostParts[0] : null;

  // Skip static and internal Next.js assets
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.startsWith("/api") ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Only rewrite if subdomain is "evaluate"
  if (subdomain === "evaluate") {
    // Rewrite to the main domain (remove subdomain)
    const mainDomain = hostParts.slice(1).join("."); // nexa.intelbuzz.in
    url.hostname = mainDomain;

    // Prepend /evaluate if it's not already in the path
    if (!url.pathname.startsWith("/evaluate")) {
      url.pathname = `/evaluate${url.pathname}`;
    }

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
