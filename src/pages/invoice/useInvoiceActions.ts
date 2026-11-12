import { api } from "../../api/api";
import { useFeedback } from "../../components/ui/feedback-context";
import { dialDigits, formatDate, formatMoney } from "../../lib/format";
import type { Invoice } from "../../lib/types";

/** Invoice workflow calls shared by the list and the invoice page. Each resolves true on success. */
export function useInvoiceActions() {
  const { toast, confirm } = useFeedback();

  const run = async (request: () => Promise<{ message: string }>, fallback: string) => {
    try {
      const { message } = await request();
      toast.success(message || fallback);
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    }
  };

  return {
    generateBill: (invoice: Invoice) => run(() => api(`invoice/generate-bill/${invoice.id}`, { method: "PATCH" }), "Bill generated"),

    sendEmail: async (invoice: Invoice) => {
      if (!invoice.clientEmail) {
        toast.error("Add a client email to this invoice first.");
        return false;
      }
      const ok = await confirm({
        title: "Email this invoice?",
        message: `Invoice ${invoice.invoiceNo} (${formatMoney(invoice.total)}) will be emailed to ${invoice.clientEmail}.`,
        confirmLabel: "Send email",
        tone: "primary",
      });
      return ok && run(() => api(`invoice/send-email/${invoice.id}`, { method: "POST" }), "Invoice emailed");
    },

    /** Opens WhatsApp with a prepared message, then records it as sent. */
    sendWhatsapp: async (invoice: Invoice) => {
      const phone = dialDigits(invoice.clientPhone);
      if (!phone) {
        toast.error("Add a client phone number to this invoice first.");
        return false;
      }
      const due = invoice.dueDate ? ` Due date: ${formatDate(invoice.dueDate)}.` : "";
      const text = `Hello ${invoice.clientName}, this is Mecatronix. Your invoice ${invoice.invoiceNo} for ${formatMoney(invoice.total)} is ready.${due} Thank you!`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      return run(() => api(`invoice/send-whatsapp/${invoice.id}`, { method: "PATCH" }), "Marked as sent on WhatsApp");
    },
  };
}
