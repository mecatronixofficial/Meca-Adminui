import { CheckCircle2, Circle, Copy, ExternalLink, Eye, Mail, MessageCircle, MonitorSmartphone, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, CLIENT_URL } from "../../api/api";
import { useSession } from "../../components/layout/session";
import { buttonClass } from "../../components/ui/button-class";
import { useFeedback } from "../../components/ui/feedback-context";
import { Modal } from "../../components/ui/Modal";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Button, Detail, ErrorState, IconButton, Spinner, Stack, Switch, Textarea } from "../../components/ui/ui";
import { dialDigits, formatDateTime, timeAgo } from "../../lib/format";
import type { SitePreview } from "../../lib/types";
import { ScaledFrame } from "./site/ScaledFrame";
import { SiteTemplate } from "./site/SiteTemplate";
import { TEMPLATES, getTemplate } from "./site/templates";

/** Public link to the visitor's full website preview on the main site. */
const previewUrl = (id: string) => (CLIENT_URL ? `${CLIENT_URL.replace(/\/+$/, "")}/preview/${id}` : null);
const industryName = (slug: string) => getTemplate(slug)?.short ?? slug;

/**
 * Leads from "Preview your own website" on the public site: who they are, their brand,
 * and the website they generated, rendered live from the same templates.
 */
