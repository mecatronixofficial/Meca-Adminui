import { ArrowRight, ArrowUpRight, Check, GalleryHorizontalEnd, Link2 } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Stack, Thumb } from "../../components/ui/ui";
import type { Values } from "../../components/ui/fields";
import { formatDateTime } from "../../lib/format";
import type { Banner } from "../../lib/types";

const MAX_HIGHLIGHTS = 4;

const config: ResourceConfig<Banner> = {
  title: "Banners",
  noun: "banner",
  description: "Highlights shown on the website's home page. Each banner needs its own position number.",
  listPath: "banner/get",
  createPath: "banner/add",
  updatePath: (row) => `banner/edit/${row.id}`,
  deletePath: (row) => `banner/delete/${row.id}`,
  label: (row) => row.name,
  emptyIcon: <GalleryHorizontalEnd aria-hidden />,
  emptyHint: "Add a banner to show it in the Highlights section of the home page.",
  formSize: "xl",
  fields: [
    { name: "name", label: "Title", type: "text", required: true, maxLength: 100, placeholder: "e.g. Your business website in 4 weeks" },
    { name: "tag", label: "Label", type: "text", maxLength: 40, placeholder: "e.g. New launch", hint: "Optional. Small label above the title." },
    { name: "description", label: "Description", type: "textarea", required: true, maxLength: 500, rows: 3 },
    {
      name: "highlights",
      label: "Highlights",
      type: "list",
      placeholder: "e.g. Live in 4 weeks",
      addLabel: "Add highlight",
      hint: `Optional. Up to ${MAX_HIGHLIGHTS} short points, 60 characters each.`,
    },
    { name: "cta_label", label: "Button text", type: "text", maxLength: 40, placeholder: "e.g. Book a free call", hint: "Optional. Leave both button fields empty to show “Start a project”." },
    { name: "cta_link", label: "Button link", type: "text", maxLength: 300, placeholder: "/contact or https://…", hint: "A page on the site (/contact, /work) or a full https:// address." },
    { name: "img", label: "Image", type: "image", folder: "banners", required: true, wide: true },
    { name: "position", label: "Position", type: "number", min: 1, required: true, hint: "1 shows first. Two banners can't share a position." },
    { name: "time", label: "Date", type: "datetime", hint: "Optional. Defaults to now." },
    { name: "is_active", label: "Active", type: "switch", description: "Show this banner on the website." },
  ],
  formExtra: (values) => <BannerPreview values={values} />,
  columns: [
    {
      header: "Banner",
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Thumb src={row.img} className="h-10 w-16" />
          <Stack primary={row.name} secondary={row.description} />
        </span>
      ),
    },
    {
      header: "Details",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-1.5">
          {row.tag && <Badge tone="accent">{row.tag}</Badge>}
          {row.highlights?.length > 0 && <Badge>{row.highlights.length} highlight{row.highlights.length === 1 ? "" : "s"}</Badge>}
          {row.cta_label && row.cta_link && (
            <Badge tone="info">
              <Link2 aria-hidden className="size-3" /> {row.cta_label}
            </Badge>
          )}
          {!row.tag && !row.highlights?.length && !row.cta_label && <span className="text-muted">—</span>}
        </span>
      ),
    },
    { header: "Position", cell: (row) => <span className="font-mono tabular-nums">#{row.position}</span> },
    { header: "Status", cell: (row) => (row.is_active ? <Badge tone="success" dot>Active</Badge> : <Badge>Hidden</Badge>) },
    { header: "Date", cell: (row) => formatDateTime(row.time), className: "hidden md:table-cell whitespace-nowrap" },
  ],
};

export default function Banners() {
  return <ResourcePage config={config} />;
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Live preview of the banner as the home page shows it (same layout, smaller). */
function BannerPreview({ values }: { values: Values }) {
  const title = str(values.name);
  const tag = str(values.tag);
  const description = str(values.description);
  const img = str(values.img);
  const highlights = ((values.highlights as string[] | undefined) ?? []).map((h) => h.trim()).filter(Boolean);
  const ctaLabel = str(values.cta_label);
  const ctaLink = str(values.cta_link);
  const external = /^https?:\/\//i.test(ctaLink);
  const buttonIncomplete = !!ctaLabel !== !!ctaLink;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="text-sm font-medium text-ink">Preview</p>
      <p className="mt-0.5 text-xs text-muted">How the banner looks in the home page's Highlights section.</p>
      <div className="mt-3 grid overflow-hidden rounded-2xl bg-ink text-white sm:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-[16/10] bg-surface sm:order-2 sm:aspect-auto sm:min-h-[260px]">
          {img ? (
            <img src={img} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-white/40">Upload an image</span>
          )}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent sm:bg-gradient-to-r sm:from-ink sm:via-ink/10" />
        </div>
        <div className="relative flex flex-col p-5">
          <span className="self-start rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">{tag || "Highlight"}</span>
          <p className="mt-3 text-lg font-semibold leading-snug tracking-tight">{title || "Banner title"}</p>
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/70">{description || "Description"}</p>
          {highlights.length > 0 && (
            <ul className="mt-3 grid gap-1.5 text-[12.5px] text-white/85 sm:grid-cols-2">
              {highlights.slice(0, MAX_HIGHLIGHTS).map((point, i) => (
                <li key={`${point}-${i}`} className="flex items-start gap-2">
                  <span className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-accent/25 text-accent-glow">
                    <Check aria-hidden className="size-2.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-accent-strong px-3.5 py-1.5 text-xs font-medium">
            {ctaLabel && ctaLink ? ctaLabel : "Start a project"}
            {external && ctaLabel ? <ArrowUpRight aria-hidden className="size-3.5" /> : <ArrowRight aria-hidden className="size-3.5" />}
          </span>
        </div>
      </div>
      {highlights.length > MAX_HIGHLIGHTS && <p className="mt-2 text-xs text-danger">Only {MAX_HIGHLIGHTS} highlights can be saved — remove {highlights.length - MAX_HIGHLIGHTS}.</p>}
      {buttonIncomplete && <p className="mt-2 text-xs text-warning">Add both the button text and its link, or leave both empty.</p>}
    </div>
  );
}
