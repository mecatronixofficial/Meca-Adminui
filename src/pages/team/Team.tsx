import { Mail, UsersRound } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Stack, Thumb } from "../../components/ui/ui";
import type { Values } from "../../components/ui/fields";
import type { TeamMember } from "../../lib/types";

const config: ResourceConfig<TeamMember> = {
  title: "Team & founders",
  noun: "team member",
  description: "People shown in “Meet our founders” on the website's About page, in position order.",
  listPath: "team/get",
  createPath: "team/add",
  updatePath: (row) => `team/edit/${row.id}`,
  deletePath: (row) => `team/delete/${row.id}`,
  label: (row) => row.name,
  createLabel: "Add person",
  emptyIcon: <UsersRound aria-hidden />,
  emptyHint: "Add your founder and co-founder to show them on the About page.",
  defaults: { position: "1" },
  fields: [
    { name: "name", label: "Full name", type: "text", required: true, maxLength: 100, placeholder: "e.g. Arun Kumar" },
    { name: "role", label: "Role", type: "text", required: true, maxLength: 80, placeholder: "e.g. Founder & CEO" },
    { name: "bio", label: "Bio", type: "textarea", maxLength: 600, rows: 5, placeholder: "Background, experience and what they lead at Mecatronix." },
    { name: "photo", label: "Photo", type: "image", folder: "team", required: true, wide: true, hint: "A portrait photo (taller than wide) looks best." },
    { name: "linkedin", label: "LinkedIn", type: "url", maxLength: 300, placeholder: "https://www.linkedin.com/in/…", hint: "Optional." },
    { name: "email", label: "Email", type: "email", maxLength: 150, hint: "Optional. Shown publicly on the About page." },
    { name: "position", label: "Position", type: "number", min: 1, required: true, hint: "1 shows first (e.g. Founder 1, Co-founder 2)." },
    { name: "is_active", label: "Show on website", type: "switch", description: "Turn off to hide this person without deleting them." },
  ],
  formExtra: (values) => <MemberPreview values={values} />,
  columns: [
    {
      header: "Person",
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Thumb src={row.photo} className="size-11 rounded-full" />
          <Stack primary={row.name} secondary={row.role} />
        </span>
      ),
    },
    {
      header: "Links",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="flex flex-wrap gap-1.5">
          {row.linkedin && <Badge tone="info">LinkedIn</Badge>}
          {row.email && (
            <Badge>
              <Mail aria-hidden className="size-3" /> Email
            </Badge>
          )}
          {!row.linkedin && !row.email && <span className="text-muted">—</span>}
        </span>
      ),
    },
    { header: "Position", cell: (row) => <span className="font-mono tabular-nums">#{row.position}</span> },
    { header: "Status", cell: (row) => (row.is_active ? <Badge tone="success" dot>Shown</Badge> : <Badge>Hidden</Badge>) },
  ],
};

export default function Team() {
  return <ResourcePage config={config} />;
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Live preview of the card on the About page. */
function MemberPreview({ values }: { values: Values }) {
  const name = str(values.name);
  const role = str(values.role);
  const bio = str(values.bio);
  const photo = str(values.photo);
  const linkedin = str(values.linkedin);
  const email = str(values.email);
  const badLinkedin = linkedin && !/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/\S+$/i.test(linkedin);

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="text-sm font-medium text-ink">Preview</p>
      <p className="mt-0.5 text-xs text-muted">How this person appears in “Meet our founders” on the About page.</p>
      <div className="mt-3 grid overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-[170px_1fr]">
        <div className="relative aspect-[4/5] bg-paper sm:aspect-auto sm:min-h-[220px]">
          {photo ? (
            <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-muted">Upload a photo</span>
          )}
        </div>
        <div className="flex flex-col p-5">
          <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-accent-ink">{role || "Role"}</span>
          <p className="mt-3 text-lg font-semibold tracking-tight text-ink">{name || "Full name"}</p>
          <p className="mt-2 line-clamp-5 whitespace-pre-line text-[13px] leading-relaxed text-muted-ink">{bio || "Bio"}</p>
          {(linkedin || email) && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {linkedin && <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink">LinkedIn</span>}
              {email && <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink">{email}</span>}
            </div>
          )}
        </div>
      </div>
      {badLinkedin && <p className="mt-2 text-xs text-warning">LinkedIn must be a https://linkedin.com/… profile link.</p>}
    </div>
  );
}
