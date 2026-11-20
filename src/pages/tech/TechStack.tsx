import { ArrowUpRight, Cpu, RotateCcw, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, CLIENT_URL, useApiData } from "../../api/api";
import { buttonClass } from "../../components/ui/button-class";
import { useFeedback } from "../../components/ui/feedback-context";
import { toPayload, toValues, validate, type FieldDef, type Values } from "../../components/ui/fields";
import { FormFields } from "../../components/ui/FormFields";
import { Alert, Badge, Button, Card, CardHeader, ErrorState, PageHeader, Spinner } from "../../components/ui/ui";
import { formatDateTime, timeAgo } from "../../lib/format";
import { useUnsavedChanges } from "../../lib/useUnsavedChanges";

/* The website's "Technology" list: home page, hero and About page. */

interface TechStack {
  groups: { category: string; items: string[] }[];
  /** null until an admin first saves (the API then returns the website's original list). */
  updatedAt: string | null;
}

const MAX_GROUPS = 8;
const MAX_ITEMS = 12;

const fields: FieldDef[] = [
  {
    name: "groups",
    label: "Technology groups",
    type: "group",
    itemLabel: "Group",
    addLabel: "Add group",
    required: true,
    min: 1,
    hint: `Up to ${MAX_GROUPS} groups, shown in this order. The website shows official logos for technologies it recognises.`,
    fields: [
      { name: "category", label: "Group name", type: "text", required: true, maxLength: 40, placeholder: "e.g. Frontend", wide: true },
      { name: "items", label: "Technologies", type: "list", required: true, addLabel: "Add technology", placeholder: "e.g. React" },
    ],
  },
];

/** Client-side checks the API also enforces, so mistakes show before saving. */
function problems(values: Values): string | null {
  const basic = validate(fields, values);
  if (basic) return basic;
  const groups = (values.groups as Values[]) ?? [];
  if (groups.length > MAX_GROUPS) return `Use at most ${MAX_GROUPS} groups.`;
  const names = groups.map((group) => String(group.category ?? "").trim().toLowerCase());
  if (new Set(names).size !== names.length) return "Each group name can only be used once.";
  const crowded = groups.find((group) => ((group.items as string[]) ?? []).filter((item) => item.trim()).length > MAX_ITEMS);
  if (crowded) return `${String(crowded.category)}: use at most ${MAX_ITEMS} technologies per group.`;
  const longName = groups.flatMap((group) => (group.items as string[]) ?? []).find((item) => item.trim().length > 40);
  if (longName) return `“${longName.trim().slice(0, 20)}…” is too long: keep technology names to 40 characters.`;
  return null;
}

export default function TechStackPage() {
  const { toast, confirm } = useFeedback();
  const source = useApiData<TechStack>("settings/tech");
  const [values, setValues] = useState<Values | null>(null);
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the form once the list arrives (and after each save)
  const [loadedFor, setLoadedFor] = useState<TechStack | undefined>();
  if (source.data && source.data !== loadedFor) {
    const form = toValues(fields, source.data as unknown as Record<string, unknown>);
    setLoadedFor(source.data);
    setValues(form);
    setInitial(JSON.stringify(form));
  }

  const dirty = !!values && JSON.stringify(values) !== initial;
  useUnsavedChanges(dirty);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!values) return;
    const problem = problems(values);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      const { message } = await api<TechStack>("settings/tech", { method: "PUT", body: toPayload(fields, values) });
      toast.success(message || "Technology list saved");
      setInitial(JSON.stringify(values));
      source.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    if (!(await confirm({ title: "Discard changes?", message: "Your edits to the technology list haven't been saved.", confirmLabel: "Discard" }))) return;
    setValues(JSON.parse(initial) as Values);
    setError(null);
  };

  const groups = ((values?.groups as Values[]) ?? []).filter((group) => String(group.category ?? "").trim());

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Technology"
        eyebrow="Website"
        description="The technologies listed on the home page, hero and About page. Changes go live within seconds of saving."
        actions={
          <>
            {CLIENT_URL && (
              <a href={CLIENT_URL} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
                View website <ArrowUpRight className="size-4" />
              </a>
            )}
            <Button type="submit" icon={<Save className="size-4" />} loading={saving} disabled={!dirty}>
              Save list
            </Button>
          </>
        }
      />

      {source.error && !values ? (
        <Card>
          <ErrorState message={source.error} onRetry={source.reload} />
        </Card>
      ) : !values || !source.data ? (
        <Spinner />
      ) : (
        <>
          <p className="-mt-2 mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-ink">
            {source.data.updatedAt ? (
              <span title={formatDateTime(source.data.updatedAt)}>Last saved {timeAgo(source.data.updatedAt)}</span>
            ) : (
              <>
                <Badge tone="info">Not saved yet</Badge> This is the list currently on the website. Edit and save to manage it here.
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
            <Card className="min-w-0">
              <CardHeader title="Groups" description="Repeated technologies in a group are removed when you save." />
              <fieldset disabled={saving} className="p-5">
                <FormFields fields={[{ ...fields[0], label: "" }]} values={values} onChange={setValues} />
              </fieldset>
            </Card>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <Card className="overflow-hidden">
                <div className="bg-ink px-5 py-4 text-white">
                  <p className="text-label text-accent-glow">On the website</p>
                  <p className="mt-1 text-xs text-white/60">Technology section</p>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  {groups.length ? (
                    groups.map((group, index) => (
                      <div key={index}>
                        <p className="text-xs font-medium tracking-wide text-muted uppercase">{String(group.category)}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {((group.items as string[]) ?? [])
                            .filter((item) => item.trim())
                            .map((item, i) => (
                              <Badge key={i}>{item.trim()}</Badge>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-muted">
                      <Cpu aria-hidden className="size-4" /> Add a group to preview it.
                    </p>
                  )}
                </div>
              </Card>
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
                  Save list
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
}
