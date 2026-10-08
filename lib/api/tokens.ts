import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

function readDocumentCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function sanitize(value: string | undefined): string | undefined {
  if (!value || value === "undefined" || value === "null") return undefined;
  return value;
}

export async function getAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    return sanitize((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
  }

  return sanitize(readDocumentCookie(ACCESS_TOKEN_COOKIE));
}
