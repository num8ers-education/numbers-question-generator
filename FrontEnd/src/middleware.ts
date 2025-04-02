// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/forgot-password"];

  // Admin-only paths
  const adminPaths = ["/users", "/admin"];

  // Teacher and admin paths
  const teacherAdminPaths = [
    "/questions/create",
    "/curricula/create",
  
  ];

  // Helper function to check if the path starts with any of the given prefixes
  const pathStartsWith = (path: string, prefixes: string[]) => {
    return prefixes.some((prefix) => path.startsWith(prefix));
  };

  // Get user role from token if available
  const getUserRole = (token: string) => {
    try {
      // This is a very simple implementation
      // In a real app, you'd likely need to decode the JWT token properly
      // and possibly check with your backend
      if (token.includes("admin")) return "admin";
      if (token.includes("teacher")) return "teacher";
      return "student";
    } catch (err) {
      return null;
    }
  };

  // If the path is public, allow access regardless of auth state
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && !publicPaths.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If has token, check role-based access
  if (token) {
    const role = getUserRole(token);

    // Admin-only paths check
    if (pathStartsWith(path, adminPaths) && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Teacher/admin paths check
    if (
      pathStartsWith(path, teacherAdminPaths) &&
      role !== "admin" &&
      role !== "teacher"
    ) {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }

    // Student paths check
    if (path.startsWith("/student") && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Allow access to the requested route
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
