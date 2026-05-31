import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  RESIDENT: "/dashboard/resident",
  GUARD: "/dashboard/guard",
};

// Identity forwarded to route handlers / server pages so they don't have to
// re-call auth.getUser() + the Profile DB lookup. Always stripped from the
// incoming request and re-set from the verified user to prevent spoofing.
const IDENTITY_HEADERS = [
  "x-user-id",
  "x-user-email",
  "x-user-role",
  "x-user-name",
  "x-user-unit",
  "x-user-created",
] as const;

/**
 * Forwards the verified identity (or strips it, when unauthenticated) onto the
 * request the downstream handler sees, while preserving the refreshed Supabase
 * session cookies carried on `baseResponse`.
 */
function passThroughWithIdentity(
  request: NextRequest,
  baseResponse: NextResponse,
  user: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, unknown> } | null
) {
  const requestHeaders = new Headers(request.headers);
  IDENTITY_HEADERS.forEach((h) => requestHeaders.delete(h));

  if (user) {
    const meta = user.user_metadata ?? {};
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");
    requestHeaders.set("x-user-role", (meta.role as string) ?? "");
    requestHeaders.set("x-user-name", (meta.fullName as string) ?? "");
    requestHeaders.set("x-user-unit", (meta.unitNumber as string) ?? "");
    requestHeaders.set("x-user-created", user.created_at ?? "");
  }

  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
  baseResponse.headers
    .getSetCookie()
    .forEach((cookie) => finalResponse.headers.append("set-cookie", cookie));
  return finalResponse;
}

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * authentication + role-based routing for /dashboard/* and /api/* routes.
 * Role is read from auth user_metadata to remain edge-runtime compatible.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApi =
    pathname.startsWith("/api") && !pathname.startsWith("/api/auth");

  // Unauthenticated access to protected areas.
  if (!user) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }
    return passThroughWithIdentity(request, response, null);
  }

  const role = (user.user_metadata?.role as string | undefined) ?? "";
  const home = ROLE_HOME[role] ?? "/auth/signin";

  // Signed-in users shouldn't sit on auth pages.
  if (isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Role-based dashboard guard: users with an unknown/missing role are treated
  // as unauthorised and sent to sign-in. Valid users are redirected to their
  // own area if they try to access another role's dashboard.
  if (isDashboard) {
    const allowedPrefix = ROLE_HOME[role];
    if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return passThroughWithIdentity(request, response, user);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/auth/:path*"],
};
