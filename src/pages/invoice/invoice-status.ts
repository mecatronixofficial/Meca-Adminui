import type { Tone } from "../../components/ui/ui";
import type { InvoiceStatus } from "../../lib/types";

export const STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  bill_generated: { label: "Bill generated", tone: "info" },
  sent: { label: "Sent", tone: "accent" },
  paid: { label: "Paid", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

/** Next number after the latest one: "MEC-2026-014" -> "MEC-2026-015". */
export function nextInvoiceNo(latest?: string) {
  const year = new Date().getFullYear();
  if (!latest) return `MEC-${year}-001`;
  const match = latest.match(/^(.*?)(\d+)$/);
  if (!match) return `${latest}-2`;
  const [, prefix, digits] = match;
  return `${prefix}${String(Number(digits) + 1).padStart(digits.length, "0")}`;
}
