import { ArrowLeft, FileCheck2, MessageCircle, Printer, Send } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useApiData } from "../../api/api";
import logo from "../../assets/logos/mecatronix-logo.png";
import { Button, Card, ErrorState, Spinner } from "../../components/ui/ui";
import { useCompany } from "../../api/useCompany";
import { formatDate, formatDateTime, formatMoney } from "../../lib/format";
import type { Invoice } from "../../lib/types";
import StatusBadge from "./StatusBadge";
import { useInvoiceActions } from "./useInvoiceActions";

/** Printable invoice. Browser "Print" (or Save as PDF) prints only the sheet. */
export default function InvoiceView() {
  const { id = "" } = useParams();
  const invoice = useApiData<Invoice>(`invoice/${id}`);
  const actions = useInvoiceActions();
  const company = useCompany();
  const inv = invoice.data;
  const after = (ok: boolean) => ok && invoice.reload();

  useEffect(() => {
    if (inv) document.title = `Invoice ${inv.invoiceNo} · Mecatronix Admin`;
  }, [inv]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/mec-admin/invoice" className="inline-flex items-center gap-1.5 text-sm text-muted-ink hover:text-ink">
          <ArrowLeft className="size-4" /> All invoices
        </Link>
        {inv && (
          <div className="flex flex-wrap gap-2">
            {inv.status === "draft" && (
              <Button variant="secondary" icon={<FileCheck2 className="size-4" />} onClick={async () => after(await actions.generateBill(inv))}>
                Generate bill
              </Button>
            )}
            <Button variant="secondary" icon={<Send className="size-4" />} disabled={!inv.clientEmail} onClick={async () => after(await actions.sendEmail(inv))}>
              Email
            </Button>
            <Button
              variant="secondary"
              icon={<MessageCircle className="size-4" />}
              disabled={!inv.clientPhone}
              onClick={async () => after(await actions.sendWhatsapp(inv))}
            >
              WhatsApp
            </Button>
            <Button icon={<Printer className="size-4" />} onClick={() => window.print()}>
              Print / PDF
            </Button>
          </div>
        )}
      </div>

      {invoice.error ? (
        <Card>
          <ErrorState message={invoice.error} onRetry={invoice.reload} />
        </Card>
      ) : !inv ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-ink print:hidden">
            <StatusBadge status={inv.status} />
            {inv.billGeneratedAt && <span>Bill generated {formatDateTime(inv.billGeneratedAt)}</span>}
            {inv.sentAt && (
              <span>
                Sent {formatDateTime(inv.sentAt)} via {[inv.sentBy?.email && "email", inv.sentBy?.whatsapp && "WhatsApp"].filter(Boolean).join(" & ")}
              </span>
            )}
          </div>

          <article className="mx-auto max-w-[210mm] rounded-2xl border border-line bg-white p-8 shadow-soft sm:p-12 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row print:flex-row">
              <div>
                <img src={logo} alt="" width={292} height={352} className="h-10 w-auto" />
                <p className="mt-3 font-display text-lg font-semibold text-ink">{company.legalName}</p>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-ink">{company.address}</p>
                <p className="text-sm text-muted-ink">
                  {company.email} · {company.phoneDisplay}
                </p>
              </div>
              <div className="sm:text-right print:text-right">
                <p className="font-display text-3xl font-semibold tracking-tight text-ink">INVOICE</p>
                <p className="mt-1 font-mono text-sm text-accent-ink">{inv.invoiceNo}</p>
                <dl className="mt-4 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm sm:justify-end print:justify-end">
                  <dt className="text-muted">Date</dt>
                  <dd className="text-ink">{formatDate(inv.invoiceDate)}</dd>
                  {inv.dueDate && (
                    <>
                      <dt className="text-muted">Due</dt>
                      <dd className="text-ink">{formatDate(inv.dueDate)}</dd>
                    </>
                  )}
                </dl>
              </div>
            </header>

            <section className="py-8">
              <p className="text-label text-muted">Bill to</p>
              <p className="mt-2 font-display text-lg font-semibold text-ink">{inv.clientName}</p>
              {inv.clientEmail && <p className="text-sm text-muted-ink">{inv.clientEmail}</p>}
              {inv.clientPhone && <p className="text-sm text-muted-ink">{inv.clientPhone}</p>}
            </section>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-line text-left text-xs text-muted">
                    <th className="py-2.5 pr-3 font-medium">#</th>
                    <th className="py-2.5 pr-3 font-medium">Description</th>
                    <th className="py-2.5 pr-3 text-right font-medium">Qty</th>
                    <th className="py-2.5 pr-3 text-right font-medium">Rate</th>
                    <th className="py-2.5 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, index) => (
                    <tr key={index} className="border-b border-line align-top">
                      <td className="py-3 pr-3 text-muted tabular-nums">{index + 1}</td>
                      <td className="py-3 pr-3 text-ink">{item.desc}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{item.qty}</td>
                      <td className="py-3 pr-3 text-right whitespace-nowrap tabular-nums">{formatMoney(item.rate)}</td>
                      <td className="py-3 text-right whitespace-nowrap text-ink tabular-nums">{formatMoney(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 ml-auto w-full max-w-xs text-sm">
              <div className="flex justify-between py-1.5 text-muted-ink">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMoney(inv.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t-2 border-ink pt-3 font-display text-lg font-semibold text-ink">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(inv.total)}</span>
              </div>
            </div>

            {inv.notes && (
              <section className="mt-10 border-t border-line pt-6">
                <p className="text-label text-muted">Notes</p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-ink">{inv.notes}</p>
              </section>
            )}

            <p className="mt-12 text-center text-xs text-muted">Thank you for your business.</p>
          </article>
        </>
      )}
    </>
  );
}
