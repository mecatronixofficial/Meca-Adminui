import {
  ArrowRight,
  FileSignature,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  Handshake,
  Mail,
  MessageSquareQuote,
  MonitorSmartphone,
  Newspaper,
  Receipt,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { lazy, Suspense, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useApiData } from "../../api/api";
import { useSession } from "../../components/layout/session";
import { Badge, Card, CardHeader, ErrorState, PageHeader, SkeletonRows, Spinner, Stack } from "../../components/ui/ui";
import { cn } from "../../lib/cn";
import { formatMoney, timeAgo } from "../../lib/format";
import type { DashboardStats, Enquiry, Invoice, Paginated, SubscriberStats } from "../../lib/types";
import StatusBadge from "../invoice/StatusBadge";
import type { DayCount } from "./SignupsChart";

// recharts is heavy: load it after the rest of the dashboard
const SignupsChart = lazy(() => import("./SignupsChart"));

const ROOT = "/mec-admin";
const DAYS = 30;

const greeting = () => {
  const hour = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const today = () => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date());

/** The last `DAYS` UTC days (the API's buckets), oldest first, zero-filled. */
function lastDays(stats: SubscriberStats | undefined): DayCount[] {
  const counts = new Map(stats?.dailyStats.map((d) => [d._id, d.count]));
  const label = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(Date.now() - (DAYS - 1 - i) * 86_400_000);
    const day = date.toISOString().slice(0, 10);
    return { day, label: label.format(date), count: counts.get(day) ?? 0 };
  });
}

