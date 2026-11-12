import { useEffect, useState, type ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";
import { ArrowUpRight, FolderKanban, Inbox, Newspaper, ReceiptText, ShieldCheck } from "lucide-react";
import logo from "../../assets/logos/mecatronix-logo.png";
import { CLIENT_URL } from "../../api/api";
import { cn } from "../../lib/cn";

/* Split-screen frame for sign-in, forgot-password and reset-password:
 * a dark brand panel (desktop only) beside a white form column. */

const ease = [0.16, 1, 0.3, 1] as const;

const modules = [
  { icon: Inbox, title: "Enquiries", caption: "Leads & follow-ups" },
  { icon: ReceiptText, title: "Invoices & quotes", caption: "Billing & vouchers" },
  { icon: FolderKanban, title: "Projects & work", caption: "Portfolio" },
  { icon: Newspaper, title: "Blogs & banners", caption: "Website content" },
];

const istTime = () =>
  new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());

function StudioClock() {
  const [time, setTime] = useState(istTime);
  useEffect(() => {
    const id = window.setInterval(() => setTime(istTime()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span>
      Coimbatore Â· <time className="tabular-nums text-white/75">{time}</time> IST
    </span>
  );
}

function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src={logo} alt="" width={292} height={352} className="h-9 w-auto" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-lg font-semibold tracking-[0.08em]", tone === "dark" ? "text-white" : "text-ink")}>
          MECATRONIX
        </span>
        <span className={cn("mt-1 font-mono text-[9px] tracking-[0.28em]", tone === "dark" ? "text-accent-glow" : "text-accent-ink")}>
          ADMIN PANEL
        </span>
      </span>
    </span>
  );
}

/** Slow concentric rings: a quiet nod to the mechatronic mark. */
function Orbit() {
  return (
    <div aria-hidden className="pointer-events-none absolute top-[46%] -right-64 -z-10 size-[36rem] -translate-y-1/2">
      <div className="absolute inset-0 rounded-full border border-white/[0.07]" />
      <div className="absolute inset-16 rounded-full border border-dashed border-white/[0.09]" />
      <div className="absolute inset-32 rounded-full border border-white/[0.06]" />
      <div className="absolute inset-0 animate-spin-slow">
        <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_18px_4px_rgb(225_6_0/0.55)]" />
      </div>
      <div className="absolute inset-16 animate-[spin_40s_linear_infinite_reverse]">
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/70" />
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div
        aria-hidden
        className="bg-grid-inverse pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_30%_45%,black,transparent_75%)]"
      />
      <div aria-hidden className="glow-accent pointer-events-none absolute -top-56 -left-56 -z-10 size-[46rem]" />
      <div aria-hidden className="glow-wine pointer-events-none absolute -right-40 -bottom-64 -z-10 size-[40rem]" />
      <Orbit />

      <Wordmark tone="dark" />

      <div className="max-w-xl py-12">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease }}
          className="text-label flex items-center gap-3 text-accent-glow"
        >
          <span aria-hidden className="h-px w-8 bg-accent-glow" />
          Admin console
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="mt-6 font-display text-[clamp(2.5rem,1.1rem+2.7vw,3.9rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
        >
          Run the studio from one <span className="text-shimmer-light">control room.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.12 }}
          className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60"
        >
          Enquiries, billing, projects and website content for Mecatronix, managed in one secure workspace.
        </motion.p>

        <ul className="mt-10 grid max-w-lg grid-cols-2 gap-3">
          {modules.map(({ icon: Icon, title, caption }, index) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 + index * 0.06 }}
              className="rounded-card border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-accent/40 hover:bg-white/[0.05]"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent-glow ring-1 ring-accent/25 ring-inset">
                <Icon aria-hidden className="size-[18px]" />
              </span>
              <p className="mt-4 text-sm font-medium text-white">{title}</p>
              <p className="mt-1 font-mono text-[11px] tracking-wide text-white/45">{caption}</p>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-6 font-mono text-[11px] tracking-[0.14em] text-white/50 uppercase">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck aria-hidden className="size-3.5 text-accent-glow" />
          Protected admin area
        </span>
        <StudioClock />
      </div>
    </aside>
  );
}

export default function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} Â· Mecatronix Admin`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-dvh bg-white font-sans text-surface antialiased selection:bg-accent/15 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <BrandPanel />

        <div className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-6 sm:px-10 sm:py-8">
          <div
            aria-hidden
            className="bg-grid-light pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]"
          />
          <div aria-hidden className="glow-accent pointer-events-none absolute -top-48 -right-48 -z-10 size-[30rem] opacity-60" />

          <header className="flex items-center justify-between gap-4">
            <span className="lg:invisible">
              <Wordmark />
            </span>
            {CLIENT_URL && (
              <a
                href={CLIENT_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted-ink transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                Visit website
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            )}
          </header>

          <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
              {children}
            </motion.div>
          </main>

          <footer className="flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
            <span>Â© {new Date().getFullYear()} Mecatronix Software Development</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden className="size-3.5 text-success" />
              Authorised personnel only
            </span>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
