import { ApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/tokens";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import type { ApiErrorBody, ApiSuccess, RequestOptions } from "@/lib/api/types";

const API_BASE =
  typeof window === "undefined"
    ? `${(process.env.API_URL ?? "http://localhost:5000").replace(/\/$/, "")}/api/v1`
    : (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1");

function joinUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match?.[1]) return undefined;
  const value = decodeURIComponent(match[1]);
  if (!value || value === "undefined" || value === "null") return undefined;
  return value;
}

function writeAuthCookies(accessToken: string, refreshToken: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax; Max-Age=900`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/; SameSite=Lax; Max-Age=604800`;
}

let refreshInFlight: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = readBrowserCookie(REFRESH_TOKEN_COOKIE);
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(joinUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });
      if (!res.ok) return null;
      const parsed = (await res.json()) as { data?: { accessToken?: string; refreshToken?: string } };
      const tokens = parsed?.data;
      if (!tokens?.accessToken || !tokens?.refreshToken) return null;
      writeAuthCookies(tokens.accessToken, tokens.refreshToken);
      return tokens.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

type InternalOptions = RequestOptions & { _retried?: boolean };

export async function apiClient<T>(
  path: string,
  options: InternalOptions = {},
): Promise<T> {
  const { body, auth = true, token, headers, _retried, ...init } = options;
  const accessToken = token ?? (auth ? await getAccessToken() : undefined);

  const response = await fetch(joinUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const parsed = await parseBody(response);

  if (
    response.status === 401 &&
    !_retried &&
    auth &&
    typeof window !== "undefined" &&
    !path.startsWith("/auth/")
  ) {
    const newAccessToken = await attemptRefresh();
    if (newAccessToken) {
      return apiClient<T>(path, { ...options, _retried: true, token: newAccessToken });
    }
  }

  if (!response.ok) {
    const errorBody = parsed as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      errorBody?.error?.code ?? "REQUEST_FAILED",
      errorBody?.error?.message ?? response.statusText,
      errorBody?.requestId,
      errorBody?.error?.details,
    );
  }

  if (parsed && typeof parsed === "object" && "success" in parsed) {
    const envelope = parsed as ApiSuccess<T> & { data: unknown };
    if (Array.isArray(envelope.data) && envelope.meta) {
      return {
        data: envelope.data,
        pagination: envelope.meta,
      } as T;
    }
    return envelope.data;
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiClient<T>(path, { ...options, method: "DELETE" }),
};
