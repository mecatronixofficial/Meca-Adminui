import { isRouteErrorResponse } from "react-router-dom";
import { ApiError } from "../api/api";

/** What went wrong, from the admin's point of view. Each kind has its own error screen. */
export type ErrorKind = "not-found" | "forbidden" | "unauthorized" | "offline" | "outdated" | "unavailable" | "server";

/** Raised by the browser when a lazy page chunk is gone, typically because a new version was deployed. */
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|ChunkLoadError|Loading chunk [\w-]+ failed/i;

export const isChunkLoadError = (error: unknown) => error instanceof Error && CHUNK_ERROR.test(error.message);

/** HTTP-style status for an error thrown by a route, a loader or the API client. */
export function errorStatus(error: unknown): number | undefined {
  if (isRouteErrorResponse(error)) return error.status;
  if (error instanceof ApiError) return error.status;
  return undefined;
}

export function classifyError(error: unknown, statusCode?: number): ErrorKind {
  if (isChunkLoadError(error)) return "outdated";
  const status = statusCode ?? errorStatus(error);
  if (status === 0 || (typeof navigator !== "undefined" && !navigator.onLine && error)) return "offline";
  if (status === 404) return "not-found";
  if (status === 403) return "forbidden";
  if (status === 401) return "unauthorized";
  if (status === 502 || status === 503 || status === 504) return "unavailable";
  return "server";
}

/** A readable message for the developer details panel. */
export function errorDetails(error: unknown): string | undefined {
  if (!error) return undefined;
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}${error.data ? `\n${typeof error.data === "string" ? error.data : JSON.stringify(error.data, null, 2)}` : ""}`;
  if (error instanceof Error) return error.stack || `${error.name}: ${error.message}`;
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

const RELOAD_KEY = "mecatronix-admin:chunk-reload";

/**
 * Reloads once to pick up a newly deployed version. Returns false (and does nothing) when a
 * reload already happened in the last 30 seconds, so a broken deploy can't loop forever.
 */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage unavailable: fall through and reload once */
  }
  window.location.reload();
  return true;
}
