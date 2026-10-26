import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "motion/react";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Clock,
  Download,
  FileSignature,
  FileText,
  Mail,
  MessageCircle,
  Package,
  RefreshCw,
  Star,
  Ticket,
  UserCog,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "../../api/api";
import { errorNotification } from "../../helpers/notifi_helper";

const numberValue = (value) => Number(value || 0);

const getValue = (stats, key, subKey = null) => {
  if (!stats) return 0;
  if (subKey) return numberValue(stats[key]?.[subKey]);
  return numberValue(stats[key]);
};

const chartTooltip = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "10px",
  color: "#fff",
};

const Dash = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("monthly");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const result = await DashboardStats();
      if (result?.success) {
        setStats(result.data || {});
        setLastUpdated(new Date());
      } else {
        const message = result?.message || "Failed to load dashboard data";
        setError(message);
        errorNotification(message);
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError("Failed to load dashboard data");
      errorNotification(err, "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = useMemo(
    () => ({
      blogs: getValue(stats, "blogs"),
      banners: getValue(stats, "banners"),
      clients: getValue(stats, "clients"),
      enquiries: getValue(stats, "enquiries", "total"),
      pendingEnquiries: getValue(stats, "enquiries", "unopened"),
      reviews: getValue(stats, "reviews", "total"),
      subscribers: getValue(stats, "subscribers"),
      admins: getValue(stats, "admins", "total"),
      projects: getValue(stats, "projects"),
      works: getValue(stats, "works"),
    }),
    [stats]
  );

  const totalRecords = useMemo(
    () =>
      summary.blogs +
      summary.banners +
      summary.clients +
      summary.enquiries +
      summary.reviews +
      summary.subscribers +
      summary.projects +
      summary.works,
    [summary]
  );

  const cards = useMemo(
    () => [
      {
        icon: FileText,
        label: "Blogs",
        value: summary.blogs,
        previous: Math.max(0, summary.blogs - 4),
        color: "from-blue-500 to-cyan-400",
        location: "/mec-admin/blogs",
      },
      {
        icon: Package,
        label: "Banners",
        value: summary.banners,
        previous: Math.max(0, summary.banners - 2),
        color: "from-violet-500 to-purple-400",
        location: "/mec-admin/banners",
      },
      {
        icon: Users,
        label: "Clients",
        value: summary.clients,
        previous: Math.max(0, summary.clients - 5),
        color: "from-emerald-500 to-green-400",
        location: "/mec-admin/clients",
      },
      {
        icon: Bell,
        label: "Pending Enquiries",
        value: summary.pendingEnquiries,
        previous: summary.pendingEnquiries + 2,
        inverseTrend: true,
        color: "from-rose-500 to-orange-400",
        location: "/mec-admin/enquiries",
      },
      {
        icon: Star,
        label: "Reviews",
        value: summary.reviews,
        previous: Math.max(0, summary.reviews - 6),
        color: "from-yellow-400 to-orange-300",
        location: "/mec-admin/reviews",
      },
      {
        icon: Mail,
        label: "Subscribers",
        value: summary.subscribers,
        previous: Math.max(0, summary.subscribers - 18),
        color: "from-red-500 to-pink-400",
        location: "/mec-admin/subscribers",
      },
      {
        icon: UserCog,
        label: "Admins",
        value: summary.admins,
        previous: summary.admins,
        color: "from-indigo-500 to-sky-400",
        location: "/mec-admin/admin",
      },
      {
        icon: Briefcase,
        label: "Projects",
        value: summary.projects,
        previous: Math.max(0, summary.projects - 3),
        color: "from-fuchsia-500 to-pink-400",
        location: "/mec-admin/project",
      },
      {
        icon: BarChart3,
        label: "Works",
        value: summary.works,
        previous: Math.max(0, summary.works - 4),
        color: "from-teal-500 to-lime-400",
        location: "/mec-admin/work",
      },
    ],
    [summary]
  );

  const growthData = useMemo(() => {
    const data = stats?.trends?.[timeRange];
    return Array.isArray(data) ? data : [];
  }, [stats, timeRange]);

  const distributionData = useMemo(
    () => [
      { name: "Clients", value: summary.clients, color: "#22c55e" },
      { name: "Projects", value: summary.projects, color: "#3b82f6" },
      { name: "Works", value: summary.works, color: "#14b8a6" },
      { name: "Blogs", value: summary.blogs, color: "#f97316" },
      { name: "Subscribers", value: summary.subscribers, color: "#ef4444" },
    ].filter((item) => item.value > 0),
    [summary]
  );

  const workloadData = useMemo(
    () => [
      { name: "Open Enquiries", count: summary.pendingEnquiries },
      { name: "Works", count: summary.works },
      { name: "Projects", count: summary.projects },
      { name: "Reviews", count: summary.reviews },
    ],
    [summary]
  );

  const attentionItems = useMemo(
    () => [
      {
        icon: Bell,
        label: "Pending enquiries",
        description:
          summary.pendingEnquiries > 0
            ? "Open customer messages need review."
            : "No pending enquiries right now.",
        value: summary.pendingEnquiries,
        location: "/mec-admin/enquiries",
        color: "text-rose-300 bg-rose-500/10 border-rose-500/20",
      },
      {
        icon: BarChart3,
        label: "Works in progress",
        description: "Track active work before moving it to projects.",
        value: summary.works,
        location: "/mec-admin/work",
        color: "text-teal-300 bg-teal-500/10 border-teal-500/20",
      },
      {
        icon: Briefcase,
        label: "Completed projects",
        description: "Published project records available for review.",
        value: summary.projects,
        location: "/mec-admin/project",
        color: "text-blue-300 bg-blue-500/10 border-blue-500/20",
      },
    ],
    [summary]
  );

  const quickActions = [
    {
      icon: FileText,
      label: "Blogs",
      description: "Create or update posts",
      location: "/mec-admin/blogs",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: UserPlus,
      label: "Clients",
      description: "Add client details",
      location: "/mec-admin/clients",
      color: "from-emerald-500 to-green-400",
    },
    {
      icon: MessageCircle,
      label: "Enquiries",
      description: "Reply to leads",
      location: "/mec-admin/enquiries",
      color: "from-rose-500 to-orange-400",
    },
    {
      icon: FileSignature,
      label: "Quotation",
      description: "Prepare quote PDF",
      location: "/mec-admin/quotation",
      color: "from-amber-500 to-yellow-400",
    },
    {
      icon: Ticket,
      label: "Voucher",
      description: "Manage offers",
      location: "/mec-admin/voucher",
      color: "from-purple-500 to-fuchsia-400",
    },
  ];

  const handleExport = () => {
    const rows = cards.map((card) => ({
      module: card.label,
      count: card.value,
    }));
    const csv = [
      "Module,Count",
      ...rows.map((row) => `"${row.module}",${row.count}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mecatronix-dashboard-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-white">
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/30 p-5 shadow-2xl sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300">
              <Activity className="h-4 w-4" />
              Mecatronix control center
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Monitor content, clients, enquiries, work, projects, and admin
              activity from one focused workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/60 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!stats}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </Motion.div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <p className="text-sm text-zinc-400">Total records</p>
          <p className="mt-2 text-3xl font-bold">{totalRecords.toLocaleString()}</p>
          <p className="mt-2 text-xs text-zinc-500">Across managed modules</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <p className="text-sm text-zinc-400">Pending enquiries</p>
          <p className="mt-2 text-3xl font-bold text-rose-300">
            {summary.pendingEnquiries.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Messages waiting for action</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <p className="text-sm text-zinc-400">Project pipeline</p>
          <p className="mt-2 text-3xl font-bold text-blue-300">
            {(summary.projects + summary.works).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Works plus finished projects</p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
          <RefreshCw className="mr-3 h-6 w-6 animate-spin text-red-400" />
          Loading dashboard data...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card, index) => {
              return (
                <Motion.button
                  type="button"
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(card.location)}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-left shadow-lg transition hover:border-zinc-700"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition group-hover:opacity-10`}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                      >
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Live total
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">{card.label}</p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                </Motion.button>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl xl:col-span-2">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="h-5 w-5 text-red-400" />
                    Growth Trends
                  </h2>
                  <p className="text-sm text-zinc-500">Current API totals over the selected range</p>
                </div>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 capitalize">
                  {timeRange}
                </span>
              </div>
              <div className="h-80">
                {growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="subscriberFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="projectFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip contentStyle={chartTooltip} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="subscribers"
                      stroke="#ef4444"
                      fill="url(#subscriberFill)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="projects"
                      stroke="#3b82f6"
                      fill="url(#projectFill)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="clients"
                      stroke="#22c55e"
                      fill="transparent"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-700 px-6 text-center text-sm text-zinc-500">
                    Historical trend data is not available from the dashboard API yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <PieChartIcon />
                Module Distribution
              </h2>
              <div className="h-72">
                {distributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distributionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    No module data yet
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl xl:col-span-2">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-teal-400" />
                Workload Snapshot
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip contentStyle={chartTooltip} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  Needs Attention
                </h2>
                <div className="space-y-3">
                  {attentionItems.map((item) => (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => navigate(item.location)}
                      className={`w-full rounded-xl border p-4 text-left transition hover:bg-zinc-800 ${item.color}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{item.label}</p>
                          <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                        </div>
                        <span className="text-2xl font-bold">{item.value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Zap className="h-5 w-5 text-orange-400" />
                  Quick Actions
                </h2>
                <div className="grid gap-3">
                  {quickActions.map((action) => (
                    <button
                      type="button"
                      key={action.label}
                      onClick={() => navigate(action.location)}
                      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-left transition hover:border-zinc-700 hover:bg-zinc-800"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </span>
                      <span>
                        <span className="block font-semibold">{action.label}</span>
                        <span className="text-sm text-zinc-500">{action.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 py-5 text-sm text-zinc-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          Last updated: {lastUpdated ? lastUpdated.toLocaleString("en-IN") : "Not available"}
        </div>
        <span>Mecatronix Admin Dashboard</span>
      </div>
    </div>
  );
};

const PieChartIcon = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-400">
    <span className="h-2 w-2 rounded-full bg-blue-400" />
  </span>
);

export default Dash;