export default function Dash() {
  const { user } = useSession();
  const stats = useApiData<DashboardStats>("dash/all");
  const enquiries = useApiData<Paginated<Enquiry>>("enquiry/getall", { page: 1, limit: 6 });
  const subscribers = useApiData<SubscriberStats>("news/get", { page: 1, limit: 1 });
  const invoices = useApiData<Paginated<Invoice>>("invoice/all", { page: 1, limit: 5 });
  const s = stats.data;

  const days = useMemo(() => lastDays(subscribers.data), [subscribers.data]);
  const monthSignups = days.reduce((sum, d) => sum + d.count, 0);
  const weekSignups = days.slice(-7).reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <PageHeader eyebrow={today()} title={`${greeting()}, ${user.name.split(" ")[0]}`} description="Here's what's happening across the Mecatronix website." />

      {stats.error ? (
        <Card>
          <ErrorState message={stats.error} onRetry={stats.reload} />
        </Card>
      ) : !s ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Attention
              to={`${ROOT}/enquiries`}
              icon={<Mail className="size-5" />}
              value={s.enquiries.unopened}
              label="Unread enquiries"
              detail={`${s.enquiries.total} total`}
              highlight={s.enquiries.unopened > 0}
            />
            <Attention
              to={`${ROOT}/previews`}
              icon={<MonitorSmartphone className="size-5" />}
              value={s.previews?.uncontacted ?? 0}
              label="New website previews"
              detail={`${s.previews?.total ?? 0} total leads`}
              highlight={(s.previews?.uncontacted ?? 0) > 0}
            />
            <Attention
              to={`${ROOT}/reviews`}
              icon={<MessageSquareQuote className="size-5" />}
              value={s.reviews.unverified}
              label="Reviews to verify"
              detail={`${s.reviews.verified} published`}
              highlight={s.reviews.unverified > 0}
            />
            <Attention
              to={`${ROOT}/subscribers`}
              icon={<Newspaper className="size-5" />}
              value={s.subscribers}
              label="Newsletter subscribers"
              detail={subscribers.data ? `${weekSignups} new this week` : "…"}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 flex-col gap-6">
              <Card>
                <CardHeader
                  title="Newsletter sign-ups"
                  description={`Last ${DAYS} days`}
                  actions={
                    <span className="text-right">
                      <span className="block font-display text-2xl font-semibold text-ink tabular-nums">{subscribers.data ? monthSignups : "–"}</span>
                    </span>
                  }
                />
                <div className="px-3 pt-4 pb-3">
                  {subscribers.error ? (
                    <p className="py-10 text-center text-sm text-muted">{subscribers.error}</p>
                  ) : !subscribers.data ? (
                    <div className="h-44 animate-pulse rounded-xl bg-paper" />
                  ) : (
                    <Suspense fallback={<div className="h-44 animate-pulse rounded-xl bg-paper" />}>
                      <SignupsChart data={days} />
                    </Suspense>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Latest enquiries" actions={<ViewAll to={`${ROOT}/enquiries`} />} />
                {enquiries.error ? (
                  <ErrorState message={enquiries.error} onRetry={enquiries.reload} />
                ) : !enquiries.data ? (
                  <SkeletonRows rows={4} />
                ) : enquiries.data.items.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">No enquiries yet. They appear here when someone uses the contact form.</p>
                ) : (
                  <ul>
                    {enquiries.data.items.map((e) => (
                      <li key={e.id} className="border-b border-line last:border-0">
                        <Link to={`${ROOT}/enquiries?open=${e.id}`} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-paper/60">
                          <span className={cn("mt-2 size-2 shrink-0 rounded-full", e.is_opened ? "bg-transparent" : "bg-accent")} aria-label={e.is_opened ? undefined : "Unread"} />
                          <span className="min-w-0 flex-1">
                            <Stack primary={e.name || e.email} secondary={e.message} />
                          </span>
                          <span className="shrink-0 text-xs text-muted">{timeAgo(e.createdAt)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Quick actions" />
                <div className="grid grid-cols-2 gap-2 p-3">
                  <QuickAction to={`${ROOT}/invoice`} icon={Receipt} label="Invoices" />
                  <QuickAction to={`${ROOT}/quotation`} icon={FileSignature} label="Quotation" />
                  <QuickAction to={`${ROOT}/blogs`} icon={FileText} label="Blogs" />
                  <QuickAction to={`${ROOT}/banners`} icon={GalleryHorizontalEnd} label="Banners" />
                </div>
              </Card>

              <Card>
                <CardHeader title="Website content" />
                <div className="divide-y divide-line">
                  {(
                    [
                      ["Banners", s.banners, `${ROOT}/banners`, GalleryHorizontalEnd],
                      ["Blogs", s.blogs, `${ROOT}/blogs`, FileText],
                      ["Works", s.works, `${ROOT}/work`, Wrench],
                      ["Projects", s.projects, `${ROOT}/project`, FolderKanban],
                      ["Clients", s.clients, `${ROOT}/clients`, Handshake],
                    ] as const
                  ).map(([label, value, to, Icon]) => (
                    <Link key={label} to={to} className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-paper/60">
                      <Icon aria-hidden className="size-4 text-muted" />
                      <span className="flex-1 text-muted-ink">{label}</span>
                      <span className="font-display text-base font-semibold text-ink tabular-nums">{value}</span>
                    </Link>
                  ))}
                  {user.role === "superadmin" && (
                    <Link to={`${ROOT}/admin`} className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-paper/60">
                      <ShieldCheck aria-hidden className="size-4 text-muted" />
                      <span className="flex-1 text-muted-ink">Admins</span>
                      <Badge tone="accent">{s.admins.superadmin} super</Badge>
                      <span className="font-display text-base font-semibold text-ink tabular-nums">{s.admins.total}</span>
                    </Link>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Recent invoices" actions={<ViewAll to={`${ROOT}/invoice`} />} />
                {invoices.error ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">{invoices.error}</p>
                ) : !invoices.data ? (
                  <SkeletonRows rows={3} />
                ) : invoices.data.items.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">No invoices yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {invoices.data.items.map((inv) => (
                      <li key={inv.id}>
                        <Link to={`${ROOT}/invoice/${inv.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-paper/60">
                          <span className="min-w-0 flex-1">
                            <Stack primary={inv.invoiceNo} secondary={inv.clientName} />
                          </span>
                          <span className="flex flex-col items-end gap-1">
                            <span className="text-sm font-medium text-ink tabular-nums">{formatMoney(inv.total)}</span>
                            <StatusBadge status={inv.status} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ViewAll({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-muted-ink transition-colors hover:text-accent-ink">
      View all <ArrowRight className="size-3.5" />
    </Link>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-xl border border-line px-3 py-3 text-sm font-medium text-ink transition-[border-color,background-color] hover:border-accent/30 hover:bg-accent-soft/40"
    >
      <Icon aria-hidden className="size-[18px] text-muted transition-colors group-hover:text-accent" />
      {label}
    </Link>
  );
}

function Attention({ to, icon, value, label, detail, highlight }: { to: string; icon: ReactNode; value: number; label: string; detail: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition-[box-shadow,border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      {highlight && <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-gradient-to-r from-accent to-wine" />}
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", highlight ? "bg-accent-soft text-accent-ink" : "bg-paper text-muted-ink")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{detail}</span>
      </span>
      <ArrowRight aria-hidden className="size-4 text-line-strong transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
