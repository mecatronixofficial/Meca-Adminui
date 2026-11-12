import { ExternalLink, FolderKanban } from "lucide-react";
import { useApiData } from "../../api/api";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Stack, Thumb } from "../../components/ui/ui";
import { externalHref } from "../../lib/format";
import type { Client, Project, Work } from "../../lib/types";

export default function Projects() {
  // Unpaginated: every client and work, for the pickers
  const clients = useApiData<Client[]>("clients/get_all_clients");
  const works = useApiData<Work[]>("work/get");

  const config: ResourceConfig<Project> = {
    title: "Projects",
    noun: "project",
    description: "Portfolio projects. Each belongs to a client and a work (case study).",
    listPath: "project/all",
    createPath: "project/add",
    updatePath: (row) => `project/edit/${row.id}`,
    deletePath: (row) => `project/delete/${row.id}`,
    label: (row) => row.project_name,
    emptyIcon: <FolderKanban aria-hidden />,
    emptyHint:
      clients.data?.length === 0 || works.data?.length === 0
        ? "Add a client and a work first, then create projects for them."
        : "Projects appear in the website portfolio.",
    fields: [
      { name: "project_name", label: "Project name", type: "text", required: true },
      { name: "project_url", label: "Project URL", type: "text", required: true, placeholder: "example.com" },
      {
        name: "client_id",
        label: "Client",
        type: "select",
        required: true,
        options: (clients.data ?? []).map((c) => ({ value: c.id, label: c.client_name })),
        placeholder: clients.data?.length === 0 ? "Add a client first" : "Select a client",
      },
      {
        name: "work_id",
        label: "Work",
        type: "select",
        required: true,
        options: (works.data ?? []).map((w) => ({ value: w.id, label: w.title })),
        placeholder: works.data?.length === 0 ? "Add a work first" : "Select a work",
        hint: "The case study shown with this project.",
      },
      { name: "short_description", label: "Short description", type: "textarea", required: true, maxLength: 250, rows: 3 },
      { name: "project_image", label: "Image", type: "image", folder: "projects", required: true, wide: true },
      { name: "is_active", label: "Active", type: "switch", description: "Show this project on the website." },
    ],
    columns: [
      {
        header: "Project",
        cell: (row) => (
          <span className="flex items-center gap-3">
            <Thumb src={row.project_image} />
            <Stack
              primary={row.project_name}
              secondary={
                <a href={externalHref(row.project_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent-ink">
                  {row.project_url} <ExternalLink className="size-3" />
                </a>
              }
            />
          </span>
        ),
      },
      { header: "Client", cell: (row) => row.client?.client_name ?? "—", className: "hidden md:table-cell" },
      { header: "Work", cell: (row) => row.work?.title ?? "—", className: "hidden lg:table-cell" },
      { header: "Status", cell: (row) => (row.is_active ? <Badge tone="success" dot>Active</Badge> : <Badge>Hidden</Badge>) },
    ],
  };

  return <ResourcePage config={config} />;
}
