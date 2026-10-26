import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  MessageCircle,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import MecLogo from "../../assets/logos/Mec.webp";
import { getAllProjectsAPI } from "../../api/api";
import { errorNotification } from "../../helpers/notifi_helper";

const todayISO = () => new Date().toISOString().split("T")[0];
const quotationNo = () => `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const newSection = (heading = "", description = "") => ({
  id: crypto.randomUUID(),
  heading,
  description,
});

const defaultCharges = [
  { id: crypto.randomUUID(), label: "Domain Charge", enabled: true, amount: 2000 },
  { id: crypto.randomUUID(), label: "Server Charge", enabled: true, amount: 2000 },
  { id: crypto.randomUUID(), label: "Mail Service", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "WhatsApp Integration", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "SMS Integration", enabled: false, amount: 0 },
  { id: crypto.randomUUID(), label: "Cloud Service", enabled: false, amount: 0 },
];

const cleanPhone = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `91${digits}` : digits;
};

const descriptionLines = (text = "") =>
  text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

const PAGE_CAPACITY = 34;
const SECTION_LINE_CAPACITY = 9;
const SCOPE_PLACEHOLDER_WEIGHT = 4;
const COMMERCIAL_TABLE_WEIGHT = 4;
const COMMERCIAL_TOTAL_WEIGHT = 6;
const COMMERCIAL_ROW_WEIGHT = 1.25;

const lineWeight = (line = "") => Math.max(1, Math.ceil(line.length / 58));

const commercialWeight = (rows, showTotal = true) =>
  COMMERCIAL_TABLE_WEIGHT + (rows.length * COMMERCIAL_ROW_WEIGHT) + (showTotal ? COMMERCIAL_TOTAL_WEIGHT : 1);

const commercialRowCapacity = (availableWeight, showTotal) =>
  Math.max(1, Math.floor((availableWeight - COMMERCIAL_TABLE_WEIGHT - (showTotal ? COMMERCIAL_TOTAL_WEIGHT : 1)) / COMMERCIAL_ROW_WEIGHT));

const buildScopeBlocks = (sections) =>
  sections.flatMap((section, sectionIndex) => {
    const lines = descriptionLines(section.description);
    if (!lines.length) {
      return [{
        ...section,
        lines: [],
        sectionNumber: sectionIndex + 1,
        blockKey: `${section.id}-empty`,
        isContinuation: false,
        weight: 4,
      }];
    }

    const blocks = [];
    let chunk = [];
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

const buildQuotationPages = (sections, rows) => {
  const blocks = buildScopeBlocks(sections);
  const pages = [];
  let currentBlocks = [];
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

  if (currentBlocks.length || !pages.length) {
    pages.push({ blocks: currentBlocks, showCommercial: false });
  }

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
      pages.push({
        blocks: [],
        showCommercial: true,
        commercialRows: rows.slice(startIndex, startIndex + rowsForPage),
        showCommercialTotal: false,
      });
      startIndex += rowsForPage;
    }

    pages.push({
      blocks: [],
      showCommercial: true,
      commercialRows: rows.slice(startIndex),
      showCommercialTotal: true,
    });
  }

  return pages;
};

const CommercialEstimate = ({ details, rows, subtotal, gstAmount, total, showTotal }) => (
  <div className="mt-auto">
    <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Commercial Estimate</div>
    <div className="grid grid-cols-[1fr_220px] gap-4 items-start">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-950">
            <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-left">Service</th>
            <th className="px-2.5 py-2.5 text-white text-[9.5px] uppercase tracking-[1px] text-right w-[30%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={row.id} className={index % 2 ? "bg-neutral-50" : "bg-white"}>
              <td className="px-2.5 py-[8px] border-b border-neutral-100 text-[11.5px] text-neutral-800">{index + 1}. {row.label}</td>
              <td className="px-2.5 py-[8px] border-b border-neutral-100 text-[11.5px] font-semibold text-right">₹ {fmt(row.amount)}</td>
            </tr>
          )) : (
            <tr><td colSpan={2} className="p-4 text-center text-neutral-400 text-[11px]">No service charges added</td></tr>
          )}
        </tbody>
      </table>
      <div>
        {showTotal ? (
          <>
            <div className="bg-neutral-950 text-white px-4 py-4 text-right">
              <div className="text-[11px] text-neutral-400 mb-2">Subtotal: <strong className="text-white">₹ {fmt(subtotal)}</strong></div>
              {Number(details.gstPercent) > 0 && (
                <div className="text-[11px] text-neutral-400 mb-2">GST ({details.gstPercent}%): <strong className="text-white">₹ {fmt(gstAmount)}</strong></div>
              )}
              <div className="text-[21px] font-black border-t border-neutral-700 pt-2">₹ {fmt(total)}</div>
              <div className="text-[8px] uppercase tracking-[2px] text-neutral-400 mt-1">Total Estimate</div>
            </div>
            <div className="mt-3 text-[9.5px] text-neutral-500 leading-[1.6]">
              Valid for 15 days. Commercials may vary if the project scope changes.
            </div>
          </>
        ) : (
          <div className="bg-neutral-100 border-l-4 border-neutral-950 px-4 py-3 text-[10.5px] text-neutral-600 leading-[1.6]">
            Service charges continue on the next page. Final total appears on the last page.
          </div>
        )}
      </div>
    </div>
  </div>
);

const ScopeBlock = ({ block }) => (
  <div className="border border-neutral-200 bg-neutral-50 px-3 py-2.5 min-h-[86px] break-inside-avoid">
    <div className="flex items-start gap-2 mb-1.5">
      <div className="w-6 h-6 bg-neutral-950 text-white text-[10px] font-black flex items-center justify-center shrink-0">{block.sectionNumber}</div>
      <div className="text-[11.5px] font-bold leading-snug">
        {block.heading || "Heading"}{block.isContinuation ? " (continued)" : ""}
      </div>
    </div>
    {block.lines.length ? (
      <ul className="list-disc pl-9 text-[10px] text-neutral-600 leading-[1.42]">
        {block.lines.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
      </ul>
    ) : (
      <div className="pl-8 text-[10px] text-neutral-500 leading-[1.42]">Description list appears here.</div>
    )}
  </div>
);

const QuotationPage = ({ details, rows, subtotal, gstAmount, total, page, pageNo, totalPages }) => (
  <div className="quotation-a4 bg-white text-neutral-950 font-[Arial,Helvetica,sans-serif] text-[13px] flex">
    <aside className="w-[96px] h-full bg-neutral-950 text-white px-2.5 py-5 flex flex-col items-center shrink-0">
      <img src={MecLogo} alt="Mecatronix" className="w-[34px] h-[34px] rounded-[6px] bg-white p-[3px] object-contain shrink-0" />
      <div className="mt-4 text-[13px] font-black tracking-[3px] leading-none [writing-mode:vertical-rl] rotate-180">MECATRONIX</div>
      <div className="mt-auto h-[28px] pb-40 w-full flex items-center justify-center overflow-visible">
        <div className="-rotate-90 w-[260px] shrink-0 text-center text-[12px] text-neutral-400 leading-[1.45] whitespace-nowrap">
          <div>www.mecatronix.one | connect@mecatronix.one</div>
          <div className="mt-1">+91 8300454800 | Coimbatore, Tamil Nadu</div>
        </div>
      </div>
    </aside>

    <main className="flex-1 px-8 py-7 flex flex-col">
      <div className="flex items-start justify-between gap-6 border-b-2 border-neutral-950 pb-5 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[3px] text-neutral-400 font-bold">Project Proposal</div>
          <div className="text-[34px] font-black tracking-[4px] leading-none mt-1">QUOTATION</div>
          <div className="text-[18px] font-black leading-tight mt-4 max-w-[360px]">{details.title || "Project Title"}</div>
        </div>
        <div className="w-[210px] bg-neutral-100 border-r-4 border-neutral-950 px-4 py-3 text-right">
          <div className="text-[8px] uppercase tracking-[2px] text-neutral-400 font-bold mb-2">Page {pageNo} of {totalPages}</div>
          <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Prepared For</div>
          <div className="text-[14px] font-bold">{details.clientName || "Client Name"}</div>
          <div className="text-[11px] text-neutral-600 leading-[1.6] mt-1">
            <div>{details.clientEmail || "client@example.com"}</div>
            <div>{details.clientPhone || "+91 XXXXXXXXXX"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="border border-neutral-200 px-3 py-2">
          <div className="text-[8px] uppercase tracking-[2px] text-neutral-400">Quotation No</div>
          <div className="text-[11px] font-bold mt-0.5">{details.quotationNo}</div>
        </div>
        <div className="border border-neutral-200 px-3 py-2">
          <div className="text-[8px] uppercase tracking-[2px] text-neutral-400">Date</div>
          <div className="text-[11px] font-bold mt-0.5">{details.date}</div>
        </div>
        <div className="border border-neutral-200 px-3 py-2">
          <div className="text-[8px] uppercase tracking-[2px] text-neutral-400">Duration</div>
          <div className="text-[11px] font-bold mt-0.5">{details.duration || "-"}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[9px] uppercase tracking-[2px] font-extrabold mb-2">Scope Breakdown</div>
        <div className="grid grid-cols-2 gap-2.5">
          {page.blocks.length ? page.blocks.map((block) => <ScopeBlock key={block.blockKey} block={block} />) : (
            <div className="col-span-2 border border-neutral-200 bg-neutral-50 px-3 py-8 text-center text-[10px] text-neutral-500">
              Scope details completed on previous page.
            </div>
          )}
        </div>
      </div>

      {page.showCommercial && (
        <CommercialEstimate
          details={details}
          rows={page.commercialRows || rows}
          subtotal={subtotal}
          gstAmount={gstAmount}
          total={total}
          showTotal={page.showCommercialTotal}
        />
      )}

      <div className="border-t border-neutral-200 pt-3 mt-5 text-center text-[9.5px] text-neutral-400 leading-[1.8]">
        connect@mecatronix.one &nbsp;|&nbsp; +91 8300454800 &nbsp;|&nbsp; www.mecatronix.one
      </div>
    </main>
  </div>
);

const Quotation = () => {
  const [projects, setProjects] = useState([]);
  const [details, setDetails] = useState({
    quotationNo: quotationNo(),
    date: todayISO(),
    duration: "30 Days",
    title: "",
    sections: [
      newSection("Project Overview", "Responsive website design\nAdmin panel setup\nDeployment support"),
    ],
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    gstPercent: 0,
  });
  const [charges, setCharges] = useState(defaultCharges);

  useEffect(() => {
    getAllProjectsAPI().then((res) => {
      if (res?.success) setProjects(res.data || []);
    });
  }, []);

  const rows = useMemo(() => charges.filter((row) => row.enabled && Number(row.amount) > 0), [charges]);
  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [rows]);
  const gstAmount = subtotal * (Number(details.gstPercent || 0) / 100);
  const total = subtotal + gstAmount;
  const pages = useMemo(() => buildQuotationPages(details.sections, rows), [details.sections, rows]);

  const updateDetail = (key, value) => setDetails((prev) => ({ ...prev, [key]: value }));
  const updateSection = (id, key, value) => {
    setDetails((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => section.id === id ? { ...section, [key]: value } : section),
    }));
  };
  const addSection = () => {
    setDetails((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection("New Heading", "List item one\nList item two")],
    }));
  };
  const removeSection = (id) => {
    setDetails((prev) => ({
      ...prev,
      sections: prev.sections.length > 1 ? prev.sections.filter((section) => section.id !== id) : prev.sections,
    }));
  };
  const updateCharge = (id, key, value) => setCharges((prev) => prev.map((row) => row.id === id ? { ...row, [key]: key === "amount" ? Number(value) : value } : row));
  const addCharge = () => setCharges((prev) => [...prev, { id: crypto.randomUUID(), label: "Custom Service", enabled: true, amount: 0 }]);
  const removeCharge = (id) => setCharges((prev) => prev.filter((row) => row.id !== id));

  const selectProject = (projectId) => {
    const project = projects.find((item) => item._id === projectId);
    if (!project) return;
    const client = project.client_id || {};
    setDetails((prev) => ({
      ...prev,
      title: project.project_name || prev.title,
      sections: [
        newSection("Project Overview", project.short_description || ""),
        ...prev.sections.slice(1),
      ],
      clientName: client.client_name || client.company_name || prev.clientName,
      clientEmail: client.client_email || client.client_emails?.[0] || prev.clientEmail,
      clientPhone: client.client_phone || client.client_phones?.[0] || prev.clientPhone,
    }));
  };

  const messageText = () => [
    `Hello ${details.clientName || "Client"},`,
    `Please find Mecatronix project quotation ${details.quotationNo}.`,
    `Project: ${details.title || "Project"}`,
    `Duration: ${details.duration || "N/A"}`,
    ...details.sections.flatMap((section, index) => [
      "",
      `${index + 1}. ${section.heading || "Heading"}`,
      ...descriptionLines(section.description).map((line) => `- ${line}`),
    ]),
    `Total: INR ${fmt(total)}`,
  ].join("\n");

  const sendEmail = () => {
    if (!details.clientEmail) return errorNotification("Client email is required");
    const subject = encodeURIComponent(`Mecatronix Project Quotation ${details.quotationNo}`);
    const body = encodeURIComponent(messageText());
    window.location.href = `mailto:${details.clientEmail}?subject=${subject}&body=${body}`;
  };

  const sendWhatsapp = () => {
    const phone = cleanPhone(details.clientPhone);
    if (!phone) return errorNotification("Client WhatsApp number is required");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageText())}`, "_blank", "noopener,noreferrer");
  };

  const sendSms = () => {
    const phone = cleanPhone(details.clientPhone);
    if (!phone) return errorNotification("Client phone number is required");
    window.location.href = `sms:${phone}?body=${encodeURIComponent(messageText())}`;
  };

  const printQuotation = () => setTimeout(() => window.print(), 120);

  return (
    <div className="space-y-6 pb-8 quotation-module">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-[0.18em] text-white">MECATRONIX <span className="text-zinc-600">//</span> QUOTATION</h1>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Project quotation · service charges · GST · send proposal</p>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Select Project</span>
            <select onChange={(e) => selectProject(e.target.value)} className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none">
              <option value="">Manual quotation</option>
              {projects.map((project) => <option key={project._id} value={project._id}>{project.project_name}</option>)}
            </select>
          </label>
          {[
            ["quotationNo", "Quotation No", "text"],
            ["date", "Date", "date"],
            ["duration", "Duration", "text"],
            ["title", "Main Title", "text"],
            ["clientName", "Client Name", "text"],
            ["clientEmail", "Client Email", "email"],
            ["clientPhone", "Client Phone", "text"],
            ["gstPercent", "GST %", "number"],
          ].map(([key, label, type]) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
              <input type={type} value={details[key]} onChange={(e) => updateDetail(key, e.target.value)} className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-500" />
            </label>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold">Project Details</div>
              <div className="text-xs text-zinc-600 mt-1">Add multiple headings. Type each description point on a new line.</div>
            </div>
            <button type="button" onClick={addSection} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white"><Plus size={16} /> Add Heading</button>
          </div>
          <div className="space-y-3">
            {details.sections.map((section, index) => (
              <div key={section.id} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
                <div className="grid grid-cols-[1fr_40px] gap-2">
                  <input
                    value={section.heading}
                    onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                    placeholder={`Heading ${index + 1}`}
                    className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none"
                  />
                  <button type="button" onClick={() => removeSection(section.id)} className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white flex items-center justify-center"><Trash2 size={15} /></button>
                </div>
                <textarea
                  value={section.description}
                  onChange={(e) => updateSection(section.id, "description", e.target.value)}
                  rows={3}
                  placeholder="One list point per line"
                  className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm text-white outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-black/30 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-3">Charges</div>
          <div className="space-y-2">
            {charges.map((charge) => (
              <div key={charge.id} className="grid grid-cols-[36px_1.7fr_1fr_40px] gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2">
                <input type="checkbox" checked={charge.enabled} onChange={(e) => updateCharge(charge.id, "enabled", e.target.checked)} className="h-9 w-5 accent-orange-500" />
                <input value={charge.label} onChange={(e) => updateCharge(charge.id, "label", e.target.value)} className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none" />
                <input type="number" value={charge.amount} onChange={(e) => updateCharge(charge.id, "amount", e.target.value)} className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-sm text-white outline-none" />
                <button type="button" onClick={() => removeCharge(charge.id)} className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white flex items-center justify-center"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={addCharge} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white"><Plus size={16} /> Add Charge</button>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={sendEmail} className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300"><Mail size={16} /> Email</button>
              <button type="button" onClick={sendWhatsapp} className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300"><MessageCircle size={16} /> WhatsApp</button>
              <button type="button" onClick={sendSms} className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300"><Send size={16} /> SMS</button>
              <button type="button" onClick={() => setDetails((prev) => ({ ...prev, quotationNo: quotationNo(), date: todayISO() }))} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300"><RefreshCw size={16} /> New</button>
              <button type="button" onClick={printQuotation} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black"><Printer size={16} /> Generate PDF</button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-black/30 p-5 print:p-0 print:border-0 print:bg-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-600 font-bold mb-4 print:hidden">Live Preview · A4 / {pages.length} Page{pages.length > 1 ? "s" : ""}</div>
        <div className="overflow-x-auto">
          <div className="quotation-preview flex flex-col gap-6 w-[794px] mx-auto">
            {pages.map((page, index) => (
              <QuotationPage
                key={index}
                details={details}
                rows={rows}
                subtotal={subtotal}
                gstAmount={gstAmount}
                total={total}
                page={page}
                pageNo={index + 1}
                totalPages={pages.length}
              />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .quotation-module {
          --quotation-screen-width: 794px;
          --quotation-screen-height: 1123px;
        }

        .quotation-a4 {
          width: var(--quotation-screen-width);
          height: var(--quotation-screen-height);
          min-height: var(--quotation-screen-height);
          overflow: hidden;
          box-sizing: border-box;
        }

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
};

export default Quotation;
