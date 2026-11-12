import { Mail, MessageCircle, Plus, Printer, RefreshCw, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useApiData } from "../../api/api";
import logo from "../../assets/logos/mecatronix-logo.png";
import { useFeedback } from "../../components/ui/feedback-context";
import { Button, Card, CardHeader, Field, IconButton, Input, PageHeader, Select, Textarea } from "../../components/ui/ui";
import { useCompany, type Company } from "../../api/useCompany";
import { dialDigits, formatDate, todayIso } from "../../lib/format";
import type { Client, Project } from "../../lib/types";

/* Client-side project quotation: edit on the left, A4 pages preview on the right, print to PDF. */

type Section = { id: string; heading: string; description: string };
type Charge = { id: string; label: string; enabled: boolean; amount: number };
type Details = {
  quotationNo: string;
  date: string;
  duration: string;
  title: string;
  sections: Section[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  gstPercent: number;
};
type Block = Section & { lines: string[]; sectionNumber: number; blockKey: string; isContinuation: boolean; weight: number };
type QuotationPageData = { blocks: Block[]; showCommercial: boolean; commercialRows?: Charge[]; showCommercialTotal?: boolean };

const quotationNo = () => `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
const fmt = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const newSection = (heading = "", description = ""): Section => ({ id: crypto.randomUUID(), heading, description });

const defaultCharges = (): Charge[] => [
  { id: crypto.randomUUID(), label: "Domain Charge", enabled: true, amount: 2000 },
  { id: crypto.randomUUID(), label: "Server Charge", enabled: true, amount: 2000 },
  { id: crypto.randomUUID(), label: "Mail Service", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "WhatsApp Integration", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "SMS Integration", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "Cloud Service", enabled: false, amount: 0 },
];

const newDetails = (): Details => ({
  quotationNo: quotationNo(),
  date: todayIso(),
  duration: "30 Days",
  title: "",
  sections: [newSection("Project Overview", "Responsive website design\nAdmin panel setup\nDeployment support")],
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  gstPercent: 0,
});

const descriptionLines = (text = "") =>
  text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

/* ---------- A4 pagination (weights approximate rendered height) ---------- */

const PAGE_CAPACITY = 34;
const SECTION_LINE_CAPACITY = 9;
const SCOPE_PLACEHOLDER_WEIGHT = 4;
const COMMERCIAL_TABLE_WEIGHT = 4;
const COMMERCIAL_TOTAL_WEIGHT = 6;
const COMMERCIAL_ROW_WEIGHT = 1.25;

const lineWeight = (line = "") => Math.max(1, Math.ceil(line.length / 58));

const commercialWeight = (rows: Charge[], showTotal = true) =>
  COMMERCIAL_TABLE_WEIGHT + rows.length * COMMERCIAL_ROW_WEIGHT + (showTotal ? COMMERCIAL_TOTAL_WEIGHT : 1);

const commercialRowCapacity = (availableWeight: number, showTotal: boolean) =>
  Math.max(1, Math.floor((availableWeight - COMMERCIAL_TABLE_WEIGHT - (showTotal ? COMMERCIAL_TOTAL_WEIGHT : 1)) / COMMERCIAL_ROW_WEIGHT));

const buildScopeBlocks = (sections: Section[]): Block[] =>
  sections.flatMap((section, sectionIndex) => {
    const lines = descriptionLines(section.description);
    if (!lines.length) {
      return [{ ...section, lines: [], sectionNumber: sectionIndex + 1, blockKey: `${section.id}-empty`, isContinuation: false, weight: 4 }];
    }

    const blocks: { lines: string[]; weight: number }[] = [];
    let chunk: string[] = [];
    let chunkWeight = 0;

    lines.forEach((line) => {
      const weight = lineWeight(line);
      if (chunk.length && chunkWeight + weight > SECTION_LINE_CAPACITY) {
        blocks.push({ lines: chunk, weight: 4 + chunkWeight });
        chunk = [];
        chunkWeight = 0;
      }
      chunk.push(line);
      chunkWeight += weight;
    });

    if (chunk.length) blocks.push({ lines: chunk, weight: 4 + chunkWeight });

    return blocks.map((block, blockIndex) => ({
      ...section,
      lines: block.lines,
      sectionNumber: sectionIndex + 1,
      blockKey: `${section.id}-${blockIndex}`,
      isContinuation: blockIndex > 0,
      weight: block.weight,
    }));
  });

const buildQuotationPages = (sections: Section[], rows: Charge[]): QuotationPageData[] => {
  const blocks = buildScopeBlocks(sections);
  const pages: QuotationPageData[] = [];
  let currentBlocks: Block[] = [];
  let currentWeight = 0;

  blocks.forEach((block) => {
    if (currentBlocks.length && currentWeight + block.weight > PAGE_CAPACITY) {
      pages.push({ blocks: currentBlocks, showCommercial: false });
      currentBlocks = [];
      currentWeight = 0;
    }
    currentBlocks.push(block);
    currentWeight += block.weight;
  });

  if (currentBlocks.length || !pages.length) pages.push({ blocks: currentBlocks, showCommercial: false });

  const lastPage = pages[pages.length - 1];
  if (lastPage.blocks.length && currentWeight + commercialWeight(rows) <= PAGE_CAPACITY) {
    lastPage.showCommercial = true;
    lastPage.commercialRows = rows;
    lastPage.showCommercialTotal = true;
  } else {
    const fullPageWeight = PAGE_CAPACITY - SCOPE_PLACEHOLDER_WEIGHT;
    const finalPageRowLimit = commercialRowCapacity(fullPageWeight, true);
    const continuedPageRowLimit = commercialRowCapacity(fullPageWeight, false);
    let startIndex = 0;

    while (rows.length - startIndex > finalPageRowLimit) {
      const remainingRows = rows.length - startIndex;
      const rowsForPage = Math.min(continuedPageRowLimit, remainingRows - finalPageRowLimit);
      pages.push({ blocks: [], showCommercial: true, commercialRows: rows.slice(startIndex, startIndex + rowsForPage), showCommercialTotal: false });
      startIndex += rowsForPage;
    }

    pages.push({ blocks: [], showCommercial: true, commercialRows: rows.slice(startIndex), showCommercialTotal: true });
  }

  return pages;
};

/* ---------- A4 page (print document: fixed sizes in px, brand ink + red) ---------- */

type Totals = { subtotal: number; gstAmount: number; total: number };

const CommercialEstimate = ({ details, rows, totals, showTotal }: { details: Details; rows: Charge[]; totals: Totals; showTotal?: boolean }) => (
  <div className="mt-auto">
    <div className="mb-2 text-[9px] font-extrabold tracking-[2px] uppercase">Commercial Estimate</div>
    <div className="grid grid-cols-[1fr_220px] items-start gap-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#0b0d12]">
            <th className="px-2.5 py-2.5 text-left text-[9.5px] tracking-[1px] text-white uppercase">Service</th>
            <th className="w-[30%] px-2.5 py-2.5 text-right text-[9.5px] tracking-[1px] text-white uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id} className={index % 2 ? "bg-neutral-50" : "bg-white"}>
                <td className="border-b border-neutral-100 px-2.5 py-[8px] text-[11.5px] text-neutral-800">
                  {index + 1}. {row.label}
                </td>
                <td className="border-b border-neutral-100 px-2.5 py-[8px] text-right text-[11.5px] font-semibold">₹ {fmt(row.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="p-4 text-center text-[11px] text-neutral-400">
                No service charges added
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {showTotal ? (
          <>
            <div className="border-t-4 border-[#e10600] bg-[#0b0d12] px-4 py-4 text-right text-white">
              <div className="mb-2 text-[11px] text-neutral-400">
                Subtotal: <strong className="text-white">₹ {fmt(totals.subtotal)}</strong>
              </div>
              {Number(details.gstPercent) > 0 && (
                <div className="mb-2 text-[11px] text-neutral-400">
                  GST ({details.gstPercent}%): <strong className="text-white">₹ {fmt(totals.gstAmount)}</strong>
                </div>
              )}
              <div className="border-t border-neutral-700 pt-2 text-[21px] font-black">₹ {fmt(totals.total)}</div>
              <div className="mt-1 text-[8px] tracking-[2px] text-neutral-400 uppercase">Total Estimate</div>
            </div>
            <div className="mt-3 text-[9.5px] leading-[1.6] text-neutral-500">Valid for 15 days. Commercials may vary if the project scope changes.</div>
          </>
        ) : (
          <div className="border-l-4 border-[#0b0d12] bg-neutral-100 px-4 py-3 text-[10.5px] leading-[1.6] text-neutral-600">
            Service charges continue on the next page. Final total appears on the last page.
          </div>
        )}
      </div>
    </div>
  </div>
);

const ScopeBlock = ({ block }: { block: Block }) => (
  <div className="min-h-[86px] break-inside-avoid border border-neutral-200 bg-neutral-50 px-3 py-2.5">
    <div className="mb-1.5 flex items-start gap-2">
      <div className="flex size-6 shrink-0 items-center justify-center bg-[#0b0d12] text-[10px] font-black text-white">{block.sectionNumber}</div>
      <div className="text-[11.5px] leading-snug font-bold">
        {block.heading || "Heading"}
        {block.isContinuation ? " (continued)" : ""}
      </div>
    </div>
    {block.lines.length ? (
      <ul className="list-disc pl-9 text-[10px] leading-[1.42] text-neutral-600">
        {block.lines.map((line, lineIndex) => (
          <li key={lineIndex}>{line}</li>
        ))}
      </ul>
    ) : (
      <div className="pl-8 text-[10px] leading-[1.42] text-neutral-500">Description list appears here.</div>
    )}
  </div>
);

const QuotationPage = ({
  details,
  totals,
  page,
  pageNo,
  totalPages,
  company,
}: {
  details: Details;
  totals: Totals;
  page: QuotationPageData;
  pageNo: number;
  totalPages: number;
  company: Company;
}) => (
  <div className="quotation-a4 flex bg-white font-[Arial,Helvetica,sans-serif] text-[13px] text-neutral-950 shadow-lift print:shadow-none">
    <aside className="flex h-full w-[96px] shrink-0 flex-col items-center bg-[#0b0d12] px-2.5 py-5 text-white">
      <img src={logo} alt="Mecatronix" className="h-[40px] w-auto shrink-0 object-contain" />
      <div className="mt-4 rotate-180 text-[13px] leading-none font-black tracking-[3px] [writing-mode:vertical-rl]">MECATRONIX</div>
      <div className="mt-auto flex h-[28px] w-full items-center justify-center overflow-visible pb-40">
        <div className="w-[260px] shrink-0 -rotate-90 text-center text-[12px] leading-[1.45] whitespace-nowrap text-neutral-400">
          <div>
            {company.website} | {company.email}
          </div>
          <div className="mt-1">
            {company.phoneDisplay} | {company.city}
          </div>
        </div>
      </div>
    </aside>

    <main className="flex flex-1 flex-col px-8 py-7">
      <div className="mb-5 flex items-start justify-between gap-6 border-b-2 border-[#0b0d12] pb-5">
        <div>
          <div className="text-[10px] font-bold tracking-[3px] text-[#a30400] uppercase">Project Proposal</div>
          <div className="mt-1 text-[34px] leading-none font-black tracking-[4px]">QUOTATION</div>
          <div className="mt-4 max-w-[360px] text-[18px] leading-tight font-black">{details.title || "Project Title"}</div>
        </div>
        <div className="w-[210px] border-r-4 border-[#e10600] bg-neutral-100 px-4 py-3 text-right">
          <div className="mb-2 text-[8px] font-bold tracking-[2px] text-neutral-400 uppercase">
            Page {pageNo} of {totalPages}
          </div>
          <div className="mb-2 text-[9px] font-extrabold tracking-[2px] uppercase">Prepared For</div>
          <div className="text-[14px] font-bold">{details.clientName || "Client Name"}</div>
          <div className="mt-1 text-[11px] leading-[1.6] text-neutral-600">
            <div>{details.clientEmail || "client@example.com"}</div>
            <div>{details.clientPhone || "+91 XXXXXXXXXX"}</div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          ["Quotation No", details.quotationNo],
          ["Date", formatDate(details.date)],
          ["Duration", details.duration || "-"],
        ].map(([label, value]) => (
          <div key={label} className="border border-neutral-200 px-3 py-2">
            <div className="text-[8px] tracking-[2px] text-neutral-400 uppercase">{label}</div>
            <div className="mt-0.5 text-[11px] font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[9px] font-extrabold tracking-[2px] uppercase">Scope Breakdown</div>
        <div className="grid grid-cols-2 gap-2.5">
          {page.blocks.length ? (
            page.blocks.map((block) => <ScopeBlock key={block.blockKey} block={block} />)
          ) : (
            <div className="col-span-2 border border-neutral-200 bg-neutral-50 px-3 py-8 text-center text-[10px] text-neutral-500">Scope details completed on previous page.</div>
          )}
        </div>
      </div>

      {page.showCommercial && <CommercialEstimate details={details} rows={page.commercialRows ?? []} totals={totals} showTotal={page.showCommercialTotal} />}

      <div className="mt-5 border-t border-neutral-200 pt-3 text-center text-[9.5px] leading-[1.8] text-neutral-400">
        {company.email} &nbsp;|&nbsp; {company.phoneDisplay} &nbsp;|&nbsp; {company.website}
      </div>
    </main>
  </div>
);

/* ---------- Editor ---------- */

export default function Quotation() {
  const { toast } = useFeedback();
  const company = useCompany();
  const projects = useApiData<Project[]>("project/all");
  const clients = useApiData<Client[]>("clients/get_all_clients");
  const [projectId, setProjectId] = useState("");
  const [details, setDetails] = useState<Details>(newDetails);
  const [charges, setCharges] = useState<Charge[]>(defaultCharges);

  const rows = useMemo(() => charges.filter((row) => row.enabled && Number(row.amount) > 0), [charges]);
  const totals = useMemo<Totals>(() => {
    const subtotal = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const gstAmount = subtotal * (Number(details.gstPercent || 0) / 100);
    return { subtotal, gstAmount, total: subtotal + gstAmount };
  }, [rows, details.gstPercent]);
  const pages = useMemo(() => buildQuotationPages(details.sections, rows), [details.sections, rows]);

  const update = <K extends keyof Details>(key: K, value: Details[K]) => setDetails((prev) => ({ ...prev, [key]: value }));
  const updateSection = (id: string, key: "heading" | "description", value: string) =>
    setDetails((prev) => ({ ...prev, sections: prev.sections.map((s) => (s.id === id ? { ...s, [key]: value } : s)) }));
  const addSection = () => setDetails((prev) => ({ ...prev, sections: [...prev.sections, newSection("New heading", "List item one\nList item two")] }));
  const removeSection = (id: string) =>
    setDetails((prev) => ({ ...prev, sections: prev.sections.length > 1 ? prev.sections.filter((s) => s.id !== id) : prev.sections }));
  const updateCharge = (id: string, patch: Partial<Charge>) => setCharges((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const addCharge = () => setCharges((prev) => [...prev, { id: crypto.randomUUID(), label: "Custom service", enabled: true, amount: 0 }]);
  const removeCharge = (id: string) => setCharges((prev) => prev.filter((row) => row.id !== id));

  const selectProject = (id: string) => {
    setProjectId(id);
    const project = projects.data?.find((item) => item.id === id);
    if (!project) return;
    const client = clients.data?.find((item) => item.id === project.client_id);
    setDetails((prev) => ({
      ...prev,
      title: project.project_name || prev.title,
      sections: [newSection("Project Overview", project.short_description || ""), ...prev.sections.slice(1)],
      clientName: client?.client_name || project.client?.client_name || prev.clientName,
      clientEmail: client?.client_emails[0] || prev.clientEmail,
      clientPhone: client?.client_phones[0] || prev.clientPhone,
    }));
  };

  const reset = () => {
    setProjectId("");
    setDetails(newDetails());
    setCharges(defaultCharges());
  };

  const messageText = () =>
    [
      `Hello ${details.clientName || "there"},`,
      `Please find Mecatronix project quotation ${details.quotationNo}.`,
      `Project: ${details.title || "Project"}`,
      `Duration: ${details.duration || "N/A"}`,
      ...details.sections.flatMap((section, index) => ["", `${index + 1}. ${section.heading || "Heading"}`, ...descriptionLines(section.description).map((line) => `- ${line}`)]),
      "",
      `Total: INR ${fmt(totals.total)}`,
    ].join("\n");

  const sendEmail = () => {
    if (!details.clientEmail) return toast.error("Add the client's email first.");
    const subject = encodeURIComponent(`Mecatronix Project Quotation ${details.quotationNo}`);
    window.location.href = `mailto:${details.clientEmail}?subject=${subject}&body=${encodeURIComponent(messageText())}`;
  };

  const sendWhatsapp = () => {
    const phone = dialDigits(details.clientPhone);
    if (!phone) return toast.error("Add the client's WhatsApp number first.");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageText())}`, "_blank", "noopener,noreferrer");
  };

  const sendSms = () => {
    const phone = dialDigits(details.clientPhone);
    if (!phone) return toast.error("Add the client's phone number first.");
    window.location.href = `sms:${phone}?body=${encodeURIComponent(messageText())}`;
  };

  const printQuotation = () => {
    const previous = document.title;
    document.title = `Quotation ${details.quotationNo}`; // becomes the PDF file name
    setTimeout(() => {
      window.print();
      document.title = previous;
    }, 120);
  };

  return (
    <div className="quotation-module">
      <div className="print:hidden">
        <PageHeader
          title="Quotations"
          description="Build a project quotation, preview the A4 pages, then print to PDF or send it."
          actions={
            <>
              <Button variant="secondary" icon={<RefreshCw className="size-4" />} onClick={reset}>
                New
              </Button>
              <Button icon={<Printer className="size-4" />} onClick={printQuotation}>
                Print / PDF
              </Button>
            </>
          }
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid min-w-0 gap-6 xl:grid-cols-2 print:hidden">
          <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Details" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Start from a project" htmlFor="q-project" className="sm:col-span-2" hint="Fills the title, overview and client contact.">
                <Select id="q-project" value={projectId} onChange={(e) => selectProject(e.target.value)}>
                  <option value="">Manual quotation</option>
                  {(projects.data ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Project title" htmlFor="q-title" className="sm:col-span-2">
                <Input id="q-title" value={details.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Company website & admin panel" />
              </Field>
              <Field label="Quotation number" htmlFor="q-no">
                <Input id="q-no" value={details.quotationNo} onChange={(e) => update("quotationNo", e.target.value)} />
              </Field>
              <Field label="Date" htmlFor="q-date">
                <Input id="q-date" type="date" value={details.date} onChange={(e) => update("date", e.target.value)} />
              </Field>
              <Field label="Duration" htmlFor="q-duration">
                <Input id="q-duration" value={details.duration} onChange={(e) => update("duration", e.target.value)} placeholder="e.g. 30 Days" />
              </Field>
              <Field label="GST %" htmlFor="q-gst">
                <Input id="q-gst" type="number" min={0} max={28} step={0.5} value={details.gstPercent} onChange={(e) => update("gstPercent", Number(e.target.value))} />
              </Field>
              <Field label="Client name" htmlFor="q-client">
                <Input id="q-client" value={details.clientName} onChange={(e) => update("clientName", e.target.value)} />
              </Field>
              <Field label="Client email" htmlFor="q-email">
                <Input id="q-email" type="email" value={details.clientEmail} onChange={(e) => update("clientEmail", e.target.value)} />
              </Field>
              <Field label="Client phone" htmlFor="q-phone" className="sm:col-span-2" hint="10-digit Indian numbers get +91 automatically for WhatsApp and SMS.">
                <Input id="q-phone" type="tel" value={details.clientPhone} onChange={(e) => update("clientPhone", e.target.value)} />
              </Field>
            </div>
          </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader
              title="Scope"
              description="One heading per area of work; put each point on its own line."
              actions={
                <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={addSection}>
                  Add heading
                </Button>
              }
            />
            <div className="flex flex-col gap-3 p-5">
              {details.sections.map((section, index) => (
                <div key={section.id} className="rounded-xl border border-line bg-paper/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ink font-mono text-[11px] font-semibold text-white">{index + 1}</span>
                    <Input
                      aria-label={`Heading ${index + 1}`}
                      value={section.heading}
                      onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                      placeholder={`Heading ${index + 1}`}
                    />
                    <IconButton label="Remove heading" tone="danger" disabled={details.sections.length === 1} onClick={() => removeSection(section.id)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                  <Textarea
                    aria-label={`Points for heading ${index + 1}`}
                    value={section.description}
                    onChange={(e) => updateSection(section.id, "description", e.target.value)}
                    rows={3}
                    placeholder="One point per line"
                  />
                </div>
              ))}
            </div>
          </Card>
          </div>

          <Card className="xl:col-span-2">
            <CardHeader
              title="Charges"
              description="Only ticked charges with an amount appear on the quotation."
              actions={
                <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={addCharge}>
                  Add charge
                </Button>
              }
            />
            <div className="flex flex-col gap-2 p-5">
              {charges.map((charge) => (
                <div key={charge.id} className="grid grid-cols-[auto_1fr_8.5rem_auto] items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Include ${charge.label}`}
                    checked={charge.enabled}
                    onChange={(e) => updateCharge(charge.id, { enabled: e.target.checked })}
                    className="size-4 accent-accent-strong"
                  />
                  <Input aria-label="Service" value={charge.label} onChange={(e) => updateCharge(charge.id, { label: e.target.value })} />
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">₹</span>
                    <Input
                      aria-label={`${charge.label} amount`}
                      type="number"
                      min={0}
                      value={charge.amount}
                      onChange={(e) => updateCharge(charge.id, { amount: Number(e.target.value) })}
                      className="pl-7 text-right tabular-nums"
                    />
                  </div>
                  <IconButton label={`Remove ${charge.label}`} tone="danger" onClick={() => removeCharge(charge.id)}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl bg-ink px-5 py-4 text-white">
              <div className="text-sm text-white/70">
                {rows.length} charge{rows.length === 1 ? "" : "s"}
                {details.gstPercent > 0 && ` · GST ${details.gstPercent}% ₹ ${fmt(totals.gstAmount)}`}
              </div>
              <div className="text-right">
                <span className="block text-xs text-white/60">Total estimate</span>
                <span className="font-display text-2xl font-semibold tabular-nums">₹ {fmt(totals.total)}</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-wrap items-center gap-2 p-4 xl:col-span-2">
            <span className="mr-auto text-sm text-muted-ink">Send the summary to the client</span>
            <Button variant="secondary" icon={<Mail className="size-4" />} onClick={sendEmail}>
              Email
            </Button>
            <Button variant="secondary" icon={<MessageCircle className="size-4" />} onClick={sendWhatsapp}>
              WhatsApp
            </Button>
            <Button variant="secondary" icon={<Send className="size-4" />} onClick={sendSms}>
              SMS
            </Button>
          </Card>
        </div>

        <section aria-label="Quotation preview" className="min-w-0">
          <p className="text-label mb-3 text-muted print:hidden">
            Live preview · A4 · {pages.length} page{pages.length > 1 ? "s" : ""}
          </p>
          <div className="scrollbar-thin overflow-x-auto rounded-2xl bg-line/60 p-4 sm:p-8 print:overflow-visible print:bg-transparent print:p-0">
            <div className="quotation-preview mx-auto flex w-[794px] flex-col gap-6">
              {pages.map((page, index) => (
                <QuotationPage key={index} details={details} totals={totals} page={page} pageNo={index + 1} totalPages={pages.length} company={company} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .quotation-a4 { width: 794px; height: 1123px; min-height: 1123px; overflow: hidden; box-sizing: border-box; }
        @media print {
          html, body { background: #fff !important; width: 210mm !important; min-height: 297mm !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          body * { visibility: hidden; }
          .quotation-preview, .quotation-preview * { visibility: visible; }
          .quotation-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; max-width: 210mm !important; gap: 0 !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          .quotation-a4 { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; box-shadow: none !important; page-break-after: always; break-after: page; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .quotation-a4:last-child { page-break-after: auto; break-after: auto; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}
