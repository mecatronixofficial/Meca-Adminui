import React, { useEffect, useMemo, useState } from "react";
import { QRCode } from "antd";
import {
  CheckCircle2,
  Download,
  FilePlus2,
  ListChecks,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import MecLogo from "../../assets/logos/Mec.webp";
import {
  addInvoiceAPI,
  generateInvoiceBillAPI,
  getAllInvoicesAPI,
  getInvoiceByIdAPI,
  markInvoiceWhatsappSentAPI,
  sendInvoiceEmailAPI,
  updateInvoiceAPI,
} from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";

const ITEMS_PER_PAGE = 9;
const UPI_ID = "manipkm0004@okhdfcbank";
const UPI_NAME = "Manikandan P";

const todayISO = () => new Date().toISOString().split("T")[0];

const dueISO = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split("T")[0];
};

const initialItems = [
  { id: crypto.randomUUID(), desc: "Software Development Charges", qty: 1, rate: 8000 },
  { id: crypto.randomUUID(), desc: "Domain Registration", qty: 1, rate: 2000 },
  { id: crypto.randomUUID(), desc: "Server Hosting", qty: 1, rate: 2000 },
];

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const n2w = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  const lt1k = (n) => {
    if (!n) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");
    return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${lt1k(n % 100)}` : ""}`;
  };

  const cv = (n) => {
    if (!n) return "Zero";
    let words = "";
    if (n >= 10000000) {
      words += `${lt1k(Math.floor(n / 10000000))} Crore `;
      n %= 10000000;
    }
    if (n >= 100000) {
      words += `${lt1k(Math.floor(n / 100000))} Lakh `;
      n %= 100000;
    }
    if (n >= 1000) {
      words += `${lt1k(Math.floor(n / 1000))} Thousand `;
      n %= 1000;
    }
    if (n > 0) words += lt1k(n);
    return words.trim();
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  return `${cv(rupees)}${paise ? ` and ${cv(paise)} Paise` : ""}`;
};

const newInvoiceNo = () =>
  `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;

const getInvoiceId = (invoice) => invoice?._id || invoice?.id || null;

const getInvoiceDateValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const cleanPhoneForWhatsapp = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const buildUpiQrValue = ({ amount, invoiceNo }) => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: Number(amount || 0).toFixed(2),
    cu: "INR",
    tn: `Mecatronix Invoice ${invoiceNo || ""}`.trim(),
  });
  return `upi://pay?${params.toString()}`;
};

