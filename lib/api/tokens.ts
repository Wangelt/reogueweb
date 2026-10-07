import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

function readDocumentCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export async function getAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  }

  return readDocumentCookie(ACCESS_TOKEN_COOKIE);
}
