import {
  UsersRound,
  Bot,
  Images,
  ArrowUpRight,
  BadgePercent,
  Contact,
  FileSignature,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  MonitorSmartphone,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Receipt,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api, ApiError, CLIENT_URL, UNAUTHORIZED_EVENT } from "../../api/api";
import ErrorPage from "../feedback/ErrorPage";
import logo from "../../assets/logos/mecatronix-logo.webp";
import { cn } from "../../lib/cn";
import type { Admin, DashboardStats } from "../../lib/types";
import { useFeedback } from "../ui/feedback-context";
import { Avatar, Spinner } from "../ui/ui";
import { SessionContext, type Session } from "./session";

type Counts = { enquiries: number; reviews: number; previews: number };

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  superadmin?: boolean;
  count?: keyof Counts;
}

const ROOT = "/mec-admin";

const NAV: { heading: string; items: NavItem[] }[] = [
  { heading: "Overview", items: [{ to: ROOT, label: "Dashboard", icon: LayoutDashboard }] },
  {
    heading: "Inbox",
    items: [
      { to: `${ROOT}/enquiries`, label: "Enquiries", icon: Mail, count: "enquiries" },
      { to: `${ROOT}/previews`, label: "Website previews", icon: MonitorSmartphone, count: "previews" },
      { to: `${ROOT}/reviews`, label: "Reviews", icon: MessageSquareQuote, count: "reviews" },
      { to: `${ROOT}/subscribers`, label: "Subscribers", icon: Newspaper },
    ],
  },
  {
    heading: "Website",
    items: [
      { to: `${ROOT}/banners`, label: "Banners", icon: GalleryHorizontalEnd },
      { to: `${ROOT}/blogs`, label: "Blogs", icon: FileText },
      { to: `${ROOT}/work`, label: "Works", icon: Wrench },
      { to: `${ROOT}/project`, label: "Projects", icon: FolderKanban },
      { to: `${ROOT}/project-media`, label: "Work details & media", icon: Images },
      { to: `${ROOT}/meca-board`, label: "MECA robot board", icon: Bot },
      { to: `${ROOT}/clients`, label: "Clients", icon: Handshake },
      { to: `${ROOT}/team`, label: "Team & founders", icon: UsersRound },
      { to: `${ROOT}/contact`, label: "Contact details", icon: Contact },
    ],
  },
  {
    heading: "Business",
    items: [
      { to: `${ROOT}/invoice`, label: "Invoices", icon: Receipt },
      { to: `${ROOT}/quotation`, label: "Quotations", icon: FileSignature },
      { to: `${ROOT}/voucher`, label: "Vouchers", icon: BadgePercent },
    ],
  },
  {
    heading: "Settings",
    items: [
      { to: `${ROOT}/admin`, label: "Admins", icon: ShieldCheck, superadmin: true },
      { to: `${ROOT}/account`, label: "My account", icon: UserRound },
    ],
  },
];

function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <Link to={ROOT} className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-accent">
      <img src={logo} alt="" width={117} height={144} decoding="async" className={compact ? "h-7 w-auto" : "h-8 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[0.08em] text-ink">MECATRONIX</span>
        <span className="mt-1 font-mono text-[9px] tracking-[0.28em] text-accent-ink">ADMIN</span>
      </span>
    </Link>
  );
}

