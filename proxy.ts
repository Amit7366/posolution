import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = keyof typeof roleBasedPrivateRoutes;

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

// Any path that starts with /dashboard is protected
const commonPrivateRoutes = ["/dashboard"];

const roleBasedPrivateRoutes = {
  USER: [/^\/dashboard\/user/],
  DOCTOR: [/^\/dashboard\/doctor/],
  ADMIN: [/^\/dashboard\/admin/],
  SUPER_ADMIN: [/^\/dashboard\/super-admin/],
};

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

  // Allow access to /dashboard and any nested routes when logged in
  if (
    commonPrivateRoutes.includes(pathname) ||
    commonPrivateRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Optional: role-based access if you need it
  let decodedData: any = null;
  try {
    decodedData = jwtDecode(accessToken);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = decodedData?.role;
  if (role && roleBasedPrivateRoutes[role as Role]) {
    const roleRoutes = roleBasedPrivateRoutes[role as Role];
    if (roleRoutes.some((regex) => regex.test(pathname))) {
      return NextResponse.next();
    }
  }

  // Fallback: redirect unknown private paths to home
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
    "/dashboard/:path*",
  ],
};
