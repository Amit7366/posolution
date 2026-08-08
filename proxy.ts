import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public marketing/content routes — allowed with or without auth
const publicRoutes = [
  "/",
  "/about",
  "/our-plan",
  "/blog",
  "/contact",
];

const authPages = ["/login", "/register"];

function isPublicPath(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // No token: allow public pages, otherwise require login
  if (!accessToken) {
    if (isPublicPath(pathname) || authPages.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Invalid token cookie → clear path by sending to login (avoid silent loops)
  let role: string | undefined;
  try {
    const decoded = jwtDecode(accessToken) as { role?: string };
    role = decoded?.role;
  } catch {
    if (isPublicPath(pathname) || authPages.includes(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users should not stay on auth pages
  if (authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public pages are fine while logged in (home, about, etc.)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // POS: any authenticated role
  if (pathname.startsWith("/pos")) {
    return NextResponse.next();
  }

  // Dashboard role gates
  if (pathname.startsWith("/dashboard")) {
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin" && role !== "superAdmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/dashboard/user")) {
      if (role !== "user") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // Matched but unhandled path — never redirect to self
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/about",
    "/our-plan",
    "/blog",
    "/contact",
    "/dashboard",
    "/dashboard/:path*",
    "/pos",
    "/pos/:path*",
  ],
};
