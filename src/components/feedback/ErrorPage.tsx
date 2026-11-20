import {
  ArrowLeft,
  FileQuestion,
  House,
  LockKeyhole,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useRouteError } from "react-router-dom";
import logo from "../../assets/logos/mecatronix-logo.webp";
import { cn } from "../../lib/cn";
import { classifyError, errorDetails, reloadForNewVersion, type ErrorKind } from "../../lib/errors";
import { buttonClass } from "../ui/button-class";

type Action = "dashboard" | "back" | "retry" | "reload" | "sign-in";

const CONTENT: Record<ErrorKind, { code?: string; icon: LucideIcon; title: string; message: string; actions: Action[] }> = {
  "not-found": {
    code: "404",
    icon: FileQuestion,
    title: "Page not found",
    message: "The page you asked for doesn't exist or has moved. Check the address, or pick a section from the dashboard.",
    actions: ["dashboard", "back"],
  },
  forbidden: {
    code: "403",
    icon: ShieldAlert,
    title: "You don't have access",
    message: "This area is limited to superadmins. Ask a superadmin if you need access to it.",
    actions: ["dashboard", "back"],
  },
  unauthorized: {
    code: "401",
    icon: LockKeyhole,
    title: "Please sign in again",
    message: "Your session has ended. Sign in to pick up where you left off.",
    actions: ["sign-in"],
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    message: "The admin panel can't reach the server. Check your internet connection, then try again.",
    actions: ["retry", "back"],
  },
  outdated: {
    icon: Sparkles,
    title: "A new version is available",
    message: "The admin panel was updated while this tab was open. Reload to load the latest version. Your saved data is safe.",
    actions: ["reload"],
  },
  unavailable: {
    code: "503",
    icon: ServerCrash,
    title: "Server temporarily unavailable",
    message: "The Mecatronix API isn't responding right now. It's usually back within a few minutes.",
    actions: ["retry", "dashboard"],
  },
  server: {
    code: "500",
    icon: TriangleAlert,
    title: "Something went wrong",
    message: "This page hit an unexpected problem and couldn't finish loading. Nothing was changed.",
    actions: ["retry", "back", "dashboard"],
  },
};

type ErrorPageProps = {
  /** Forces a status instead of reading the route error (404 routes, access checks). */
  statusCode?: number;
  title?: string;
  message?: ReactNode;
  /** Renders inside the admin shell (sidebar stays visible) instead of as a full screen. */
  inline?: boolean;
};

/** Route-level error screen: 404, 403, 401, offline, new-version and server errors. */
export default function ErrorPage({ statusCode, title, message, inline = false }: ErrorPageProps) {
  const routeError = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const kind = classifyError(routeError, statusCode);
  const content = CONTENT[kind];
  const Icon = content.icon;
  const heading = title ?? content.title;
  const details = import.meta.env.DEV ? errorDetails(routeError) : undefined;
  // A stale chunk reloads itself once; the screen only shows if that didn't help.
  const [reloading, setReloading] = useState(kind === "outdated");

  useEffect(() => {
    document.title = `${heading} · Mecatronix Admin`;
  }, [heading]);

  useEffect(() => {
    if (routeError && kind !== "not-found") console.error(routeError);
  }, [routeError, kind]);

  useEffect(() => {
    if (kind === "outdated" && !reloadForNewVersion()) setReloading(false);
  }, [kind]);

  const goBack = () => {
    // React Router records the position in history.state; 0 means this is the first page of the tab.
    if (((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0) navigate(-1);
    else navigate("/mec-admin", { replace: true });
  };

  const actions: Record<Action, ReactNode> = {
    dashboard: (
      <Link key="dashboard" to="/mec-admin" className={buttonClass(content.actions[0] === "dashboard" ? "primary" : "secondary")}>
        <House aria-hidden className="size-4" /> Dashboard
      </Link>
    ),
    back: (
      <button key="back" type="button" onClick={goBack} className={buttonClass("secondary")}>
        <ArrowLeft aria-hidden className="size-4" /> Go back
      </button>
    ),
    retry: (
      <button key="retry" type="button" onClick={() => window.location.reload()} className={buttonClass("primary")}>
        <RefreshCw aria-hidden className="size-4" /> Try again
      </button>
    ),
    reload: (
      <button key="reload" type="button" onClick={() => window.location.reload()} className={buttonClass("primary")}>
        <RefreshCw aria-hidden className="size-4" /> Reload now
      </button>
    ),
    "sign-in": (
      <Link
        key="sign-in"
        to={`/?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
        className={buttonClass("primary")}
      >
        <LockKeyhole aria-hidden className="size-4" /> Sign in
      </Link>
    ),
  };

  if (reloading) {
    return (
      <div role="status" className={cn("flex items-center justify-center gap-2 text-sm text-muted", inline ? "py-24" : "min-h-dvh bg-paper")}>
        <RefreshCw aria-hidden className="size-4 animate-spin text-accent" /> Loading the latest version…
      </div>
    );
  }

  const card = (
    <section
      role={kind === "not-found" ? undefined : "alert"}
      aria-labelledby="error-title"
      className={cn(
        "relative w-full overflow-hidden rounded-panel border border-line bg-white text-center",
        inline ? "max-w-2xl p-8 shadow-soft sm:p-12" : "max-w-lg p-8 shadow-lift sm:p-10",
      )}
    >
      {content.code && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-display text-[9rem] leading-none font-bold tracking-tighter text-ink/[0.035] select-none"
        >
          {content.code}
        </span>
      )}
      <div className="relative">
        <div
          className={cn(
            "mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl ring-1 ring-inset",
            kind === "outdated" ? "bg-success-soft text-success ring-success/15" : "bg-accent-soft text-accent ring-accent/15",
          )}
        >
          <Icon aria-hidden className="size-6" />
        </div>
        <p className="text-label text-accent-ink">{content.code ? `Error ${content.code}` : kind === "offline" ? "Connection lost" : "Update"}</p>
        <h1 id="error-title" className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {heading}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-ink">{message ?? content.message}</p>
        {kind === "not-found" && (
          <p className="mx-auto mt-4 max-w-md truncate rounded-lg bg-paper px-3 py-1.5 font-mono text-xs text-muted" title={location.pathname}>
            {location.pathname}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">{content.actions.map((action) => actions[action])}</div>

        {details && (
          <details className="mt-8 rounded-xl border border-line bg-paper text-left">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-muted-ink">Error details (development only)</summary>
            <pre className="scrollbar-thin max-h-64 overflow-auto border-t border-line px-4 py-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-danger">
              {details}
            </pre>
          </details>
        )}
      </div>
    </section>
  );

  if (inline) return <div className="flex min-h-[60vh] items-center justify-center py-8">{card}</div>;

  return (
    <main className="relative isolate flex min-h-dvh flex-col bg-paper px-4 py-6">
      <div
        aria-hidden
        className="bg-grid-light pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div aria-hidden className="glow-accent pointer-events-none absolute -top-48 left-1/2 -z-10 size-[34rem] -translate-x-1/2 opacity-50" />
      <header className="mx-auto flex w-full max-w-6xl items-center">
        <Link to="/mec-admin" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-accent">
          <img src={logo} alt="" width={117} height={144} decoding="async" className="h-8 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-semibold tracking-[0.08em] text-ink">MECATRONIX</span>
            <span className="mt-1 font-mono text-[9px] tracking-[0.28em] text-accent-ink">ADMIN</span>
          </span>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center py-12">{card}</div>
      <footer className="text-center text-xs text-muted">© {new Date().getFullYear()} Mecatronix Software Development</footer>
    </main>
  );
}
