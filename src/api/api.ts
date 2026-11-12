import { useCallback, useEffect, useState } from "react";
import type { UploadFolder } from "../lib/types";

/**
 * Browser client for the Mecatronix API (mec-api).
 * Auth is the httpOnly `admin_token` cookie, sent with `credentials: "include"`.
 * Every endpoint answers `{ success, message, data? }`; failures throw ApiError.
 */

const BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
export const CLIENT_URL: string | undefined = import.meta.env.VITE_API_CUSTOMER_BASE_URL || undefined;

export type Query = Record<string, string | number | boolean | null | undefined>;

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 when the server couldn't be reached. */
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Fired on a 401 from a signed-in request so the shell can send the admin back to sign in. */
export const UNAUTHORIZED_EVENT = "admin:unauthorized";

/** Endpoints where a 401 is an expected answer, not an expired session. */
const PUBLIC_AUTH = /^auth\/(login|check_login|forgot_password|verifyresettoken|reset_password)$/;

export function buildPath(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return `${BASE_URL}/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; query?: Query; signal?: AbortSignal } = {},
): Promise<{ message: string; data: T }> {
  const { body, query, signal } = options;
  const isForm = body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(buildPath(path, query), {
      method: options.method ?? (body === undefined ? "GET" : "POST"),
      headers: body === undefined || isForm ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      credentials: "include",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: unknown; data?: T } | null;
  if (!res.ok || json?.success === false) {
    const raw = json?.message;
    // Validation errors arrive as an array of messages
    let message = Array.isArray(raw) ? raw.join(". ") : typeof raw === "string" && raw ? raw : `Request failed (${res.status})`;
    if (res.status === 429) message = "Too many requests. Please wait a moment and try again.";
    if (res.status === 401 && !PUBLIC_AUTH.test(path)) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(message, res.status);
  }
  return { message: typeof json?.message === "string" ? json.message : "", data: json?.data as T };
}

/** Uploads one file to R2 and returns its public URL. One file per request keeps each request small. */
export async function uploadFile(file: File, folder: UploadFolder): Promise<string> {
  const form = new FormData();
  form.append("images", file);
  form.append("folder", folder);
  const { data } = await api<{ url: string }[]>("img/upload", { body: form });
  if (!data?.[0]?.url) throw new ApiError("Upload failed", 500);
  return data[0].url;
}

/**
 * Loads `path` and reloads whenever the path or query changes. `loading` is
 * derived from whether the stored result matches the current request.
 */
export function useApiData<T>(path: string | null, query?: Query) {
  const key = path ? buildPath(path, query) : null;
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{ key: string; nonce: number; data?: T; error?: string } | null>(null);

  useEffect(() => {
    if (!path || !key) return;
    const controller = new AbortController();
    api<T>(path, { query, signal: controller.signal }).then(
      ({ data }) => setResult({ key, nonce, data }),
      (error: Error) => {
        if (error.name === "AbortError") return;
        setResult((prev) => ({ key, nonce, data: prev?.key === key ? prev.data : undefined, error: error.message }));
      },
    );
    return () => controller.abort();
    // `key` already encodes path and query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  const fresh = result?.key === key;
  return {
    data: fresh ? result?.data : undefined,
    error: fresh && result?.nonce === nonce ? result?.error : undefined,
    loading: !!key && (!fresh || result?.nonce !== nonce),
    // Keeps showing the previous rows while the next page or filter loads
    stale: result?.data,
    reload: useCallback(() => setNonce((n) => n + 1), []),
  };
}
