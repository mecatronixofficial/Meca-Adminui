import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Trash2,
  RefreshCw,
  Eye,
  User,
  Phone,
  Building,
  Calendar,
  Filter,
  Search,
  X
} from "lucide-react";
import {
  getAllEnquiriesAPI,
  deleteEnquiryAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch all enquiries
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await getAllEnquiriesAPI();
      if (res?.success) setEnquiries(res.data || []);
      else errorNotification(res?.message);
    } catch {
      errorNotification("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // ✅ Delete enquiry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await deleteEnquiryAPI(id);
      if (res?.success) {
        successNotification("Enquiry deleted successfully");
        fetchEnquiries();
        if (previewOpen) setPreviewOpen(false);
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to delete enquiry");
    }
  };

  // ✅ Navigate to single enquiry page
  const handleView = (id) => {
    navigate(`/mec-admin/enquiries/${id}`);
  };

  // ✅ Quick preview
  const handleQuickPreview = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setPreviewOpen(true);
  };

  // ✅ Format date/time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: "-", time: "-" };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
  };

  // ✅ Filter enquiries
  const filteredEnquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesSearch = !query || [
        enquiry.name,
        enquiry.email,
        enquiry.company_name,
        enquiry.phone,
        enquiry.message,
      ].join(" ").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "opened" && enquiry.is_opened) ||
        (statusFilter === "unopened" && !enquiry.is_opened);

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, searchTerm, statusFilter]);

  // ✅ Calculate statistics
  const stats = useMemo(() => ({
    total: enquiries.length,
    unopened: enquiries.filter((e) => !e.is_opened).length,
    opened: enquiries.filter((e) => e.is_opened).length,
    today: enquiries.filter((e) => {
      const today = new Date().toDateString();
      const enquiryDate = new Date(e.createdAt).toDateString();
      return today === enquiryDate;
    }).length,
  }), [enquiries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Enquiries Management
          </h1>
          <p className="text-gray-400 mt-1">Manage and respond to customer enquiries</p>
        </div>
        
        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchEnquiries}
          disabled={loading}
          className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Motion.button>
      </Motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Mail className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total Enquiries</p>
        </Motion.div>
        
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Eye className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats.unopened}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Unread</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Calendar className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.today}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Today</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Eye className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.opened}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Read</p>
        </Motion.div>
      </div>

      {/* Filters */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div className="text-sm font-bold text-white">Enquiry Inbox</div>
          <div className="text-xs text-zinc-500">
            Showing {filteredEnquiries.length} of {enquiries.length} enquir{enquiries.length === 1 ? "y" : "ies"}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[560px]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search name, email, company, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="unopened">Unread</option>
            <option value="opened">Read</option>
          </select>
          {(searchTerm || statusFilter !== "all") && (
            <Motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </Motion.button>
          )}
        </div>
      </Motion.div>

      {/* Enquiries Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-400">Loading enquiries...</span>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 flex flex-col items-center gap-3">
              <Mail className="w-16 h-16 opacity-50" />
              <p className="text-lg">
                {enquiries.length === 0 ? "No enquiries found" : "No matching enquiries"}
              </p>
              {enquiries.length === 0 && (
                <p className="text-sm text-gray-500">New enquiries will appear here</p>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/60 border-b border-zinc-700">
                <tr>
                  <th className="p-4 text-left text-gray-300 font-semibold">Contact</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">Company</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">Status</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">Date</th>
                  <th className="p-4 text-right text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry, index) => {
                  const { date, time } = formatDateTime(enquiry.createdAt);
                  return (
                    <Motion.tr
                      key={enquiry._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                        !enquiry.is_opened ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            {enquiry.name}
                          </div>
                          <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-orange-300">
                            <Mail className="w-3 h-3 text-purple-400" />
                            {enquiry.email}
                          </a>
                          {enquiry.phone && (
                            <a href={`tel:${enquiry.phone}`} className="flex items-center gap-2 text-sm text-gray-300 transition hover:text-orange-300">
                              <Phone className="w-3 h-3 text-green-400" />
                              {enquiry.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Building className="w-4 h-4 text-orange-400" />
                          {enquiry.company_name || "Not specified"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Motion.span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            enquiry.is_opened
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {enquiry.is_opened ? "Read" : "Unread"}
                        </Motion.span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-white text-sm">{date}</div>
                          <div className="text-gray-400 text-xs">{time}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuickPreview(enquiry)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Motion.button>
                          <Motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`mailto:${enquiry.email}?subject=Re: Your Enquiry&body=Dear ${enquiry.name || "Client"},`}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                            title="Reply Email"
                          >
                            <Mail className="w-4 h-4" />
                          </Motion.a>
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(enquiry._id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Motion.button>
                        </div>
                      </td>
                    </Motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewOpen && selectedEnquiry && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900/95 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Enquiry Preview</h3>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">Name</label>
                          <p className="text-white font-medium">{selectedEnquiry.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="text-white">{selectedEnquiry.email}</p>
                        </div>
                        {selectedEnquiry.phone && (
                          <div>
                            <label className="text-xs text-gray-500">Phone</label>
                            <p className="text-white">{selectedEnquiry.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company Details
                      </h4>
                      <div>
                        <label className="text-xs text-gray-500">Company</label>
                        <p className="text-white">
                          {selectedEnquiry.company_name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            selectedEnquiry.is_opened
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}>
                            {selectedEnquiry.is_opened ? "Read" : "Unread"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {selectedEnquiry.message && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300">Message</h4>
                      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {selectedEnquiry.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(selectedEnquiry.createdAt).date} at{" "}
                      {formatDateTime(selectedEnquiry.createdAt).time}
                    </div>
                    <div className="flex gap-2">
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleView(selectedEnquiry._id)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white rounded-lg font-medium transition-all"
                      >
                        View Full Details
                      </Motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Enquiries;
