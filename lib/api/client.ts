import { ApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/tokens";
import type { ApiErrorBody, ApiSuccess, RequestOptions } from "@/lib/api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

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

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, token, headers, ...init } = options;
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
    const envelope = parsed as ApiSuccess<T>;
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
