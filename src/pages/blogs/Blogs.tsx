import { FileText } from "lucide-react";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Stack, Thumb } from "../../components/ui/ui";
import { formatDate } from "../../lib/format";
import type { Blog } from "../../lib/types";

const config: ResourceConfig<Blog> = {
  title: "Blogs",
  noun: "blog",
  description: "Articles with a cover gallery and any number of sections.",
  listPath: "blogs/all",
  createPath: "blogs/add",
  updatePath: (row) => `blogs/edit/${row.id}`,
  deletePath: (row) => `blogs/delete/${row.id}`,
  label: (row) => row.blog_name,
  formSize: "xl",
  emptyIcon: <FileText aria-hidden />,
  emptyHint: "Write your first article for the Insights section of the website.",
  fields: [
    { name: "blog_name", label: "Title", type: "text", required: true, wide: true },
    { name: "short_description", label: "Short description", type: "textarea", required: true, maxLength: 250, rows: 2 },
    { name: "blog_images", label: "Images", type: "images", folder: "blogs", required: true, hint: "The first image is the cover." },
    {
      name: "blog_descriptions",
      label: "Sections",
      type: "group",
      itemLabel: "Section",
      addLabel: "Add section",
      fields: [
        { name: "heading", label: "Heading", type: "text", wide: true },
        { name: "content", label: "Content", type: "textarea", rows: 5 },
        { name: "image", label: "Image", type: "image", folder: "blogs", wide: true },
      ],
    },
    { name: "is_active", label: "Published", type: "switch", description: "Show this blog on the website." },
  ],
  columns: [
    {
      header: "Blog",
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Thumb src={row.blog_images[0]} />
          <Stack primary={row.blog_name} secondary={row.short_description} />
        </span>
      ),
    },
    { header: "Sections", cell: (row) => row.blog_descriptions.length, className: "hidden md:table-cell" },
    { header: "Status", cell: (row) => (row.is_active ? <Badge tone="success" dot>Published</Badge> : <Badge>Draft</Badge>) },
    { header: "Updated", cell: (row) => formatDate(row.updatedAt), className: "hidden md:table-cell whitespace-nowrap" },
  ],
};

export default function Blogs() {
  return <ResourcePage config={config} />;
}
