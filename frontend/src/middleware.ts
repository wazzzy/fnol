import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  claimant: ["/report"],
  adjuster: ["/claims"],
  manager: ["/pipeline"],
  cxo: ["/dashboard"],
};

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: { user?: { role?: string } } | null };
  const pathname = nextUrl.pathname;

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Not authenticated
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role as string | undefined;

  // Role-based protection
  for (const [allowedRole, paths] of Object.entries(ROLE_ROUTES)) {
    for (const path of paths) {
      if (pathname.startsWith(path) && role !== allowedRole) {
        // Redirect to the user's own home
        const home = ROLE_ROUTES[role ?? ""]?.[0] ?? "/login";
        return NextResponse.redirect(new URL(home, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
