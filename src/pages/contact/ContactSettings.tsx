import { ArrowUpRight, Clock, Globe, Mail, MapPin, MessageCircle, Phone, RotateCcw, Save, Star } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, CLIENT_URL, useApiData } from "../../api/api";
import { buttonClass } from "../../components/ui/button-class";
import { useFeedback } from "../../components/ui/feedback-context";
import { toPayload, toValues, validate, type FieldDef, type Values } from "../../components/ui/fields";
import { FormFields } from "../../components/ui/FormFields";
import { Alert, Badge, Button, Card, CardHeader, ErrorState, PageHeader, Spinner } from "../../components/ui/ui";
import { cn } from "../../lib/cn";
import { formatDateTime, timeAgo } from "../../lib/format";
import type { ContactSettings as Contact, SocialPlatform } from "../../lib/types";

/* Contact details shown on the public website: header, footer, contact page and structured data. */

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "X (Twitter)" },
];

const sections: { key: string; title: string; description: string; icon: ReactNode; field: FieldDef }[] = [
  {
    key: "emails",
    title: "Email addresses",
    description: "The first one is shown in the header, footer and contact page.",
    icon: <Mail />,
    field: {
      name: "emails",
      label: "Emails",
      type: "group",
      itemLabel: "Email",
      addLabel: "Add email",
      required: true,
      min: 1,
      fields: [
        { name: "label", label: "Label", type: "text", maxLength: 60, placeholder: "e.g. General enquiries" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "connect@mecatronix.one" },
      ],
    },
  },
  {
    key: "phones",
    title: "Phone numbers",
    description: "The first is the main “Call us” number. WhatsApp links use the first number marked WhatsApp.",
    icon: <Phone />,
    field: {
      name: "phones",
      label: "Phones",
      type: "group",
      itemLabel: "Phone",
      addLabel: "Add phone",
      required: true,
      min: 1,
      fields: [
        { name: "label", label: "Label", type: "text", maxLength: 60, placeholder: "e.g. Studio, Sales" },
        { name: "number", label: "Number", type: "tel", required: true, placeholder: "+91 83004 54800" },
        { name: "whatsapp", label: "WhatsApp", type: "switch", description: "Use this number for WhatsApp chat links.", wide: true },
      ],
    },
  },
  {
    key: "addresses",
    title: "Addresses",
    description: "The first is your main studio: shown on the map, footer and search results.",
    icon: <MapPin />,
    field: {
      name: "addresses",
      label: "Addresses",
      type: "group",
      itemLabel: "Address",
      addLabel: "Add address",
      required: true,
      min: 1,
      fields: [
        { name: "label", label: "Name", type: "text", maxLength: 80, placeholder: "e.g. Mecatronix Studio" },
        { name: "street", label: "Street address", type: "text", required: true, maxLength: 200, wide: true },
        { name: "city", label: "City", type: "text", required: true, maxLength: 80 },
        { name: "state", label: "State", type: "text", maxLength: 80 },
        { name: "pincode", label: "PIN code", type: "text", maxLength: 12 },
        { name: "country", label: "Country", type: "text", required: true, maxLength: 60 },
        { name: "map_url", label: "Google Maps link", type: "url", wide: true, placeholder: "https://maps.app.goo.gl/…", hint: "Optional. Used for “Open in Maps”." },
        { name: "lat", label: "Latitude", type: "number", min: -90, max: 90, step: 0.0000001, hint: "Optional, e.g. 11.0198784. Places the map pin." },
        { name: "lng", label: "Longitude", type: "number", min: -180, max: 180, step: 0.0000001, hint: "Optional, e.g. 76.9785856. Give both or neither." },
      ],
    },
  },
  {
    key: "socials",
    title: "Social media",
    description: "Icons in the footer and contact page, in this order. Leave empty to hide them.",
    icon: <Globe />,
    field: {
      name: "socials",
      label: "Profiles",
      type: "group",
      itemLabel: "Profile",
      addLabel: "Add profile",
      fields: [
        { name: "platform", label: "Platform", type: "select", required: true, options: PLATFORMS, placeholder: "Choose…" },
        { name: "url", label: "Profile URL", type: "url", required: true, placeholder: "https://" },
      ],
    },
  },
];

const hoursFields: FieldDef[] = [
  {
    name: "days",
    label: "Working days",
    type: "select",
    required: true,
    options: [
      { value: "Mon-Fri", label: "Monday – Friday" },
      { value: "Mon-Sat", label: "Monday – Saturday" },
      { value: "Mon-Sun", label: "Every day" },
    ],
  },
  { name: "open", label: "Opens", type: "time", required: true },
  { name: "close", label: "Closes", type: "time", required: true },
];

