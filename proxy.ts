import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require auth
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/our-plan",
  "/blog",
  "/contact",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Allow public routes without token
  if (!accessToken) {
    const isPublic = publicRoutes.some((route) => pathname === route);
    if (isPublic) {
      return NextResponse.next();
    }
    // Not public and no token → send to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if (["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard: require valid token; sidebar links stay /dashboard/... (no forced /dashboard/user).
  if (pathname.startsWith("/dashboard")) {
    let decodedData: { role?: string } | null = null;
    try {
      decodedData = jwtDecode(accessToken) as { role?: string };
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = decodedData?.role;
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Optional admin-area page: only admin / superAdmin
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin" && role !== "superAdmin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // User-specific stub page
    if (pathname.startsWith("/dashboard/user")) {
      if (role !== "user") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // POS routes (products, category, sales, etc.): any authenticated role
    return NextResponse.next();
  }

  // Fallback for any other non-public route.
  return NextResponse.redirect(new URL("/", request.url));
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
  ],
};
