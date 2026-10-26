import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  Cpu,
  FileSignature,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Search,
  Shield,
  Ticket,
  User,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";
import { logoutSuccess } from "../../redux/slices/authSlice";
import type { RootState } from "../../redux/store";

const searchModules = [
  { label: "Dashboard", path: "/mec-admin", icon: LayoutDashboard },
  { label: "Blogs", path: "/mec-admin/blogs", icon: FileText },
  { label: "Clients", path: "/mec-admin/clients", icon: User },
  { label: "Enquiries", path: "/mec-admin/enquiries", icon: MessageCircle },
  { label: "Subscribers", path: "/mec-admin/subscribers", icon: Mail },
  { label: "Projects", path: "/mec-admin/project", icon: Briefcase },
  { label: "Works", path: "/mec-admin/work", icon: Briefcase },
  { label: "Quotation", path: "/mec-admin/quotation", icon: FileSignature },
  { label: "Voucher", path: "/mec-admin/voucher", icon: Ticket },
  { label: "Admin", path: "/mec-admin/admin", icon: Shield },
];

const defaultNotifications = [
  {
    id: "enquiries",
    title: "Check enquiries",
    description: "Review new project messages and client questions.",
    path: "/mec-admin/enquiries",
    icon: MessageCircle,
  },
  {
    id: "work",
    title: "Track works",
    description: "Move finished work into projects when ready.",
    path: "/mec-admin/work",
    icon: Briefcase,
  },
  {
    id: "quotation",
    title: "Prepare quotation",
    description: "Create polished quotes for active leads.",
    path: "/mec-admin/quotation",
    icon: FileSignature,
  },
];

const Topnav = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(defaultNotifications);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isSearchOpen]);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  }, [currentTime]);

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchModules.slice(0, 6);

    return searchModules.filter((module) =>
      module.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      successNotification("You have logged out successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      errorNotification("Logout failed. Please try again.");
    }
  }, [dispatch, navigate]);

  const openModule = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const firstMatch = filteredModules[0];
    if (firstMatch) openModule(firstMatch.path);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const adminName = user?.name || "Admin";
  const adminEmail = user?.email || "admin@mecatronix.com";
  const adminRole = user?.role || "Administrator";
  const avatarInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  return (
    <header className="w-full border-b border-zinc-800/70 bg-zinc-950/90 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400" />

      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-300 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-400 shadow-lg shadow-red-950/40 sm:flex">
            <Cpu className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-400">
              {greeting}, {adminName}
            </p>
            <h1 className="truncate text-xl font-bold text-white">
              Mecatronix Admin
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="hidden max-w-xl flex-1 lg:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search modules..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20"
            />
            {searchQuery && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                {filteredModules.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-500">No modules found</div>
                ) : (
                  filteredModules.slice(0, 5).map((module) => {
                    const icon = React.createElement(module.icon, {
                      className: "h-4 w-4 text-orange-300",
                    });
                    return (
                      <button
                        type="button"
                        key={module.path}
                        onClick={() => openModule(module.path)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                      >
                        {icon}
                        {module.label}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 xl:flex">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-zinc-200">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-xs">
              {currentTime.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-300 lg:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-300"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                    <div>
                      <p className="font-semibold text-white">Admin reminders</p>
                      <p className="text-xs text-zinc-500">Quick checks for today</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNotifications([])}
                        className="text-xs font-semibold text-orange-300 transition hover:text-orange-200"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                        <p className="text-sm text-zinc-400">All caught up.</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const icon = React.createElement(item.icon, {
                          className: "h-4 w-4",
                        });
                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => openModule(item.path)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300"
                              >
                                {icon}
                              </button>
                              <button
                                type="button"
                                onClick={() => openModule(item.path)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <p className="font-semibold text-white">{item.title}</p>
                                <p className="mt-1 text-sm text-zinc-500">
                                  {item.description}
                                </p>
                              </button>
                              <button
                                type="button"
                                onClick={() => dismissNotification(item.id)}
                                className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                                aria-label="Dismiss notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-2 transition hover:border-orange-500/60 sm:px-3"
              aria-label="User menu"
            >
              {user?.img ? (
                <img
                  src={user.img}
                  alt={adminName}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-400 text-sm font-bold text-white">
                  {avatarInitial}
                </span>
              )}
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-white">
                  {adminName}
                </span>
                <span className="block text-xs capitalize text-zinc-500">
                  {adminRole}
                </span>
              </span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <Motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                >
                  <div className="border-b border-zinc-800 p-4">
                    <p className="font-semibold text-white">{adminName}</p>
                    <p className="mt-1 truncate text-sm text-zinc-500">{adminEmail}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <Shield className="h-3.5 w-3.5" />
                      Secure session
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => openModule("/mec-admin/admin")}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <User className="h-4 w-4 text-blue-300" />
                      Profile Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => openModule("/mec-admin/enquiries")}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 text-purple-300" />
                      Manage Enquiries
                    </button>
                  </div>
                  <div className="border-t border-zinc-800 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-zinc-950/95 p-4 backdrop-blur-2xl lg:hidden"
          >
            <form onSubmit={handleSearch} className="mx-auto mt-16 max-w-2xl">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search modules..."
                  className="flex-1 bg-transparent text-lg text-white outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                {filteredModules.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-500">No modules found</div>
                ) : (
                  filteredModules.map((module) => {
                    const icon = React.createElement(module.icon, {
                      className: "h-5 w-5 text-orange-300",
                    });
                    return (
                      <button
                        type="button"
                        key={module.path}
                        onClick={() => openModule(module.path)}
                        className="flex w-full items-center gap-3 border-b border-zinc-800 px-4 py-4 text-left text-zinc-200 last:border-b-0"
                      >
                        {icon}
                        {module.label}
                      </button>
                    );
                  })
                )}
              </div>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topnav;
