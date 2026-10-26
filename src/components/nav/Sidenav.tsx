import React, { useCallback, useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Crown,
  FileSignature,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  ReceiptText,
  Shield,
  Star,
  Ticket,
  User,
  Workflow,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";
import { logoutSuccess } from "../../redux/slices/authSlice";

const menuGroups = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/mec-admin" }],
  },
  {
    title: "Content",
    items: [
      { name: "Blogs", icon: FileText, path: "/mec-admin/blogs" },
      { name: "Banners", icon: Image, path: "/mec-admin/banners" },
      { name: "Reviews", icon: Star, path: "/mec-admin/reviews" },
      { name: "Subscribers", icon: Mail, path: "/mec-admin/subscribers" },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Clients", icon: User, path: "/mec-admin/clients" },
      { name: "Enquiries", icon: MessageCircle, path: "/mec-admin/enquiries" },
      { name: "Projects", icon: FolderKanban, path: "/mec-admin/project" },
      { name: "Works", icon: Workflow, path: "/mec-admin/work" },
    ],
  },
  {
    title: "Documents",
    items: [
      { name: "Voucher", icon: Ticket, path: "/mec-admin/voucher" },
      { name: "Invoice", icon: ReceiptText, path: "/mec-admin/invoice" },
      { name: "Quotation", icon: FileSignature, path: "/mec-admin/quotation" },
    ],
  },
  {
    title: "System",
    items: [{ name: "Admin", icon: Crown, path: "/mec-admin/admin" }],
  },
];

const Sidenav = ({ onCollapseChange }: { onCollapseChange?: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      successNotification("Logged out successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      errorNotification("Logout failed. Please try again.");
    }
  }, [dispatch, navigate]);

  const toggleCollapse = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      onCollapseChange?.(next);
      return next;
    });
  };

  return (
    <Motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex h-screen flex-col border-r border-zinc-800/70 bg-zinc-950/95 text-zinc-300 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
        isSidebarOpen ? "w-72" : "w-24"
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400" />

      <div className={`flex items-center gap-3 border-b border-zinc-800/70 px-5 py-5 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <Motion.div
              key="brand"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-400 shadow-lg shadow-red-950/40">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-white">Mecatronix</h1>
                <p className="truncate text-xs font-medium text-zinc-500">Admin Panel</p>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {!isSidebarOpen && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-400">
            <Cpu className="h-5 w-5 text-white" />
          </div>
        )}

        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-300"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 no-scrollbar">
        <div className="space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title}>
              {isSidebarOpen && (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                  {group.title}
                </p>
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const icon = React.createElement(item.icon, {
                    className: "h-5 w-5 shrink-0",
                  });

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/mec-admin"}
                        title={!isSidebarOpen ? item.name : undefined}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            isActive
                              ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-950/40"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-orange-300"
                          } ${isSidebarOpen ? "" : "justify-center"}`
                        }
                      >
                        {icon}
                        {isSidebarOpen && <span className="truncate">{item.name}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-zinc-800/70 p-4">
        <AnimatePresence>
          {isSidebarOpen && (
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">System Secure</p>
                  <p className="text-xs text-emerald-300">Session active</p>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 ${
            isSidebarOpen ? "" : "justify-center"
          }`}
          title={!isSidebarOpen ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </Motion.aside>
  );
};

export default Sidenav;
