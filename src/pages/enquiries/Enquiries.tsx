import { Copy, Eye, Mail, MailOpen, MessageCircle, Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/api";
import { useSession } from "../../components/layout/session";
import { buttonClass } from "../../components/ui/button-class";
import { useFeedback } from "../../components/ui/feedback-context";
import { Modal } from "../../components/ui/Modal";
import { ResourcePage, type ResourceConfig } from "../../components/ui/ResourcePage";
import { Badge, Button, Detail, ErrorState, IconButton, Spinner, Stack } from "../../components/ui/ui";
import { dialDigits, formatDateTime, timeAgo } from "../../lib/format";
import type { Enquiry } from "../../lib/types";

export default function Enquiries() {
  const [params, setParams] = useSearchParams();
  const { toast } = useFeedback();
  const { refreshCounts } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const viewing = params.get("open");

  const reload = () => {
    setRefreshKey((k) => k + 1);
    refreshCounts();
  };

  const view = (id: string) => setParams({ open: id });

  const setOpened = async (row: Enquiry, opened: boolean) => {
    try {
      await api(`enquiry/edit/${row.id}`, { method: "PUT", body: { is_opened: opened } });
      reload();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const config: ResourceConfig<Enquiry> = {
    title: "Enquiries",
    noun: "enquiry",
    description: "Messages from the website contact form. Opening one marks it as read.",
    listPath: "enquiry/getall",
    deletePath: (row) => `enquiry/delete/${row.id}`,
    label: (row) => `Enquiry from ${row.name || row.email}`,
    searchPlaceholder: "Search name, email, company, message",
    filters: [
      {
        name: "opened",
        label: "Status",
        options: [
          { value: "false", label: "Unread" },
          { value: "true", label: "Read" },
        ],
      },
    ],
    emptyIcon: <Mail aria-hidden />,
    emptyHint: "Enquiries arrive here when someone submits the contact form.",
    columns: [
      {
        header: "From",
        cell: (row) => (
          <button type="button" onClick={() => view(row.id)} className="flex max-w-full items-start gap-2.5 text-left">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${row.is_opened ? "bg-line-strong" : "bg-accent"}`} title={row.is_opened ? "Read" : "Unread"} />
            <Stack primary={<span className={row.is_opened ? "font-normal" : "font-semibold"}>{row.name || "—"}</span>} secondary={row.email} />
          </button>
        ),
      },
      { header: "Company", cell: (row) => row.company_name || "—", className: "hidden md:table-cell" },
      { header: "Message", cell: (row) => <span className="line-clamp-2">{row.message}</span>, className: "hidden lg:table-cell" },
      { header: "Received", cell: (row) => <span className="whitespace-nowrap">{timeAgo(row.createdAt)}</span> },
    ],
    rowActions: (row) => (
      <>
        <IconButton label="View" onClick={() => view(row.id)}>
          <Eye className="size-4" />
        </IconButton>
        <IconButton label={row.is_opened ? "Mark as unread" : "Mark as read"} onClick={() => setOpened(row, !row.is_opened)}>
          {row.is_opened ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
        </IconButton>
      </>
    ),
  };

  const close = () => {
    setParams({}, { replace: true });
    reload();
  };

  return (
    <>
      <ResourcePage config={config} refreshKey={refreshKey} />
      {viewing && <EnquiryViewer key={viewing} id={viewing} onClose={close} />}
    </>
  );
}

function EnquiryViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const { toast } = useFeedback();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetching a single enquiry marks it as read on the server
  useEffect(() => {
    api<Enquiry>(`enquiry/get/${id}`).then(
      ({ data }) => setEnquiry(data),
      (err: Error) => setError(err.message),
    );
  }, [id]);

  const replyHref = enquiry
    ? `mailto:${enquiry.email}?subject=${encodeURIComponent("Re: your enquiry to Mecatronix")}&body=${encodeURIComponent(`Hi ${enquiry.name || "there"},\n\n`)}`
    : undefined;
  const whatsappHref = enquiry?.phone
    ? `https://wa.me/${dialDigits(enquiry.phone)}?text=${encodeURIComponent(`Hi ${enquiry.name || "there"}, thanks for contacting Mecatronix.`)}`
    : undefined;

  const copyEmail = async () => {
    if (!enquiry) return;
    try {
      await navigator.clipboard.writeText(enquiry.email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy. Select the address instead.");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={enquiry ? enquiry.name || enquiry.email : "Enquiry"}
      description={enquiry ? `Received ${formatDateTime(enquiry.createdAt)}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          {replyHref && (
            <a href={replyHref} className={buttonClass("primary")}>
              <Reply className="size-4" /> Reply by email
            </a>
          )}
        </>
      }
    >
      {error ? (
        <ErrorState message={error} />
      ) : !enquiry ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-5">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Detail label="Email">
              <span className="flex items-center gap-1.5">
                <a href={`mailto:${enquiry.email}`} className="truncate text-accent-ink hover:underline">
                  {enquiry.email}
                </a>
                <IconButton label="Copy email" className="size-6" onClick={copyEmail}>
                  <Copy className="size-3.5" />
                </IconButton>
              </span>
            </Detail>
            <Detail label="Phone">
              {enquiry.phone ? (
                <a href={`tel:${enquiry.phone}`} className="text-accent-ink hover:underline">
                  {enquiry.phone}
                </a>
              ) : (
                "—"
              )}
            </Detail>
            <Detail label="Company">{enquiry.company_name || "—"}</Detail>
            <Detail label="Status">
              <Badge tone="success" dot>
                Read {enquiry.opened_at ? timeAgo(enquiry.opened_at) : ""}
              </Badge>
            </Detail>
          </dl>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink">Message</p>
            <p className="rounded-xl bg-paper px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap text-surface">{enquiry.message}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
