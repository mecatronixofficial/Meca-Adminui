import { useState, type FormEvent } from "react";
import { api } from "../../api/api";
import { useFeedback } from "../../components/ui/feedback-context";
import { toPayload, validate, type FieldDef, type Values } from "../../components/ui/fields";
import { FormFields } from "../../components/ui/FormFields";
import { Modal } from "../../components/ui/Modal";
import { Alert, Button, Field, Select } from "../../components/ui/ui";
import { slugify, type PortfolioProject } from "../../lib/portfolio";
import type { Project, Work } from "../../lib/types";

const fields: FieldDef[] = [{
  name: "info", label: "Case-study sections", type: "group", itemLabel: "Section", addLabel: "Add section", required: true, min: 1,
  hint: "Reorder sections to change how the case study reads.",
  fields: [
    { name: "heading", label: "Heading", type: "text", required: true, wide: true },
    { name: "details", label: "Details", type: "textarea", required: true, rows: 5 },
    { name: "img", label: "Section screenshot", type: "image", folder: "works", required: true, wide: true },
  ],
}];

export default function WorkDetails({ project, projects, works, cover, onClose, onSaved }: {
  project: PortfolioProject; projects: Project[]; works: Work[]; cover?: string;
  onClose: () => void; onSaved: (work: Work) => void;
}) {
  const backend = projects.find((item) => slugify(item.project_name) === project.slug);
  const linked = works.filter((work) => backend
    ? work.id === backend.work_id || work.project_id === backend.id || work.project?.id === backend.id
    : !work.project_id && !work.project?.id && slugify(work.title) === project.slug);
  const [workId, setWorkId] = useState(linked[0]?.id ?? "");
  const initialInfo = linked[0]?.info ?? (project.sections?.length ? project.sections : [{ heading: "Overview", details: project.overview || project.summary, img: cover || "" }]);
  const [values, setValues] = useState<Values>({ info: initialInfo.map((section) => ({ ...section, img: section.img || cover || "" })) });
  const [initial, setInitial] = useState(JSON.stringify(values));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { toast, confirm } = useFeedback();
  const dirty = JSON.stringify(values) !== initial;
  const close = async () => {
    if (busy) return;
    if (dirty && !(await confirm({ title: "Discard work details?", message: "Your case-study changes have not been saved.", confirmLabel: "Discard" }))) return;
    onClose();
  };
  async function save(event: FormEvent) {
    event.preventDefault();
    const problem = validate(fields, values);
    if (problem) return setError(problem);
    setBusy(true); setError("");
    try {
      const current = linked.find((item) => item.id === workId);
      const body = { ...toPayload(fields, values), title: current?.title ?? project.client, project_id: backend?.id ?? null, is_active: current?.is_active ?? true };
      const { data, message } = await api<Work>(current ? "work/edit/" + current.id : "work/add", { method: current ? "PUT" : "POST", body });
      toast.success(message || "Work details saved.");
      onSaved(data);
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  return <Modal open onClose={() => void close()} title={"Work details: " + project.client} size="xl" description="Save the case study to publish these details on the website.">
    <form onSubmit={save} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <fieldset disabled={busy} className="grid gap-5">
        {linked.length > 1 && <Field label="Case study" htmlFor="linked-work">
          <Select id="linked-work" value={workId} onChange={async (event) => {
            const id = event.target.value;
            if (dirty && !(await confirm({ title: "Discard work details?", message: "Your changes have not been saved.", confirmLabel: "Discard" }))) return;
            const next = { info: linked.find((work) => work.id === id)!.info };
            setWorkId(id); setValues(next); setInitial(JSON.stringify(next)); setError("");
          }}>{linked.map((work) => <option key={work.id} value={work.id}>{work.title}</option>)}</Select>
        </Field>}
        <FormFields fields={fields} values={values} onChange={setValues} />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => void close()}>Cancel</Button><Button type="submit" loading={busy}>Save work details</Button></div>
      </fieldset>
    </form>
  </Modal>;
}
