import { FileCheck2, FileText, MessageCircle, Receipt, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiData } from "../../api/api";
import type { Values } from "../../components/ui/fields";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { IconButton, Stack } from "../../components/ui/ui";
import { formatDate, formatMoney, round2, todayIso } from "../../lib/format";
import type { Invoice as InvoiceItem, Paginated } from "../../lib/types";
import { nextInvoiceNo, STATUS } from "./invoice-status";
import StatusBadge from "./StatusBadge";
import { useInvoiceActions } from "./useInvoiceActions";

/** Same maths as the API: rows without a description are dropped. */
function totals(values: Values) {
  const items = ((values.items as Values[]) ?? []).filter((item) => String(item.desc ?? "").trim());
  const subtotal = round2(items.reduce((sum, item) => sum + round2(Math.max(Number(item.qty) || 0, 0) * Math.max(Number(item.rate) || 0, 0)), 0));
  return { count: items.length, subtotal };
}

export default function Invoice() {
  const actions = useInvoiceActions();
  const [refreshKey, setRefreshKey] = useState(0);
  const after = (ok: boolean) => ok && setRefreshKey((k) => k + 1);
  // Newest invoice, to suggest the next number
  const latest = useApiData<Paginated<InvoiceItem>>("invoice/all", { page: 1, limit: 1 });

  const config: ResourceConfig<InvoiceItem> = {
    title: "Invoices",
    noun: "invoice",
    description: "Create invoices, then generate the bill and send it by email or WhatsApp.",
    listPath: "invoice/all",
    createPath: "invoice/add",
    updatePath: (row) => `invoice/edit/${row.id}`,
    deletePath: (row) => `invoice/delete/${row.id}`,
    label: (row) => `Invoice ${row.invoiceNo}`,
    onChange: latest.reload,
    searchPlaceholder: "Search number, client, email",
    filters: [{ name: "status", label: "Status", options: Object.entries(STATUS).map(([value, { label }]) => ({ value, label })) }],
    formSize: "xl",
    emptyIcon: <Receipt aria-hidden />,
    emptyHint: "Create an invoice, generate the bill, then send it to the client.",
    fields: [
      { name: "invoiceNo", label: "Invoice number", type: "text", required: true, placeholder: "e.g. MEC-2026-014" },
      { name: "clientName", label: "Client name", type: "text", required: true },
      { name: "invoiceDate", label: "Invoice date", type: "date", required: true },
      { name: "dueDate", label: "Due date", type: "date", nullable: true },
      { name: "clientEmail", label: "Client email", type: "email", hint: "Needed to send the invoice by email." },
      { name: "clientPhone", label: "Client phone", type: "tel", hint: "With country code, for WhatsApp (e.g. 91 98765 43210)." },
      {
        name: "items",
        label: "Items",
        type: "group",
        itemLabel: "Item",
        addLabel: "Add item",
        required: true,
        min: 1,
        fields: [
          { name: "desc", label: "Description", type: "text", required: true, wide: true },
          { name: "qty", label: "Quantity", type: "number", min: 0, step: 0.01, required: true },
          { name: "rate", label: "Rate (₹)", type: "number", min: 0, step: 0.01, required: true },
        ],
      },
      { name: "notes", label: "Notes", type: "textarea", rows: 3, placeholder: "Payment terms, bank details…" },
    ],
    defaults: {
      invoiceNo: nextInvoiceNo(latest.data?.items[0]?.invoiceNo),
      invoiceDate: todayIso(),
      items: [{ desc: "", qty: "1", rate: "" }],
    },
    formExtra: (values) => {
      const { count, subtotal } = totals(values);
      return (
        <div className="flex items-center justify-between rounded-xl bg-ink px-5 py-4 text-white">
          <span className="text-sm text-white/70">
            {count} item{count === 1 ? "" : "s"}
          </span>
          <span className="text-right">
            <span className="block text-xs text-white/60">Total</span>
            <span className="font-display text-2xl font-semibold tabular-nums">{formatMoney(subtotal)}</span>
          </span>
        </div>
      );
    },
    columns: [
      {
        header: "Invoice",
        cell: (row) => (
          <Link to={`/mec-admin/invoice/${row.id}`} className="block hover:text-accent-ink">
            <Stack primary={row.invoiceNo} secondary={formatDate(row.invoiceDate)} />
          </Link>
        ),
      },
      { header: "Client", cell: (row) => <Stack primary={row.clientName} secondary={row.clientEmail || row.clientPhone} /> },
      {
        header: "Total",
        cell: (row) => <span className="font-medium whitespace-nowrap text-ink tabular-nums">{formatMoney(row.total)}</span>,
        className: "text-right",
      },
      { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
      { header: "Due", cell: (row) => formatDate(row.dueDate), className: "hidden lg:table-cell whitespace-nowrap" },
    ],
    rowActions: (row) => (
      <>
        <Link
          to={`/mec-admin/invoice/${row.id}`}
          title="View & print"
          aria-label={`View invoice ${row.invoiceNo}`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-ink hover:bg-paper hover:text-ink"
        >
          <FileText className="size-4" />
        </Link>
        {row.status === "draft" && (
          <IconButton label="Generate bill" onClick={async () => after(await actions.generateBill(row))}>
            <FileCheck2 className="size-4" />
          </IconButton>
        )}
        <IconButton label={row.clientEmail ? "Send by email" : "No client email"} disabled={!row.clientEmail} onClick={async () => after(await actions.sendEmail(row))}>
          <Send className="size-4" />
        </IconButton>
        <IconButton
          label={row.clientPhone ? "Send on WhatsApp" : "No client phone"}
          disabled={!row.clientPhone}
          onClick={async () => after(await actions.sendWhatsapp(row))}
        >
          <MessageCircle className="size-4" />
        </IconButton>
      </>
    ),
  };

  return <ResourcePage config={config} refreshKey={refreshKey} />;
}
