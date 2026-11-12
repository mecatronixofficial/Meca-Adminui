const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

const parse = (value?: string | null) => {
  if (!value) return null;
  // Plain dates ("2026-10-31") are calendar days, not UTC midnight
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+05:30`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value?: string | null) => {
  const date = parse(value);
  return date ? dateFormat.format(date) : "—";
};

export const formatDateTime = (value?: string | null) => {
  const date = parse(value);
  return date ? dateTimeFormat.format(date) : "—";
};

export const formatMoney = (value: number) => money.format(Number.isFinite(value) ? value : 0);

export const formatCompact = (value: number) => compact.format(value);

/** "3 min ago", "2 days ago", or the date once it's over a week old. */
export function timeAgo(value?: string | null) {
  const date = parse(value);
  if (!date) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

/** ISO timestamp -> value for <input type="datetime-local"> in the browser's zone. */
export function toLocalInput(value?: string | null) {
  const date = parse(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Today as YYYY-MM-DD in India. */
export const todayIso = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const round2 = (value: number) => Math.round(value * 100) / 100;

/** Adds https:// to bare domains such as "example.com". */
export const externalHref = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

/** Digits for wa.me / sms links; 10-digit Indian numbers get the 91 prefix. */
export const dialDigits = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
};
