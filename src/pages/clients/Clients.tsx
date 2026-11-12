import { Handshake } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Stack, Thumb } from "../../components/ui/ui";
import type { Client } from "../../lib/types";

const config: ResourceConfig<Client> = {
  title: "Clients",
  noun: "client",
  description: "Clients and their companies. Company logos appear on the website; contact details stay private.",
  listPath: "clients/get_all_clients",
  createPath: "clients/add_client",
  updatePath: (row) => `clients/edit_client/${row.id}`,
  deletePath: (row) => `clients/delete_client/${row.id}`,
  label: (row) => row.client_name,
  formSize: "xl",
  emptyIcon: <Handshake aria-hidden />,
  emptyHint: "Add a client before creating projects for them.",
  searchPlaceholder: "Search client name",
  fields: [
    { name: "client_name", label: "Client name", type: "text", required: true, wide: true },
    {
      name: "companies",
      label: "Companies",
      type: "group",
      itemLabel: "Company",
      addLabel: "Add company",
      required: true,
      min: 1,
      fields: [
        { name: "name", label: "Company name", type: "text", required: true },
        { name: "industry", label: "Industry", type: "text", required: true, placeholder: "e.g. textiles" },
        { name: "url", label: "Website", type: "text", required: true, placeholder: "example.com" },
        { name: "year", label: "Year", type: "number", min: 1800, max: new Date().getFullYear(), required: true },
        { name: "img", label: "Logo", type: "image", folder: "clients", required: true, wide: true },
      ],
    },
    { name: "client_emails", label: "Emails", type: "list", inputType: "email", placeholder: "name@company.com", addLabel: "Add email", wide: false },
    {
      name: "client_phones",
      label: "Phone numbers",
      type: "list",
      inputType: "tel",
      placeholder: "Digits only, e.g. 918300454800",
      addLabel: "Add phone",
      wide: false,
    },
    { name: "is_active", label: "Active", type: "switch", description: "Show this client's companies on the website." },
  ],
  columns: [
    {
      header: "Client",
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Thumb src={row.companies[0]?.img} className="bg-white [&_img]:object-contain [&_img]:p-1" />
          <Stack primary={row.client_name} secondary={row.client_emails[0] ?? row.client_phones[0]} />
        </span>
      ),
    },
    {
      header: "Companies",
      cell: (row) => <span className="line-clamp-2 capitalize">{row.companies.map((c) => c.name).join(", ") || "—"}</span>,
      className: "hidden md:table-cell",
    },
    { header: "Status", cell: (row) => (row.is_active ? <Badge tone="success" dot>Active</Badge> : <Badge>Hidden</Badge>) },
  ],
};

export default function Clients() {
  return <ResourcePage config={config} />;
}