export default function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useFeedback();
  const [user, setUser] = useState<Admin | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(location.pathname);
  /** HTTP status of a failed session check that wasn't a sign-in problem (0 = unreachable). */
  const [sessionError, setSessionError] = useState<number | null>(null);

  // Close the mobile menu after navigating
  if (openedFor !== location.pathname) {
    setOpenedFor(location.pathname);
    setMenuOpen(false);
  }

  const toLogin = useCallback(() => {
    const next = window.location.pathname + window.location.search;
    navigate(next !== ROOT ? `/?next=${encodeURIComponent(next)}` : "/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (user) return;
    const controller = new AbortController();
    api<Admin>("auth/check_login", { signal: controller.signal }).then(
      ({ data }) => setUser(data),
      (error: unknown) => {
        if ((error as Error)?.name === "AbortError") return;
        // Only a rejected session means "sign in"; a network or server failure gets a retry screen instead.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) toLogin();
        else setSessionError(error instanceof ApiError ? error.status : 500);
      },
    );
    return () => controller.abort();
  }, [user, toLogin]);

  useEffect(() => {
    const expired = () => {
      toast.error("Your session expired. Please sign in again.");
      toLogin();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, expired);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, expired);
  }, [toLogin, toast]);

  const refreshCounts = useCallback(() => {
    api<DashboardStats>("dash/all").then(
      ({ data }) => setCounts({ enquiries: data.enquiries.unopened, reviews: data.reviews.unverified, previews: data.previews?.uncontacted ?? 0 }),
      () => undefined,
    );
  }, []);

  // Badge counts follow navigation, so reading an enquiry updates them
  useEffect(() => {
    if (user) refreshCounts();
  }, [user, location.pathname, refreshCounts]);

  const session = useMemo<Session | null>(() => (user ? { user, setUser, refreshCounts } : null), [user, refreshCounts]);

  const logout = async () => {
    await api("auth/logout", { method: "POST" }).catch(() => undefined);
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  if (sessionError !== null && !user) return <ErrorPage statusCode={sessionError} />;
  if (!session || !user) return <Spinner label="Checking your session" className="min-h-dvh bg-paper" />;

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-6">
        <Wordmark />
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => {
          const items = group.items.filter((item) => !item.superadmin || user.role === "superadmin");
          if (!items.length) return null;
          return (
            <div key={group.heading} className="mb-5">
              <p className="mb-1.5 px-3 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{group.heading}</p>
              <ul className="flex flex-col gap-0.5">
                {items.map(({ to, label, icon: Icon, count }) => {
                  const value = count && counts ? counts[count] : 0;
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === ROOT}
                        className={({ isActive }) =>
                          cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                            isActive ? "bg-ink font-medium text-white" : "text-muted-ink hover:bg-paper hover:text-ink",
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon aria-hidden className={cn("size-[18px]", isActive ? "text-accent-glow" : "text-muted group-hover:text-ink")} strokeWidth={1.8} />
                            <span className="flex-1">{label}</span>
                            {value > 0 && (
                              <span
                                className={cn(
                                  "min-w-5 rounded-full px-1.5 py-px text-center font-mono text-[10px] font-semibold tabular-nums",
                                  isActive ? "bg-accent text-white" : "bg-accent-soft text-accent-ink",
                                )}
                                aria-label={`${value} need attention`}
                              >
                                {value > 99 ? "99+" : value}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {CLIENT_URL && (
          <a
            href={CLIENT_URL}
            target="_blank"
            rel="noreferrer"
            className="mx-3 mt-2 flex items-center justify-between rounded-xl border border-dashed border-line-strong px-3 py-2 text-[13px] text-muted-ink transition-colors hover:border-accent/40 hover:text-accent-ink"
          >
            View website
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-line p-4">
        <Avatar name={user.name} src={user.img} className="size-9" />
        <Link to={`${ROOT}/account`} className="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-accent">
          <span className="block truncate text-sm font-medium text-ink">{user.name}</span>
          <span className="block truncate text-xs text-muted capitalize">{user.role}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-accent-ink"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </nav>
  );

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-dvh bg-paper print:bg-white">
        <a
          href="#main"
          className="sr-only z-60 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-white lg:block print:hidden">{sidebar}</aside>

        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden print:hidden">
          <Wordmark compact />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="relative rounded-lg p-2 text-ink hover:bg-paper"
          >
            <Menu className="size-5" />
            {!!counts && counts.enquiries + counts.reviews + counts.previews > 0 && <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />}
          </button>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 animate-fade bg-ink/40" onClick={() => setMenuOpen(false)} aria-hidden />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-rise bg-white shadow-window [animation-duration:200ms]">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 rounded-lg p-2 text-muted hover:bg-paper"
              >
                <X className="size-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <main id="main" className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-9 print:m-0 print:p-0">
          <div className="mx-auto max-w-6xl">
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </SessionContext.Provider>
  );
}
