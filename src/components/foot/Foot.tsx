import React from "react";
import { motion as Motion } from "motion/react";
import {
  Activity,
  Clock,
  Cpu,
  Database,
  Lock,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

const statusItems = [
  {
    icon: Server,
    label: "Server",
    status: "Active",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Database,
    label: "Database",
    status: "Connected",
    className: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Cpu,
    label: "API",
    status: "Live",
    className: "text-purple-300 bg-purple-500/10 border-purple-500/20",
  },
];

const Foot = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative w-full border-t border-zinc-800/70 bg-zinc-950/90 px-4 py-5 text-zinc-400 sm:px-6"
      role="contentinfo"
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-400 shadow-lg shadow-red-950/40">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Mecatronix</p>
            <p className="text-xs text-zinc-500">Admin Control System</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusItems.map((item) => {
            const icon = React.createElement(item.icon, {
              className: "h-4 w-4",
              "aria-hidden": true,
            });

            return (
              <div
                key={item.label}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${item.className}`}
              >
                {icon}
                <span className="text-zinc-400">{item.label}</span>
                <span>{item.status}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 text-sm lg:items-end">
          <p>
            © {currentYear}{" "}
            <span className="font-semibold text-orange-300">Mecatronix</span>.
            All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              Secure
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              Stable
            </span>
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-orange-400" />
              v2.4.1
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              {new Date().toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </Motion.footer>
  );
};

export default Foot;
