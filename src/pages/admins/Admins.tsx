import { ShieldCheck } from "lucide-react";
import { useSession } from "../../components/layout/session";
import type { FieldDef } from "../../components/ui/fields";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Avatar, Badge, Stack } from "../../components/ui/ui";
import ErrorPage from "../../components/feedback/ErrorPage";
import { formatDate } from "../../lib/format";
import type { Admin } from "../../lib/types";

const fields = (row: Admin | null): FieldDef[] => [
  { name: "name", label: "Full name", type: "text", required: true, maxLength: 100 },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Admin" },
      { value: "superadmin", label: "Superadmin (can manage admins)" },
    ],
  },
  {
    name: "password",
    label: row ? "New password" : "Password",
    type: "password",
    required: !row,
    autoComplete: "new-password",
    hint: row
      ? "Leave blank to keep the current password. A new one is emailed to the admin."
      : "At least 8 characters. It's emailed to the new admin with their sign-in link.",
  },
  { name: "img", label: "Photo", type: "image", folder: "admins" },
];

const config: ResourceConfig<Admin> = {
  title: "Admins",
  noun: "admin",
  description: "People who can sign in to this panel. Superadmin accounts aren't listed here.",
  listPath: "admin/get_all_admins",
  createPath: "admin/add_admin",
  updatePath: (row) => `admin/update_admin/${row.id}`,
  deletePath: (row) => `admin/delete_admin/${row.id}`,
  label: (row) => row.name,
  searchPlaceholder: "Search name, email, phone",
  emptyIcon: <ShieldCheck aria-hidden />,
  emptyHint: "Invite teammates who should manage the website.",
  fields,
  defaults: { role: "admin" },
  // Blank password on edit means "unchanged"
  payload: ({ password, ...body }, row) => (row && !password ? body : { ...body, password }),
  columns: [
    {
      header: "Admin",
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.name} src={row.img} className="size-9" />
          <Stack primary={row.name} secondary={row.email} />
        </span>
      ),
    },
    { header: "Phone", cell: (row) => row.phone, className: "hidden md:table-cell" },
    {
      header: "Role",
      cell: (row) => <Badge tone={row.role === "superadmin" ? "accent" : "neutral"}>{row.role === "superadmin" ? "Superadmin" : "Admin"}</Badge>,
    },
    { header: "Added", cell: (row) => formatDate(row.createdAt), className: "hidden md:table-cell whitespace-nowrap" },
  ],
};

export default function Admins() {
  const { user } = useSession();
  if (user.role !== "superadmin") {
    return <ErrorPage statusCode={403} inline message="Managing admins is limited to superadmins. Ask a superadmin if you need an account added or changed." />;
  }
  return <ResourcePage config={config} />;
}
