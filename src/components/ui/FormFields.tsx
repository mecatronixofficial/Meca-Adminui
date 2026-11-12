import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { uploadFile } from "../../api/api";
import { cn } from "../../lib/cn";
import type { UploadFolder } from "../../lib/types";
import { useFeedback } from "./feedback-context";
import { emptyValues, isWide, type FieldDef, type Values } from "./fields";
import { Button, Field, IconButton, Input, Select, Switch, Textarea } from "./ui";

/** Renders a list of FieldDefs as a two-column form grid. */
export function FormFields({ fields, values, onChange }: { fields: FieldDef[]; values: Values; onChange: (values: Values) => void }) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={cn(isWide(field) && "sm:col-span-2")}>
          <FieldInput field={field} value={values[field.name]} onChange={(value) => onChange({ ...values, [field.name]: value })} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (value: unknown) => void }) {
  const id = useId();
  const text = typeof value === "string" ? value : value == null ? "" : String(value);
  const common = { label: field.label, htmlFor: id, hint: field.hint, required: field.required };

  switch (field.type) {
    case "switch":
      return <Switch id={id} checked={!!value} onChange={onChange} label={field.label} description={field.description ?? field.hint} />;

    case "textarea":
      return (
        <Field {...common} counter={field.maxLength ? { value: text.length, max: field.maxLength } : undefined}>
          <Textarea
            id={id}
            rows={field.rows}
            value={text}
            required={field.required}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "number":
      return (
        <Field {...common}>
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            value={text}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "date":
    case "datetime":
      return (
        <Field {...common}>
          <Input id={id} type={field.type === "date" ? "date" : "datetime-local"} value={text} required={field.required} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );

    case "select":
      return (
        <Field {...common}>
          <Select id={id} value={text} required={field.required} onChange={(e) => onChange(e.target.value)}>
            <option value="">{field.placeholder ?? "Select…"}</option>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );

    case "image":
      return (
        <Field {...common}>
          <ImageInput id={id} folder={field.folder} value={text} onChange={onChange} />
        </Field>
      );

    case "images":
      return (
        <Field {...common}>
          <ImagesInput id={id} folder={field.folder} value={(value as string[]) ?? []} onChange={onChange} />
        </Field>
      );

    case "list":
      return (
        <Field {...common}>
          <ListInput id={id} field={field} value={(value as string[]) ?? []} onChange={onChange} />
        </Field>
      );

    case "group":
      return <GroupInput field={field} value={(value as Values[]) ?? []} onChange={onChange} />;

    default:
      return (
        <Field {...common} counter={field.maxLength ? { value: text.length, max: field.maxLength } : undefined}>
          <Input
            id={id}
            type={field.type}
            value={text}
            required={field.required}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete ?? "off"}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}

/* ---------- Uploads ---------- */

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB = 10;

function useUpload(folder: UploadFolder) {
  const { toast } = useFeedback();
  const [busy, setBusy] = useState(false);
  const run = async (files: File[]): Promise<string[]> => {
    const valid = files.filter((file) => {
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error(`${file.name}: use a JPEG, PNG, WebP or GIF image.`);
        return false;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_MB} MB.`);
        return false;
      }
      return true;
    });
    if (!valid.length) return [];
    setBusy(true);
    const urls: string[] = [];
    try {
      for (const file of valid) urls.push(await uploadFile(file, folder));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
    return urls;
  };
  return { busy, run };
}

/** Drop target behaviour shared by the single and multi image inputs. */
function useDrop(onFiles: (files: File[]) => void) {
  const [over, setOver] = useState(false);
  return {
    over,
    props: {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) onFiles(files);
      },
    },
  };
}

function ImageInput({ id, folder, value, onChange }: { id: string; folder: UploadFolder; value: string; onChange: (value: string) => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload(folder);
  const take = async (files: File[]) => {
    const [url] = await run(files.slice(0, 1));
    if (url) onChange(url);
  };
  const drop = useDrop(take);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => picker.current?.click()}
        {...drop.props}
        className={cn(
          "group relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-paper text-muted transition-colors hover:border-accent hover:text-accent-ink",
          drop.over ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong",
        )}
        aria-label={value ? "Replace image" : "Upload image"}
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6" />}
      </button>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<Upload className="size-3.5" />} loading={busy} onClick={() => picker.current?.click()}>
            {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange("")}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">Drop or choose a JPEG, PNG, WebP or GIF (max {MAX_MB} MB).</p>
      </div>
      <input
        id={id}
        ref={picker}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void take(files);
        }}
      />
    </div>
  );
}

function ImagesInput({ id, folder, value, onChange }: { id: string; folder: UploadFolder; value: string[]; onChange: (value: string[]) => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const { busy, run } = useUpload(folder);
  const add = async (files: File[]) => {
    const urls = await run(files);
    if (urls.length) onChange([...value, ...urls]);
  };
  const drop = useDrop(add);
  const move = (from: number, to: number) => {
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {value.map((url, index) => (
        <div key={url + index} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper">
          <img src={url} alt={`Image ${index + 1}`} className="size-full object-cover" />
          {index === 0 && <span className="absolute top-1.5 left-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-medium text-white">Cover</span>}
          <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {index > 0 && (
              <IconButton label="Move left" className="size-7 bg-white/95 shadow-sm" onClick={() => move(index, index - 1)}>
                <ArrowUp className="size-3.5 -rotate-90" />
              </IconButton>
            )}
            <IconButton label="Remove image" tone="danger" className="size-7 bg-white/95 shadow-sm" onClick={() => onChange(value.filter((_, i) => i !== index))}>
              <Trash2 className="size-3.5" />
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => picker.current?.click()}
        disabled={busy}
        {...drop.props}
        className={cn(
          "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed bg-paper text-xs text-muted transition-colors hover:border-accent hover:text-accent-ink",
          drop.over ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong",
        )}
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
        {busy ? "Uploading" : "Add images"}
      </button>
      <input
        id={id}
        ref={picker}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void add(files);
        }}
      />
    </div>
  );
}

/* ---------- Repeaters ---------- */

function ListInput({ id, field, value, onChange }: { id: string; field: Extract<FieldDef, { type: "list" }>; value: string[]; onChange: (value: string[]) => void }) {
  const rows = value.length ? value : [""];
  return (
    <div className="flex flex-col gap-2">
      {rows.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            id={index === 0 ? id : undefined}
            type={field.inputType ?? "text"}
            value={item}
            placeholder={field.placeholder}
            aria-label={`${field.label} ${index + 1}`}
            onChange={(e) => onChange(rows.map((v, i) => (i === index ? e.target.value : v)))}
          />
          <IconButton label="Remove" tone="danger" disabled={rows.length === 1 && !item} onClick={() => onChange(rows.filter((_, i) => i !== index))}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <Button size="sm" variant="ghost" className="self-start" icon={<Plus className="size-3.5" />} onClick={() => onChange([...rows, ""])}>
        {field.addLabel ?? "Add another"}
      </Button>
    </div>
  );
}

function GroupInput({ field, value, onChange }: { field: Extract<FieldDef, { type: "group" }>; value: Values[]; onChange: (value: Values[]) => void }) {
  const min = field.min ?? 0;
  const move = (from: number, to: number) => {
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      {field.label && (
        <legend className="mb-2 text-[13px] font-medium text-ink">
          {field.label}
          {field.required && <span className="ml-0.5 text-accent-ink">*</span>}
          {field.hint && <span className="ml-2 font-normal text-muted">{field.hint}</span>}
        </legend>
      )}
      {value.map((item, index) => (
        <div key={index} className="rounded-xl border border-line bg-paper/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
              {field.itemLabel} {index + 1}
            </span>
            <div className="flex items-center">
              <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton label="Move down" disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton
                label={`Remove ${field.itemLabel.toLowerCase()}`}
                tone="danger"
                disabled={value.length <= min}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>
          <FormFields fields={field.fields} values={item} onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))} />
        </div>
      ))}
      <Button variant="secondary" size="sm" className="self-start" icon={<Plus className="size-3.5" />} onClick={() => onChange([...value, emptyValues(field.fields)])}>
        {field.addLabel}
      </Button>
    </fieldset>
  );
}
