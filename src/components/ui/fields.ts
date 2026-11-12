import { toLocalInput } from "../../lib/format";
import type { UploadFolder } from "../../lib/types";

/**
 * Declarative form fields. A resource page lists its fields once; these helpers
 * convert records to form values, check them and build the API payload.
 */

export type Values = Record<string, unknown>;
export interface Option {
  value: string;
  label: string;
}

interface BaseField {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Fields are half width on wide screens unless they hold long content. */
  wide?: boolean;
}

export type FieldDef = BaseField &
  (
    | { type: "text" | "email" | "url" | "tel" | "password" | "time"; placeholder?: string; maxLength?: number; autoComplete?: string }
    | { type: "textarea"; rows?: number; maxLength?: number; placeholder?: string }
    | { type: "number"; min?: number; max?: number; step?: number }
    | { type: "date" | "datetime"; nullable?: boolean }
    | { type: "switch"; description?: string }
    | { type: "select"; options: Option[]; placeholder?: string; nullable?: boolean }
    | { type: "image" | "images"; folder: UploadFolder }
    | { type: "list"; inputType?: "text" | "email" | "tel"; placeholder?: string; addLabel?: string }
    | { type: "group"; fields: FieldDef[]; itemLabel: string; addLabel: string; min?: number }
  );

export const isWide = (field: FieldDef) => field.wide ?? ["textarea", "images", "list", "group"].includes(field.type);

export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "switch":
      return true;
    case "images":
    case "list":
      return [];
    case "group":
      return Array.from({ length: field.min ?? 0 }, () => emptyValues(field.fields));
    default:
      return "";
  }
}

export const emptyValues = (fields: FieldDef[]): Values => Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));

/** API record -> form values (numbers and dates become input strings). */
export function toValues(fields: FieldDef[], record: Record<string, unknown>): Values {
  return Object.fromEntries(
    fields.map((field) => {
      const raw = record[field.name];
      if (raw === undefined || raw === null) return [field.name, emptyValue(field)];
      switch (field.type) {
        case "number":
          return [field.name, String(raw)];
        case "datetime":
          return [field.name, toLocalInput(String(raw))];
        case "date":
          return [field.name, String(raw).slice(0, 10)];
        case "group":
          return [field.name, Array.isArray(raw) ? raw.map((item) => toValues(field.fields, (item ?? {}) as Record<string, unknown>)) : []];
        case "images":
        case "list":
          return [field.name, Array.isArray(raw) ? raw.map(String) : []];
        default:
          return [field.name, raw];
      }
    }),
  );
}

/** Form values -> request body in the types the API validates. */
export function toPayload(fields: FieldDef[], values: Values): Values {
  const out: Values = {};
  for (const field of fields) {
    const value = values[field.name];
    switch (field.type) {
      case "number":
        if (value !== "" && value !== undefined) out[field.name] = Number(value);
        break;
      case "date":
      case "select":
        if (value) out[field.name] = value;
        else if (field.nullable) out[field.name] = null;
        break;
      case "datetime":
        if (value) out[field.name] = new Date(String(value)).toISOString();
        else if (field.nullable) out[field.name] = null;
        break;
      case "list":
        out[field.name] = ((value as string[]) ?? []).map((v) => v.trim()).filter(Boolean);
        break;
      case "group":
        out[field.name] = ((value as Values[]) ?? []).map((item) => toPayload(field.fields, item));
        break;
      case "text":
      case "email":
      case "url":
      case "tel":
      case "password":
      case "time":
      case "textarea":
        out[field.name] = typeof value === "string" ? value.trim() : value;
        break;
      default:
        out[field.name] = value;
    }
  }
  return out;
}

/**
 * Checks what native `required` can't: uploads, lists and repeaters.
 * Returns a message for the first problem, or null.
 */
export function validate(fields: FieldDef[], values: Values, prefix = ""): string | null {
  for (const field of fields) {
    const value = values[field.name];
    const name = `${prefix}${field.label}`;
    if (field.type === "image" && field.required && !value) return `${name}: upload an image.`;
    if (field.type === "images" && field.required && !(value as string[])?.length) return `${name}: add at least one image.`;
    if (field.type === "list" && field.required && !(value as string[])?.some((v) => v.trim())) return `${name}: add at least one.`;
    if (field.type === "group") {
      const items = (value as Values[]) ?? [];
      if ((field.min ?? 0) > items.length || (field.required && !items.length)) return `${name}: add at least ${Math.max(field.min ?? 1, 1)}.`;
      for (const [index, item] of items.entries()) {
        const problem = validate(field.fields, item, `${field.itemLabel} ${index + 1} › `);
        if (problem) return problem;
      }
    }
  }
  return null;
}
