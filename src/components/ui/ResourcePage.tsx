import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api, useApiData } from "../../api/api";
import { cn } from "../../lib/cn";
import type { Paginated } from "../../lib/types";
import { useFeedback } from "./feedback-context";
import { emptyValues, toPayload, toValues, validate, type FieldDef, type Option, type Values } from "./fields";
import { FormFields } from "./FormFields";
import { Modal } from "./Modal";
import { Alert, Button, Card, EmptyState, ErrorState, IconButton, PageHeader, Pagination, SearchInput, Segmented, Select, SkeletonRows } from "./ui";

/**
 * List + create/edit/delete screen for one API resource, driven by config.
 * Lists are requested with `page`/`limit`/`search`, which every list endpoint supports.
 */

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface RowContext {
  reload: () => void;
  edit: () => void;
}

export interface ResourceConfig<T extends { id: string }> {
  title: string;
  /** Lower-case singular noun used in buttons and messages, e.g. "banner". */
  noun: string;
  description?: string;
  listPath: string;
  createPath?: string;
  updatePath?: (row: T) => string;
  deletePath?: (row: T) => string;
  /** Short name shown in the delete confirmation. */
  label: (row: T) => string;
  columns: Column<T>[];
  /** Form fields; a function lets create and edit differ (e.g. a required password on create). */
  fields?: FieldDef[] | ((row: T | null) => FieldDef[]);
  defaults?: Values;
  /** Adjusts the generated payload before it is sent. */
  payload?: (body: Values, row: T | null) => Values;
  filters?: { name: string; label: string; options: Option[] }[];
  searchPlaceholder?: string;
  rowActions?: (row: T, ctx: RowContext) => ReactNode;
  /** Extra content under the form fields, e.g. live invoice totals. */
  formExtra?: (values: Values) => ReactNode;
  formSize?: "md" | "lg" | "xl";
  /** Asked before a create is sent (e.g. vouchers email every subscriber). */
  confirmCreate?: { title: string; message: string; confirmLabel: string };
  createLabel?: string;
  emptyHint?: string;
  emptyIcon?: ReactNode;
  headerActions?: ReactNode;
  /** Called after a successful create, update or delete. */
  onChange?: () => void;
}

const PAGE_SIZE = 20;