export default function Previews() {
  const [params, setParams] = useSearchParams();
  const { toast } = useFeedback();
  const { refreshCounts } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const viewing = params.get("open");

  const reload = () => {
    setRefreshKey((k) => k + 1);
    refreshCounts();
  };

  const view = (id: string) => setParams({ open: id });

  const setContacted = async (row: SitePreview, contacted: boolean) => {
    try {
      await api(`previews/edit/${row.id}`, { method: "PUT", body: { is_contacted: contacted } });
      reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const config: ResourceConfig<SitePreview> = {
    title: "Website previews",
    noun: "preview",
    description: "Visitors who generated a preview of their own website on the main site. Each one is a warm lead: follow up while they're interested.",
    listPath: "previews/getall",
    deletePath: (row) => `previews/delete/${row.id}`,
    label: (row) => `${row.company_name}'s preview`,
    searchPlaceholder: "Search company, name, email, phone, city",
    filters: [
      {
        name: "contacted",
        label: "Status",
        options: [
          { value: "false", label: "New" },
          { value: "true", label: "Contacted" },
        ],
      },
      { name: "industry", label: "Industry", options: TEMPLATES.map((t) => ({ value: t.slug, label: t.short })) },
    ],
    emptyIcon: <MonitorSmartphone aria-hidden />,
    emptyHint: "Previews appear here when a visitor uses “Preview your own website” on the main site.",
    columns: [
      {
        header: "Company",
        cell: (row) => (
          <button type="button" onClick={() => view(row.id)} className="flex max-w-full items-center gap-3 text-left">
            <Logo row={row} />
            <Stack primary={<span className={row.is_contacted ? "font-medium" : "font-semibold"}>{row.company_name}</span>} secondary={industryName(row.industry)} />
          </button>
        ),
      },
      { header: "Contact", cell: (row) => <Stack primary={row.contact_name} secondary={row.email} />, className: "hidden md:table-cell" },
      { header: "Phone", cell: (row) => row.phone || "—", className: "hidden xl:table-cell whitespace-nowrap" },
      { header: "Views", cell: (row) => <span className="tabular-nums">{row.view_count}</span>, className: "hidden lg:table-cell" },
      {
        header: "Status",
        cell: (row) =>
          row.is_contacted ? (
            <Badge tone="success" dot>
              Contacted
            </Badge>
          ) : (
            <Badge tone="warning" dot>
              New
            </Badge>
          ),
      },
      { header: "Created", cell: (row) => <span className="whitespace-nowrap">{timeAgo(row.createdAt)}</span>, className: "hidden sm:table-cell" },
    ],
    rowActions: (row) => {
      const url = previewUrl(row.id);
      return (
        <>
          <IconButton label="View details" onClick={() => view(row.id)}>
            <Eye className="size-4" />
          </IconButton>
          {url && (
            <IconButton label="Open their website" onClick={() => window.open(url, "_blank", "noopener")}>
              <ExternalLink className="size-4" />
            </IconButton>
          )}
          <IconButton label={row.is_contacted ? "Mark as new" : "Mark as contacted"} onClick={() => setContacted(row, !row.is_contacted)}>
            {row.is_contacted ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4" />}
          </IconButton>
        </>
      );
    },
  };

  const close = () => {
    setParams({}, { replace: true });
    reload();
  };

  return (
    <>
      <ResourcePage config={config} refreshKey={refreshKey} />
      {viewing && <PreviewDetails key={viewing} id={viewing} onClose={close} />}
    </>
  );
}

function Logo({ row, large }: { row: SitePreview; large?: boolean }) {
  const size = large ? "size-16 rounded-2xl text-xl" : "size-10 rounded-xl text-sm";
  return row.logo_url ? (
    <img src={row.logo_url} alt="" className={`${size} shrink-0 border border-line bg-white object-contain p-1`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center font-display font-bold text-white`} style={{ background: row.brand_color }}>
      {row.company_name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function PreviewDetails({ id, onClose }: { id: string; onClose: () => void }) {
  const { toast } = useFeedback();
  const [preview, setPreview] = useState<SitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    api<SitePreview>(`previews/get/${id}`).then(
      ({ data }) => {
        setPreview(data);
        setNotes(data.notes ?? "");
        setSlug(data.industry);
      },
      (err: Error) => setError(err.message),
    );
  }, [id]);

  const save = async (patch: Partial<Pick<SitePreview, "is_contacted" | "notes">>) => {
    if (!preview) return;
    setSaving(true);
    try {
      const { data } = await api<SitePreview>(`previews/edit/${preview.id}`, { method: "PUT", body: patch });
      setPreview(data);
      toast.success("Saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy. Select the address instead.");
    }
  };

  const template = preview ? getTemplate(preview.industry) : undefined;
  const url = preview ? previewUrl(preview.id) : null;
  const mailto = preview
    ? `mailto:${preview.email}?subject=${encodeURIComponent(`Your ${preview.company_name} website preview`)}&body=${encodeURIComponent(
        `Hi ${preview.contact_name},\n\nThanks for previewing your website with Mecatronix!${url ? `\n\nHere it is again: ${url}` : ""}\n\n`,
      )}`
    : undefined;
  const whatsapp = preview?.phone
    ? `https://wa.me/${dialDigits(preview.phone)}?text=${encodeURIComponent(`Hi ${preview.contact_name}, this is Mecatronix. Thanks for previewing the ${preview.company_name} website!`)}`
    : undefined;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={preview ? preview.company_name : "Website preview"}
      description={preview ? `${template?.name ?? preview.industry} · created ${formatDateTime(preview.createdAt)}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          {mailto && (
            <a href={mailto} className={buttonClass("secondary")}>
              <Mail className="size-4" /> Email
            </a>
          )}
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className={buttonClass("primary")}>
              <ExternalLink className="size-4" /> Open their website
            </a>
          )}
        </>
      }
    >
      {error ? (
        <ErrorState message={error} />
      ) : !preview ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex items-center gap-4">
              <Logo row={preview} large />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-ink">{preview.company_name}</p>
                {preview.tagline && <p className="truncate text-sm text-muted-ink">{preview.tagline}</p>}
                <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span className="size-3.5 rounded-full border border-line" style={{ background: preview.brand_color }} />
                  {preview.brand_color} · {preview.view_count} view{preview.view_count === 1 ? "" : "s"}
                  {preview.last_viewed_at ? ` · last viewed ${timeAgo(preview.last_viewed_at)}` : ""}
                </p>
              </div>
            </div>

            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Detail label="Contact person">{preview.contact_name}</Detail>
              <Detail label="Email">
                <span className="flex items-center gap-1.5">
                  <a href={`mailto:${preview.email}`} className="truncate text-accent-ink hover:underline">
                    {preview.email}
                  </a>
                  <IconButton label="Copy email" className="size-6" onClick={copyEmail}>
                    <Copy className="size-3.5" />
                  </IconButton>
                </span>
              </Detail>
              <Detail label="Phone">
                {preview.phone ? (
                  <a href={`tel:${preview.phone}`} className="inline-flex items-center gap-1.5 text-accent-ink hover:underline">
                    <Phone className="size-3.5" /> {preview.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="City">{preview.city || "—"}</Detail>
              <Detail label="Industry">{template?.name ?? preview.industry}</Detail>
              <Detail label="Status">
                {preview.is_contacted ? (
                  <Badge tone="success" dot>
                    Contacted
                  </Badge>
                ) : (
                  <Badge tone="warning" dot>
                    New lead
                  </Badge>
                )}
              </Detail>
            </dl>

            {preview.services.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.services.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {preview.description && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink">About the business</p>
                <p className="rounded-xl bg-paper px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap text-surface">{preview.description}</p>
              </div>
            )}

            <Switch checked={preview.is_contacted} onChange={(value) => save({ is_contacted: value })} label="Contacted" description="Mark once someone from the team has followed up." />

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink">Team notes</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Call outcome, budget, next steps…" />
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="secondary" loading={saving} disabled={notes === (preview.notes ?? "")} onClick={() => save({ notes })}>
                  Save notes
                </Button>
              </div>
            </div>
          </div>

          {/* The website the visitor generated, rendered live with their brand */}
          <div className="min-w-0 lg:sticky lg:top-0 lg:self-start">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-ink">Their website preview</p>
              <select
                value={slug ?? preview.industry}
                onChange={(e) => setSlug(e.target.value)}
                aria-label="Template"
                className="h-8 rounded-lg border border-line bg-white px-2 text-xs text-ink focus:border-accent focus:outline-none"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.short}
                    {t.slug === preview.industry ? " (chosen)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <ScaledFrame url={url ? url.replace(/^https?:\/\//, "") : `preview/${preview.id}`} maxHeight={560}>
              <SiteTemplate
                template={getTemplate(slug ?? preview.industry) ?? TEMPLATES[0]!}
                brand={{
                  company: preview.company_name,
                  logoUrl: preview.logo_url,
                  color: preview.brand_color,
                  tagline: preview.tagline,
                  description: preview.description,
                  services: preview.services,
                  phone: preview.phone,
                  email: preview.email,
                  city: preview.city,
                }}
              />
            </ScaledFrame>
            <p className="mt-2 text-xs text-muted">Scroll inside the frame to see the whole page. Viewing here doesn&apos;t count as a visitor view.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