const googleFields: FieldDef[] = [
  {
    name: "review_url",
    label: "Google review link",
    type: "url",
    wide: true,
    maxLength: 300,
    placeholder: "https://g.page/r/…/review",
    hint: "Where “Write a review” buttons and the printed QR code send people.",
  },
  {
    name: "google_profile_url",
    label: "Google Business profile",
    type: "url",
    wide: true,
    maxLength: 500,
    placeholder: "https://www.google.com/maps/search/?api=1&query=…",
    hint: "Opens your business on Google Maps with reviews and directions.",
  },
];

const allFields = [...sections.map((s) => s.field), ...hoursFields, ...googleFields];

const toForm = (contact: Contact): Values => ({
  ...toValues(
    [...sections.map((s) => s.field), ...googleFields],
    contact as unknown as Record<string, unknown>,
  ),
  ...contact.hours,
});

function toBody(values: Values) {
  const body = toPayload(allFields, values);
  const { days, open, close, ...rest } = body;
  return { ...rest, hours: { days, open, close } };
}

/** Client-side checks the API also enforces, so mistakes show before saving. */
function problems(values: Values): string | null {
  const groups = validate(allFields, values);
  if (groups) return groups;
  const socials = (values.socials as Values[]) ?? [];
  const platforms = socials.map((s) => s.platform).filter(Boolean);
  if (new Set(platforms).size !== platforms.length) return "Each social platform can only be added once.";
  if (String(values.open) >= String(values.close)) return "Closing time must be after opening time.";
  const halfPlaced = ((values.addresses as Values[]) ?? []).findIndex((a) => (String(a.lat ?? "").trim() === "") !== (String(a.lng ?? "").trim() === ""));
  if (halfPlaced >= 0) return `Address ${halfPlaced + 1}: enter both latitude and longitude, or leave both empty.`;
  return null;
}

