import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { deleteSubscribersAPI, getAllSubscribersAPI } from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";

const getSubscriberDate = (subscriber) =>
  subscriber?.subscribedAt ||
  subscriber?.createdAt ||
  subscriber?.updatedAt ||
  subscriber?.date ||
  null;

const formatDate = (value) => {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitial = (email = "") =>
  email.trim().charAt(0).toUpperCase() || "S";

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSubscribersAPI();

      if (res?.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.subscribers)
          ? res.data.subscribers
          : [];

        setSubscribers(list);
        setSelected((prev) =>
          prev.filter((id) => list.some((subscriber) => subscriber._id === id))
        );
      } else {
        errorNotification(res?.message || "Failed to load subscribers");
      }
    } catch (err) {
      console.error("Fetch subscribers failed:", err);
      errorNotification("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filteredSubscribers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...subscribers]
      .filter((subscriber) =>
        (subscriber.email || "").toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const dateA = new Date(getSubscriberDate(a) || 0).getTime();
        const dateB = new Date(getSubscriberDate(b) || 0).getTime();

        if (sortBy === "oldest") return dateA - dateB;
        if (sortBy === "email") {
          return (a.email || "").localeCompare(b.email || "");
        }
        return dateB - dateA;
      });
  }, [searchTerm, sortBy, subscribers]);

  const stats = useMemo(() => {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return subscribers.reduce(
      (acc, subscriber) => {
        const subscribedTime = new Date(
          getSubscriberDate(subscriber) || 0
        ).getTime();

        if (subscribedTime >= monthAgo) acc.last30Days += 1;
        if (subscribedTime >= weekAgo) acc.last7Days += 1;

        return acc;
      },
      {
        total: subscribers.length,
        filtered: filteredSubscribers.length,
        last30Days: 0,
        last7Days: 0,
      }
    );
  }, [filteredSubscribers.length, subscribers]);

  const selectedVisibleCount = filteredSubscribers.filter((subscriber) =>
    selected.includes(subscriber._id)
  ).length;

  const allVisibleSelected =
    filteredSubscribers.length > 0 &&
    selectedVisibleCount === filteredSubscribers.length;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredSubscribers.map((subscriber) => subscriber._id);

    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      errorNotification("Please select at least one subscriber to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} subscriber(s)?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteSubscribersAPI(selected);
      if (res?.success) {
        successNotification(
          `${selected.length} subscriber(s) deleted successfully`
        );
        setSelected([]);
        await fetchSubscribers();
      } else {
        errorNotification(res?.message || "Failed to delete subscribers");
      }
    } catch (err) {
      console.error("Delete subscribers failed:", err);
      errorNotification("Failed to delete subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredSubscribers.length === 0) {
      errorNotification("No subscribers available to export.");
      return;
    }

    const rows = filteredSubscribers.map((subscriber) => ({
      email: subscriber.email || "",
      subscribed_date: formatDate(getSubscriberDate(subscriber)),
      subscribed_time: formatTime(getSubscriberDate(subscriber)),
    }));
    const csv = [
      "Email,Subscribed Date,Subscribed Time",
      ...rows.map((row) =>
        [row.email, row.subscribed_date, row.subscribed_time]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const Checkbox = ({ checked, onChange, id, label }) => (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="peer sr-only"
      />
      <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-zinc-500 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-400/40">
        {checked && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
    </label>
  );

  return (
    <div className="min-h-[calc(100vh-110px)] rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-white shadow-2xl sm:p-6">
      <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              <UserCheck className="h-4 w-4" />
              Newsletter audience
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Subscribers
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Track newsletter signups, search email addresses, export lists,
              and remove inactive subscribers from one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredSubscribers.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={fetchSubscribers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-blue-500/60 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={selected.length === 0 || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selected.length > 0 ? `(${selected.length})` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Subscribers",
            value: stats.total,
            tone: "text-white",
            icon: Users,
          },
          {
            label: "Search Results",
            value: stats.filtered,
            tone: "text-blue-300",
            icon: Search,
          },
          {
            label: "Last 7 Days",
            value: stats.last7Days,
            tone: "text-emerald-300",
            icon: UserCheck,
          },
          {
            label: "Last 30 Days",
            value: stats.last30Days,
            tone: "text-amber-300",
            icon: Mail,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className={`text-3xl font-bold ${item.tone}`}>
                {item.value}
              </div>
              <div className="mt-1 text-sm text-zinc-400">{item.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search subscribers by email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="email">Email A-Z</option>
        </select>

        <button
          type="button"
          onClick={toggleSelectAll}
          disabled={filteredSubscribers.length === 0}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-400">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-400" />
            <p className="font-medium">Loading subscribers...</p>
          </div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-200">
              {searchTerm ? "No subscribers found" : "No subscribers yet"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              {searchTerm
                ? "Try a different email address or clear the search field."
                : "New newsletter signups will appear here automatically."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/70 text-left text-sm text-zinc-400">
                  <th className="w-14 p-4">
                    <Checkbox
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      id="select-all-subscribers"
                      label="Select all visible subscribers"
                    />
                  </th>
                  <th className="p-4 font-semibold">Subscriber</th>
                  <th className="p-4 font-semibold">Subscription Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => {
                  const subscribedAt = getSubscriberDate(subscriber);
                  return (
                    <tr
                      key={subscriber._id}
                      className="border-b border-zinc-800/80 transition last:border-b-0 hover:bg-zinc-800/60"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selected.includes(subscriber._id)}
                          onChange={() => toggleSelect(subscriber._id)}
                          id={`subscriber-${subscriber._id}`}
                          label={`Select ${subscriber.email}`}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-base font-bold text-white">
                            {getInitial(subscriber.email)}
                          </div>
                          <div className="min-w-0">
                            <a
                              href={`mailto:${subscriber.email}`}
                              className="block truncate font-semibold text-white transition hover:text-emerald-300"
                            >
                              {subscriber.email || "Email not available"}
                            </a>
                            <p className="text-sm text-zinc-500">
                              Newsletter subscriber
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-zinc-100">
                          {formatDate(subscribedAt)}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {formatTime(subscribedAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
                        >
                          <Mail className="h-4 w-4" />
                          Mail
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 lg:hidden">
            {filteredSubscribers.map((subscriber) => {
              const subscribedAt = getSubscriberDate(subscriber);
              return (
                <div
                  key={subscriber._id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 font-bold text-white">
                        {getInitial(subscriber.email)}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="block truncate font-semibold text-white"
                        >
                          {subscriber.email || "Email not available"}
                        </a>
                        <p className="text-sm text-zinc-500">
                          {formatDate(subscribedAt)}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={selected.includes(subscriber._id)}
                      onChange={() => toggleSelect(subscriber._id)}
                      id={`mobile-subscriber-${subscriber._id}`}
                      label={`Select ${subscriber.email}`}
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Active
                    </span>
                    <a
                      href={`mailto:${subscriber.email}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200"
                    >
                      <Mail className="h-4 w-4" />
                      Mail
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