/** Bump `refreshKey` to reload the list after a change made outside this component. */
export function ResourcePage<T extends { id: string }>({ config, refreshKey = 0 }: { config: ResourceConfig<T>; refreshKey?: number }) {
  const { toast, confirm } = useFeedback();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<{ row: T | null; values: Values } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const initialValues = useRef("");

  const list = useApiData<Paginated<T>>(config.listPath, { page, limit: PAGE_SIZE, search, ...filters });
  const { reload } = list;
  useEffect(() => {
    if (refreshKey) reload();
  }, [refreshKey, reload]);
  const result = list.data ?? list.stale;
  const rows = result?.items ?? [];

  const fieldsFor = (row: T | null) => (typeof config.fields === "function" ? config.fields(row) : (config.fields ?? []));

  const openForm = (row: T | null) => {
    const fields = fieldsFor(row);
    const values = row ? toValues(fields, row as unknown as Record<string, unknown>) : { ...emptyValues(fields), ...config.defaults };
    initialValues.current = JSON.stringify(values);
    setFormError(null);
    setEditing({ row, values });
  };

  const closeForm = async () => {
    if (saving || !editing) return;
    if (JSON.stringify(editing.values) !== initialValues.current) {
      const discard = await confirm({ title: "Discard changes?", message: "Your edits to this form haven't been saved.", confirmLabel: "Discard" });
      if (!discard) return;
    }
    setEditing(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const { row, values } = editing;
    const fields = fieldsFor(row);
    const problem = validate(fields, values);
    if (problem) return setFormError(problem);

    if (!row && config.confirmCreate) {
      const ok = await confirm({ ...config.confirmCreate, tone: "primary" });
      if (!ok) return;
    }

    const body = toPayload(fields, values);
    setSaving(true);
    setFormError(null);
    try {
      const { message } = row
        ? await api(config.updatePath!(row), { method: "PUT", body: config.payload ? config.payload(body, row) : body })
        : await api(config.createPath!, { method: "POST", body: config.payload ? config.payload(body, null) : body });
      toast.success(message || `Saved ${config.noun}`);
      setEditing(null);
      list.reload();
      config.onChange?.();
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: T) => {
    const ok = await confirm({
      title: `Delete ${config.noun}?`,
      message: (
        <>
          <strong className="text-ink">{config.label(row)}</strong> will be permanently deleted. This can&apos;t be undone.
        </>
      ),
    });
    if (!ok) return;
    try {
      const { message } = await api(config.deletePath!(row), { method: "DELETE" });
      toast.success(message || `Deleted ${config.noun}`);
      // Step back if the last row on this page went away
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else list.reload();
      config.onChange?.();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const setFilter = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const canCreate = !!config.createPath && !!config.fields;
  const canEdit = !!config.updatePath && !!config.fields;
  const hasActions = canEdit || !!config.deletePath || !!config.rowActions;
  const filtered = !!search || Object.values(filters).some(Boolean);
  const createButton = canCreate && (
    <Button icon={<Plus className="size-4" />} onClick={() => openForm(null)}>
      {config.createLabel ?? `New ${config.noun}`}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          (config.headerActions || canCreate) && (
            <>
              {config.headerActions}
              {createButton}
            </>
          )
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            placeholder={config.searchPlaceholder ?? `Search ${config.title.toLowerCase()}`}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          {config.filters?.map((filter) =>
            filter.options.length <= 3 ? (
              <Segmented
                key={filter.name}
                label={filter.label}
                value={filters[filter.name] ?? ""}
                onChange={(value) => setFilter(filter.name, value)}
                options={[{ value: "", label: "All" }, ...filter.options]}
              />
            ) : (
              <Select
                key={filter.name}
                aria-label={filter.label}
                className="sm:w-48"
                value={filters[filter.name] ?? ""}
                onChange={(e) => setFilter(filter.name, e.target.value)}
              >
                <option value="">{filter.label}: all</option>
                {filter.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ),
          )}
          {result?.meta && (
            <span className="text-sm text-muted tabular-nums sm:ml-auto">
              {result.meta.total} {result.meta.total === 1 ? config.noun : "total"}
            </span>
          )}
        </div>

        {list.error && !result ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !result ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={filtered ? undefined : config.emptyIcon}
            title={filtered ? "No matches" : `No ${config.title.toLowerCase()} yet`}
            description={filtered ? "Try a different search or filter." : config.emptyHint}
            action={!filtered ? createButton || undefined : undefined}
          />
        ) : (
          <div className={cn("overflow-x-auto transition-opacity", list.loading && "opacity-60")}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper/50 text-xs text-muted">
                  {config.columns.map((column) => (
                    <th key={column.header} scope="col" className={cn("px-4 py-2.5 font-medium whitespace-nowrap", column.className)}>
                      {column.header}
                    </th>
                  ))}
                  {hasActions && (
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line transition-colors last:border-0 hover:bg-paper/60">
                    {config.columns.map((column) => (
                      <td key={column.header} className={cn("max-w-[22rem] px-4 py-3 align-middle text-muted-ink", column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {config.rowActions?.(row, { reload: list.reload, edit: () => openForm(row) })}
                          {canEdit && (
                            <IconButton label={`Edit ${config.label(row)}`} onClick={() => openForm(row)}>
                              <Pencil className="size-4" />
                            </IconButton>
                          )}
                          {config.deletePath && (
                            <IconButton label={`Delete ${config.label(row)}`} tone="danger" onClick={() => remove(row)}>
                              <Trash2 className="size-4" />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {result?.meta && result.meta.totalPages > 1 && <Pagination meta={result.meta} onPage={setPage} />}
      </Card>

      {editing && (
        <Modal
          open
          onClose={closeForm}
          title={editing.row ? `Edit ${config.noun}` : (config.createLabel ?? `New ${config.noun}`)}
          description={editing.row ? config.label(editing.row) : undefined}
          size={config.formSize ?? "lg"}
          footer={
            <>
              <Button variant="secondary" onClick={closeForm} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" form="resource-form" loading={saving}>
                {editing.row ? "Save changes" : (config.confirmCreate?.confirmLabel ?? `Create ${config.noun}`)}
              </Button>
            </>
          }
        >
          <form id="resource-form" onSubmit={submit} className="flex flex-col gap-5">
            {formError && (
              <Alert onDismiss={() => setFormError(null)}>
                <span className="font-medium">Couldn&apos;t save.</span> {formError}
              </Alert>
            )}
            <FormFields fields={fieldsFor(editing.row)} values={editing.values} onChange={(values) => setEditing({ ...editing, values })} />
            {config.formExtra?.(editing.values)}
          </form>
        </Modal>
      )}
    </>
  );
}