export default function ContactSettings() {
  const { toast, confirm } = useFeedback();
  const settings = useApiData<Contact>("settings/contact");
  const [values, setValues] = useState<Values | null>(null);
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the form once the details arrive (and after each save)
  const loaded = settings.data;
  const [loadedFor, setLoadedFor] = useState<Contact | undefined>();
  if (loaded && loaded !== loadedFor) {
    setLoadedFor(loaded);
    const form = toForm(loaded);
    setValues(form);
    setInitial(JSON.stringify(form));
  }

  const dirty = !!values && JSON.stringify(values) !== initial;

  // Warn before leaving the page with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!values) return;
    const problem = problems(values);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      const { message } = await api<Contact>("settings/contact", { method: "PUT", body: toBody(values) });
      toast.success(message || "Contact details saved");
      settings.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    if (!(await confirm({ title: "Discard changes?", message: "Your edits to the contact details haven't been saved.", confirmLabel: "Discard" }))) return;
    setValues(JSON.parse(initial) as Values);
    setError(null);
  };

  const siteContact = CLIENT_URL ? `${CLIENT_URL.replace(/\/+$/, "")}/contact` : undefined;

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Contact details"
        description="Emails, phone numbers, addresses, social media, opening hours and Google links shown on the website. Changes go live within seconds of saving."
        actions={
          <>
            {siteContact && (
              <a href={siteContact} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
                View contact page <ArrowUpRight className="size-4" />
              </a>
            )}
            <Button type="submit" icon={<Save className="size-4" />} loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </>
        }
      />

      {settings.error && !values ? (
        <Card>
          <ErrorState message={settings.error} onRetry={settings.reload} />
        </Card>
      ) : !values || !loaded ? (
        <Spinner />
      ) : (
        <>
          <p className="-mt-2 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-ink">
            {loaded.updatedAt ? (
              <span title={formatDateTime(loaded.updatedAt)}>Last saved {timeAgo(loaded.updatedAt)}</span>
            ) : (
              <>
                <Badge tone="info">Not saved yet</Badge> These are the details currently on the website. Edit and save to manage them here.
              </>
            )}
          </p>

          {error && (
            <div className="mb-5">
              <Alert onDismiss={() => setError(null)}>
                <span className="font-medium">Couldn&apos;t save.</span> {error}
              </Alert>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-6">
              {sections.map((section) => (
                <Card key={section.key}>
                  <CardHeader title={section.title} description={section.description} actions={<SectionIcon>{section.icon}</SectionIcon>} />
                  <div className="p-5">
                    <FormFields fields={[{ ...section.field, label: "" }]} values={values} onChange={setValues} />
                  </div>
                </Card>
              ))}

              <Card>
                <CardHeader title="Opening hours" description="Shown on the contact page and the live “open now” clock (India time)." actions={<SectionIcon><Clock /></SectionIcon>} />
                <div className="p-5">
                  <FormFields fields={hoursFields} values={values} onChange={setValues} />
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Google reviews & profile"
                  description="Links for review buttons, the review QR code and your Google Business listing."
                  actions={<SectionIcon><Star /></SectionIcon>}
                />
                <div className="p-5">
                  <FormFields fields={googleFields} values={values} onChange={setValues} />
                </div>
              </Card>
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <Preview values={values} />
            </aside>
          </div>

          {dirty && (
            <div className="sticky bottom-4 z-20 mt-6 flex animate-rise flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-ink px-5 py-3.5 text-white shadow-lift">
              <span className="text-sm text-white/80">You have unsaved changes.</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={discard} className="text-white/80 hover:bg-white/10 hover:text-white">
                  Discard
                </Button>
                <Button type="submit" size="sm" icon={<Save className="size-3.5" />} loading={saving}>
                  Save changes
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
}

function SectionIcon({ children }: { children: ReactNode }) {
  return <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink [&>svg]:size-[18px]">{children}</span>;
}

/** How the primary details will read on the website. */
function Preview({ values }: { values: Values }) {
  const emails = (values.emails as Values[]) ?? [];
  const phones = (values.phones as Values[]) ?? [];
  const addresses = (values.addresses as Values[]) ?? [];
  const socials = ((values.socials as Values[]) ?? []).filter((s) => s.platform && s.url);
  const whatsapp = phones.find((p) => p.whatsapp && p.number) ?? phones.find((p) => p.number);
  const address = addresses[0];
  const addressLine = address ? [address.street, address.city, address.state, address.pincode].map((part) => String(part ?? "").trim()).filter(Boolean).join(", ") : "";
  const days = { "Mon-Fri": "Mon–Fri", "Mon-Sat": "Mon–Sat", "Mon-Sun": "Every day" }[String(values.days)] ?? String(values.days ?? "");

  return (
    <Card className="overflow-hidden">
      <div className="bg-ink px-5 py-4 text-white">
        <p className="text-label text-accent-glow">On the website</p>
        <p className="mt-1 text-xs text-white/60">Header, footer and contact card</p>
      </div>
      <dl className="divide-y divide-line text-sm">
        <PreviewRow icon={<Mail />} label="Email">
          {String(emails[0]?.email || "—")}
          {emails.length > 1 && <span className="block text-xs text-muted">+{emails.length - 1} more on the contact page</span>}
        </PreviewRow>
        <PreviewRow icon={<Phone />} label="Call us">
          {String(phones[0]?.number || "—")}
        </PreviewRow>
        <PreviewRow icon={<MessageCircle />} label="WhatsApp">
          {whatsapp ? String(whatsapp.number) : "—"}
          {!phones.some((p) => p.whatsapp) && phones.length > 0 && <span className="block text-xs text-warning">No number marked WhatsApp; the first number is used.</span>}
        </PreviewRow>
        <PreviewRow icon={<MapPin />} label={String(address?.label || "Studio")}>
          <span className="whitespace-normal">{addressLine || "—"}</span>
          {address?.country ? <span className="block text-xs text-muted">{String(address.country)}</span> : null}
        </PreviewRow>
        <PreviewRow icon={<Clock />} label="Hours">
          {days} · {String(values.open || "—")}–{String(values.close || "—")} IST
        </PreviewRow>
        <PreviewRow icon={<Globe />} label="Social">
          {socials.length ? (
            <span className="flex flex-wrap gap-1.5 pt-0.5">
              {socials.map((s) => (
                <Badge key={String(s.platform)}>{PLATFORMS.find((p) => p.value === s.platform)?.label ?? String(s.platform)}</Badge>
              ))}
            </span>
          ) : (
            <span className="text-muted">Hidden</span>
          )}
        </PreviewRow>
      </dl>
    </Card>
  );
}

function PreviewRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 px-5 py-3.5">
      <span className={cn("mt-0.5 shrink-0 text-muted [&>svg]:size-4")}>{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-ink">{children}</dd>
      </div>
    </div>
  );
}
