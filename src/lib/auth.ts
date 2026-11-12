import { ApiError } from "../api/api";

/** Turns an auth request failure into a sentence an admin can act on. */
export function describeAuthError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Too many attempts. Please wait a few minutes before trying again.";
    if (error.status >= 500) return "The server ran into a problem. Please try again shortly.";
    return error.message || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Only in-app admin paths are valid return targets after sign-in. */
export const safeNext = (value: string | null) =>
  value && value.startsWith("/mec-admin") && !value.startsWith("//") ? value : "/mec-admin";

const REMEMBER_KEY = "mecatronix-admin:email";

/** Last email used to sign in, when the admin opted to be remembered. */
export const rememberedEmail = {
  get(): string {
    try {
      return localStorage.getItem(REMEMBER_KEY) ?? "";
    } catch {
      return "";
    }
  },
  set(email: string | null) {
    try {
      if (email) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* storage unavailable (private mode): nothing to remember */
    }
  },
};

/** Password rules shared by the reset form and its checklist (server minimum is 8). */
export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "A number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/** 0–4: how many password rules are met. */
export const passwordScore = (value: string) => passwordRules.filter((rule) => rule.test(value)).length;
