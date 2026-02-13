import { jwtDecode } from 'jwt-decode';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Role = keyof typeof roleBasedPrivateRoutes;

// 🔧 Renamed and expanded to cover all public routes
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/our-plan',
  '/blog',
  '/contact',
];

const commonPrivateRoutes = [
  '/dashboard',
  '/dashboard/change-password',
  '/doctors',
];

const roleBasedPrivateRoutes = {
  USER: [/^\/dashboard\/user/],
  DOCTOR: [/^\/dashboard\/doctor/],
  ADMIN: [/^\/dashboard\/admin/],
  SUPER_ADMIN: [/^\/dashboard\/super-admin/],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // 🔧 Allow public routes without token
  if (!accessToken) {
    const isPublic = publicRoutes.some((route) => pathname === route);
    if (isPublic) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ✅ Redirect logged-in users away from public auth pages
  if (accessToken && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Allow access to common private routes
  if (
    commonPrivateRoutes.includes(pathname) ||
    commonPrivateRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // ✅ Role-based access
  let decodedData: any = null;
  try {
    decodedData = jwtDecode(accessToken);
  } catch (e) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = decodedData?.role;
  if (role && roleBasedPrivateRoutes[role as Role]) {
    const roleRoutes = roleBasedPrivateRoutes[role as Role];
    if (roleRoutes.some((regex) => regex.test(pathname))) {
      return NextResponse.next();
    }
  }

  // ❌ No match — redirect to homepage
  return NextResponse.redirect(new URL('/', request.url));
}

// 🔧 Updated matcher to include your public and protected routes
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/about',
    '/our-plan',
    '/blog',
    '/contact',
    '/dashboard/:path*',
    '/doctors/:path*',
  ],
};
