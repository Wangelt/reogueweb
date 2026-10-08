import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { isAuthPage, isProtectedPath } from "@/lib/proxy/routes";

export function handleAuthProxy(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  const tokenValue = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasAccessToken = Boolean(tokenValue && tokenValue !== "undefined" && tokenValue !== "null");

  if (isProtectedPath(pathname) && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return undefined;
}