const InvoicePage = ({ details, items, pageNo, totalPages, startIndex, total }) => {
  const isFinalPage = pageNo === totalPages;
  const upiQrValue = buildUpiQrValue({ amount: total, invoiceNo: details.invoiceNo });

  return (
    <div className="invoice-a4 bg-white text-neutral-950 font-[Arial,Helvetica,sans-serif] text-[13px] flex flex-col">
      <div className="h-1.5 bg-neutral-950 w-full" />

      <div className="px-10 pt-8 pb-7 flex flex-col flex-1">
        <table className="w-full mb-6 border-b-2 border-neutral-950 pb-5">
          <tbody>
            <tr>
              <td className="align-top w-[55%]">
                <table>
                  <tbody>
                    <tr>
                      <td className="align-middle pr-3">
                        <img src={MecLogo} alt="Mecatronix" className="block w-[52px] h-[52px] rounded-[7px] bg-black p-[3px] object-contain" />
                      </td>
                      <td className="align-middle">
                        <div className="text-[22px] font-black tracking-[5px] leading-none">MECATRONIX</div>
                        <div className="text-[9px] text-neutral-500 tracking-[2.5px] uppercase mt-1">Software Development</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-3 text-[11px] text-neutral-500 leading-[1.8]">
                  <div>www.mecatronix.one &nbsp;&nbsp;|&nbsp;&nbsp; connect@mecatronix.one</div>
                  <div>mecatronixofficial@gmail.com</div>
                  <div>PH: +91 8300454800</div>
                  <div>No.3A, Vijay Complex, Old ESI St, Sathy Main Road,</div>
                  <div>Ganapathy, Coimbatore, Tamil Nadu - 641006.</div>
                </div>
              </td>
              <td className="align-top text-right w-[45%]">
                <div className="inline-block bg-neutral-950 text-white px-[18px] py-[5px] rounded-full text-[9px] font-bold tracking-[3.5px] mb-3">INVOICE</div>
                <div className="text-[9px] text-neutral-400 uppercase tracking-[2px] mb-2">Page {pageNo} of {totalPages}</div>
                <table className="ml-auto">
                  <tbody>
                    <tr><td className="text-[11px] text-neutral-400 pr-2.5 py-[3px] text-right">Invoice No</td><td className="text-[11px] font-bold py-[3px] text-right">{details.invoiceNo || "INV-001"}</td></tr>
                    <tr><td className="text-[11px] text-neutral-400 pr-2.5 py-[3px] text-right">Date</td><td className="text-[11px] font-bold py-[3px] text-right">{details.invoiceDate || "-"}</td></tr>
                    <tr><td className="text-[11px] text-neutral-400 pr-2.5 py-[3px] text-right">Due Date</td><td className="text-[11px] font-bold py-[3px] text-right">{details.dueDate || "-"}</td></tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-[22px]">
          <tbody>
            <tr>
              <td className="w-1/2 align-top bg-neutral-100 border-l-4 border-neutral-950 rounded-r-md px-4 py-3.5">
                <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Bill To</div>
                <div className="text-[13px] font-bold mb-1">{details.clientName || "Client Name"}</div>
                <div className="text-[11px] text-neutral-600 leading-[1.8]">{details.clientEmail || "client@example.com"}<br />{details.clientPhone || "+91 XXXXXXXXXX"}</div>
              </td>
              <td className="w-[4%]" />
              <td className="w-[46%] align-top bg-neutral-100 border-l-4 border-neutral-950 rounded-r-md px-4 py-3.5">
                <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Payment Info</div>
                <div className="text-[11px] text-neutral-600 leading-[1.8]">
                  <strong className="text-neutral-700">Terms:</strong> Due within 15 days<br />
                  <strong className="text-neutral-700">Method:</strong> UPI / Bank Transfer
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-[18px] rounded-md overflow-hidden">
          <thead>
            <tr className="bg-neutral-950">
              <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-left w-[48%]">#&nbsp;&nbsp;Description</th>
              <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-center w-[10%]">Qty</th>
              <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-right w-[21%]">Rate (₹)</th>
              <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-right w-[21%]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item, index) => {
              const serial = startIndex + index + 1;
              return (
                <tr key={item.id} className={serial % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                  <td className="px-2.5 py-[9px] border-b border-neutral-100 text-[12px] text-neutral-800">{serial}. {item.desc}</td>
                  <td className="px-2.5 py-[9px] border-b border-neutral-100 text-[12px] text-neutral-600 text-center">{item.qty}</td>
                  <td className="px-2.5 py-[9px] border-b border-neutral-100 text-[12px] text-neutral-600 text-right">₹&nbsp;{fmt(item.rate)}</td>
                  <td className="px-2.5 py-[9px] border-b border-neutral-100 text-[12px] font-semibold text-right">₹&nbsp;{fmt(item.qty * item.rate)}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan={4} className="p-4 text-center text-neutral-400 text-[11px]">No items added on this page</td></tr>
            )}
          </tbody>
        </table>

        {isFinalPage ? (
          <>
            <table className="w-full mb-6">
              <tbody>
                <tr>
                  <td width="55%" />
                  <td className="bg-neutral-100 border-r-4 border-neutral-950 rounded-l-md px-[18px] py-4 text-right">
                    <div className="text-[11px] text-neutral-500 mb-2 border-b border-neutral-300 pb-2">Subtotal: &nbsp;<strong className="text-neutral-700">₹&nbsp;{fmt(total)}</strong></div>
                    <div className="text-[17px] font-black">TOTAL &nbsp;&nbsp; ₹&nbsp;{fmt(total)}</div>
                    <div className="text-[9.5px] text-neutral-400 italic mt-1.5">{n2w(total)} Rupees Only</div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-t border-neutral-300 pt-[18px] mb-5">
              <tbody>
                <tr>
                  <td className="align-top w-[68%]">
                    <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Bank Details</div>
                    <table>
                      <tbody>
                        {[
                          ["Bank", "Indian Bank"],
                          ["Account Name", "Manikandan P"],
                          ["Account No", "6540068368"],
                          ["IFSC Code", "IDIB000K185"],
                          ["UPI ID", "manipkm0004@okhdfcbank"],
                          ["UPI No", "+91 7639467325"],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td className="text-[11px] text-neutral-400 pr-3.5 py-0.5 whitespace-nowrap">{label}</td>
                            <td className="text-[11px] text-neutral-700 py-0.5 font-semibold">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td className="align-top text-right w-[32%]">
                    <div className="inline-block text-center">
                      <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Scan To Pay</div>
                      <div className="inline-block bg-white border border-neutral-200 p-1">
                        <QRCode
                          value={upiQrValue}
                          size={104}
                          bordered={false}
                          color="#111111"
                          bgColor="#ffffff"
                        />
                      </div>
                      <div className="text-[8.5px] text-neutral-500 mt-1.5">UPI: {UPI_ID}</div>
                      <div className="text-[9px] font-bold mt-0.5">₹ {fmt(total)}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <div className="bg-neutral-100 border-l-4 border-neutral-950 rounded-r-md px-4 py-3 mb-5 text-[11px] text-neutral-600">
            Continued on page {pageNo + 1}. Final total and bank details appear on the last page.
          </div>
        )}

        <div className="flex-1" />

        <div className="border-t border-neutral-200 pt-3.5 text-center text-[9.5px] text-neutral-400 leading-[1.9]">
          This is a computer generated invoice and does not require a physical signature.<br />
          For queries: <strong className="text-neutral-600">connect@mecatronix.one</strong> &nbsp;|&nbsp; +91 8300454800 &nbsp;|&nbsp; Thank you for your business!
        </div>
      </div>

      <div className="h-1 bg-neutral-950 w-full" />
    </div>
  );
};

const Invoice = () => {
  const [details, setDetails] = useState({
    invoiceNo: newInvoiceNo(),
    invoiceDate: todayISO(),
    dueDate: dueISO(),
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });
  const [items, setItems] = useState(initialItems);
  const [pageCount, setPageCount] = useState(1);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  const validItems = useMemo(
    () => items.filter((item) => item.desc.trim() && Number(item.qty) > 0),
    [items]
  );

  const total = useMemo(
    () => validItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0),
    [validItems]
  );

  const minimumPages = Math.max(1, Math.ceil(validItems.length / ITEMS_PER_PAGE));
  const totalPages = Math.max(pageCount, minimumPages);

  const pages = Array.from({ length: totalPages }, (_, index) => {
    const start = index * ITEMS_PER_PAGE;
    return validItems.slice(start, start + ITEMS_PER_PAGE);
  });

  const isComplete = Boolean(
    details.invoiceNo.trim() &&
    details.invoiceDate &&
    details.clientName.trim() &&
    validItems.length
  );

  const hasSendContact = Boolean(details.clientEmail.trim() || details.clientPhone.trim());

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await getAllInvoicesAPI();
      if (res?.success) setSavedInvoices(res.data || []);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const buildPayload = () => ({
    ...details,
    items: validItems.map((item) => ({
      desc: item.desc,
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      amount: Number(item.qty || 0) * Number(item.rate || 0),
    })),
    pageCount: totalPages,
    subtotal: total,
    total,
  });

  const saveInvoice = async ({ silent = false } = {}) => {
    if (!isComplete) {
      errorNotification("Invoice no, date, client name, and one item are required.");
      return null;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      const res = activeInvoiceId
        ? await updateInvoiceAPI(activeInvoiceId, payload)
        : await addInvoiceAPI(payload);

      if (!res?.success) {
        errorNotification(res?.message || "Failed to save invoice");
        return null;
      }

      const saved = res.data;
      setActiveInvoiceId(getInvoiceId(saved));
      await fetchInvoices();
      if (!silent) successNotification(activeInvoiceId ? "Invoice updated successfully" : "Invoice saved successfully");
      return saved;
    } finally {
      setSaving(false);
    }
  };

  const loadInvoice = async (id) => {
    const res = await getInvoiceByIdAPI(id);
    if (!res?.success || !res.data) {
      errorNotification(res?.message || "Failed to load invoice");
      return;
    }

    const invoice = res.data;
    setActiveInvoiceId(getInvoiceId(invoice));
    setDetails({
      invoiceNo: invoice.invoiceNo || "",
      invoiceDate: getInvoiceDateValue(invoice.invoiceDate) || todayISO(),
      dueDate: getInvoiceDateValue(invoice.dueDate) || dueISO(),
      clientName: invoice.clientName || "",
      clientEmail: invoice.clientEmail || "",
      clientPhone: invoice.clientPhone || "",
    });
    setItems((invoice.items || []).map((item) => ({
      id: crypto.randomUUID(),
      desc: item.desc || "",
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
    })));
    setPageCount(Math.max(Number(invoice.pageCount) || 1, 1));
    successNotification("Invoice loaded for editing");
  };

  const printBill = () => {
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 150);
    });
  };

  const generateBill = async () => {
    if (!isComplete) {
      errorNotification("Invoice no, date, client name, and one item are required.");
      return;
    }

    try {
      setGenerating(true);
      const saved = await saveInvoice({ silent: true });
      const id = getInvoiceId(saved);

      if (id) {
        const res = await generateInvoiceBillAPI(id);
        if (res?.success) {
          await fetchInvoices();
          successNotification("Bill generated and saved");
        } else {
          errorNotification(res?.message || "Bill PDF will open, but backend status was not updated.");
        }
      } else {
        errorNotification("Bill PDF will open, but invoice was not saved to backend.");
      }

      printBill();
    } finally {
      setGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!details.clientEmail.trim()) {
      errorNotification("Client email is required.");
      return;
    }

    const saved = await saveInvoice({ silent: true });
    const id = getInvoiceId(saved);
    if (!id) return;

    try {
      setSending(true);
      const res = await sendInvoiceEmailAPI(id);
      if (!res?.success) {
        errorNotification(res?.message || "Failed to send invoice email");
        return;
      }
      await fetchInvoices();
      successNotification("Invoice sent by email");
    } finally {
      setSending(false);
    }
  };

  const sendWhatsapp = async () => {
    const phone = cleanPhoneForWhatsapp(details.clientPhone);
    if (!phone) {
      errorNotification("Client WhatsApp phone number is required.");
      return;
    }

    const saved = await saveInvoice({ silent: true });
    const id = getInvoiceId(saved);
    if (!id) return;

    const message = [
      `Hello ${details.clientName || "Client"},`,
      `Your Mecatronix invoice ${details.invoiceNo} is generated.`,
      `Total: INR ${fmt(total)}`,
      `Date: ${details.invoiceDate}`,
      `Due: ${details.dueDate || "N/A"}`,
      "Please check the PDF/bill shared from Mecatronix.",
    ].join("\n");

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    await markInvoiceWhatsappSentAPI(id);
    await fetchInvoices();
    successNotification("WhatsApp opened and invoice marked as sent");
  };

  const updateDetail = (key, value) => setDetails((prev) => ({ ...prev, [key]: value }));

  const updateItem = (id, key, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: key === "desc" ? value : Number(value) } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), desc: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addPage = () => setPageCount((prev) => prev + 1);

  const removePage = () => {
    setPageCount((prev) => Math.max(minimumPages, prev - 1));
  };

  const reset = () => {
    setDetails({
      invoiceNo: newInvoiceNo(),
      invoiceDate: todayISO(),
      dueDate: dueISO(),
      clientName: "",
      clientEmail: "",
      clientPhone: "",
    });
    setItems(initialItems.map((item) => ({ ...item, id: crypto.randomUUID() })));
    setPageCount(1);
    setActiveInvoiceId(null);
  };

  return (
    <div className="space-y-6 pb-8 invoice-module">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-[0.18em] text-white">MECATRONIX <span className="text-zinc-600">//</span> INVOICE</h1>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Software Development · IT Solutions · www.mecatronix.one</p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-4 print:hidden">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold">Invoice Workflow</div>
              <div className="mt-2 text-white font-bold">
                {activeInvoiceId ? "Editing saved invoice" : "New invoice draft"}
              </div>
              <div className="text-sm text-zinc-500">
                Complete the bill, save it to backend, generate the bill, then send via WhatsApp or email.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${isComplete ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}>
                <CheckCircle2 size={14} /> {isComplete ? "Ready" : "Incomplete"}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${hasSendContact ? "border-sky-500/40 bg-sky-500/10 text-sky-300" : "border-zinc-800 bg-zinc-900 text-zinc-500"}`}>
                <Mail size={14} /> Contact
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold">
              <ListChecks size={15} /> Saved Invoices
            </div>
            <button type="button" onClick={fetchInvoices} className="text-xs text-zinc-500 hover:text-white">Refresh</button>
          </div>
          <div className="max-h-44 overflow-y-auto no-scrollbar space-y-2">
            {loadingInvoices ? (
              <div className="text-sm text-zinc-500">Loading invoices...</div>
            ) : savedInvoices.length ? savedInvoices.slice(0, 8).map((invoice) => (
              <button
                key={getInvoiceId(invoice)}
                type="button"
                onClick={() => loadInvoice(getInvoiceId(invoice))}
                className={`w-full text-left rounded-lg border px-3 py-2 transition ${activeInvoiceId === getInvoiceId(invoice) ? "border-orange-500/60 bg-orange-500/10" : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-600"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{invoice.invoiceNo}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">{invoice.status || "draft"}</span>
                </div>
                <div className="text-xs text-zinc-500">{invoice.clientName} · ₹ {fmt(invoice.total)}</div>
              </button>
            )) : (
              <div className="text-sm text-zinc-500">No saved invoices yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 print:hidden">
        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-4">Invoice Details · Invoice No & Date Editable</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            ["invoiceNo", "Invoice Number", "text"],
            ["invoiceDate", "Invoice Date", "date"],
            ["dueDate", "Due Date", "date"],
            ["clientName", "Client Name", "text"],
            ["clientEmail", "Client Email", "email"],
            ["clientPhone", "Client Phone", "text"],
          ].map(([key, label, type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
              <input
                type={type}
                value={details[key]}
                onChange={(e) => updateDetail(key, e.target.value)}
                className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-500"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-3">Line Items</div>
          <div className="grid grid-cols-[2.5fr_0.7fr_1fr_1fr_40px] gap-2 px-3 py-2 rounded-lg bg-zinc-900 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
            <span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span><span />
          </div>
          <div className="space-y-2 mt-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[2.5fr_0.7fr_1fr_1fr_40px] gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2">
                <input value={item.desc} onChange={(e) => updateItem(item.id, "desc", e.target.value)} className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none focus:border-zinc-500" />
                <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)} className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none focus:border-zinc-500" />
                <input type="number" value={item.rate} onChange={(e) => updateItem(item.id, "rate", e.target.value)} className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none focus:border-zinc-500" />
                <input value={fmt(Number(item.qty || 0) * Number(item.rate || 0))} readOnly className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-400 outline-none" />
                <button type="button" onClick={() => removeItem(item.id)} className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white hover:border-zinc-600 flex items-center justify-center" aria-label="Remove item">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 rounded-xl border border-zinc-800 bg-black/30 p-4">
          <div>
            <div className="text-white font-bold">{totalPages} Invoice Page{totalPages > 1 ? "s" : ""}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">Extra pages keep the same invoice design</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addPage} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600"><FilePlus2 size={16} /> Add New Page</button>
            <button type="button" onClick={removePage} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600">Remove Page</button>
            <button type="button" onClick={() => saveInvoice()} disabled={saving || !isComplete} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 disabled:opacity-40"><Save size={16} /> {saving ? "Saving..." : "Save Invoice"}</button>
            <button type="button" onClick={generateBill} disabled={saving || generating || !isComplete} className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 disabled:opacity-40"><Pencil size={16} /> {generating ? "Generating..." : "Generate Bill"}</button>
            <button type="button" onClick={sendEmail} disabled={sending || !isComplete || !details.clientEmail.trim()} className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 hover:text-sky-100 hover:border-sky-400 disabled:opacity-40"><Mail size={16} /> Send Email</button>
            <button type="button" onClick={sendWhatsapp} disabled={sending || !isComplete || !details.clientPhone.trim()} className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:text-green-100 hover:border-green-400 disabled:opacity-40"><MessageCircle size={16} /> WhatsApp</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-600"><RefreshCw size={16} /> Reset</button>
            <button type="button" onClick={printBill} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200"><Download size={16} /> Print / Save PDF</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/30 p-5 print:p-0 print:border-0 print:bg-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-600 font-bold mb-4 print:hidden">Live Preview · A4 / {totalPages} Page{totalPages > 1 ? "s" : ""}</div>
        <div className="overflow-x-auto">
          <div className="invoice-preview flex flex-col gap-6 w-[794px] mx-auto">
            {pages.map((pageItems, index) => (
              <InvoicePage
                key={index}
                details={details}
                items={pageItems}
                pageNo={index + 1}
                totalPages={totalPages}
                startIndex={index * ITEMS_PER_PAGE}
                total={total}
              />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .invoice-module {
          --invoice-screen-width: 794px;
          --invoice-screen-height: 1123px;
        }

        .invoice-a4 {
          width: var(--invoice-screen-width);
          height: var(--invoice-screen-height);
          min-height: var(--invoice-screen-height);
          overflow: hidden;
          box-sizing: border-box;
        }

        @media print {
          html,
          body {
            background: #fff !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          body * {
            visibility: hidden;
          }

          .invoice-preview,
          .invoice-preview * {
            visibility: visible;
          }

          .invoice-preview {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            gap: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .invoice-a4 {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .invoice-a4:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
