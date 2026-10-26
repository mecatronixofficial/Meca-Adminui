import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  Building,
  MessageSquare,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import {
  getEnquiryByIdAPI,
  editEnquiryAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const SingleEnquiry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  // ✅ Fetch single enquiry
  const fetchEnquiry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEnquiryByIdAPI(id);
      if (res?.success) {
        setEnquiry(res.data);

        // mark as opened if not already
        if (!res.data.is_opened) {
          await editEnquiryAPI(id, { is_opened: true, opened_at: new Date() });
          successNotification("Enquiry marked as read");
        }
      } else {
        errorNotification(res?.message);
      }
    } catch (err) {
      console.error("Fetch enquiry failed:", err);
      errorNotification("Failed to load enquiry");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchEnquiry();
    }
  }, [fetchEnquiry, id]);

  // ✅ Copy contact info to clipboard
  const copyToClipboard = async (text) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      successNotification("Copied to clipboard!");
    } catch {
      errorNotification("Failed to copy");
    } finally {
      setCopying(false);
    }
  };

  // ✅ Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      full: date.toLocaleString(),
      relative: getRelativeTime(date),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // ✅ Get relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-400">Loading enquiry...</span>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 flex flex-col items-center gap-3">
          <Mail className="w-16 h-16 opacity-50" />
          <p className="text-lg">Enquiry not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-400 hover:text-orange-300 text-sm"
          >
            Back to enquiries
          </button>
        </div>
      </div>
    );
  }

  const receivedTime = formatDateTime(enquiry.createdAt);
  const openedTime = formatDateTime(enquiry.opened_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Enquiry Details
            </h1>
            <p className="text-gray-400 mt-1">View and manage enquiry information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => copyToClipboard(`${enquiry.name}\n${enquiry.email}\n${enquiry.phone || ''}\n${enquiry.company_name || ''}\n\n${enquiry.message}`)}
            disabled={copying}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
          >
            <Copy className="w-4 h-4" />
            {copying ? "Copying..." : "Copy All"}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Message Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Message</h3>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {enquiry.message}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Enquiry Received</p>
                  <p className="text-gray-400 text-sm">{receivedTime.full}</p>
                  <p className="text-gray-500 text-xs">{receivedTime.relative}</p>
                </div>
              </div>
              
              {enquiry.opened_at && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Marked as Read</p>
                    <p className="text-gray-400 text-sm">{openedTime.full}</p>
                    <p className="text-gray-500 text-xs">{openedTime.relative}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Contact Information */}
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <User className="w-5 h-5 text-green-400" />
              Contact Information
            </h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                <div className="flex items-center justify-between group">
                  <p className="text-white font-medium">{enquiry.name}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(enquiry.name)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                  >
                    <Copy className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <a 
                      href={`mailto:${enquiry.email}`}
                      className="text-white hover:text-purple-400 transition-colors"
                    >
                      {enquiry.email}
                    </a>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(enquiry.email)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                  >
                    <Copy className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Phone */}
              {enquiry.phone && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      <a 
                        href={`tel:${enquiry.phone}`}
                        className="text-white hover:text-green-400 transition-colors"
                      >
                        {enquiry.phone}
                      </a>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(enquiry.phone)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Company */}
              {enquiry.company_name && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Company</label>
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-orange-400" />
                      <span className="text-white">{enquiry.company_name}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(enquiry.company_name)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Metadata */}
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              Status & Information
            </h3>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {enquiry.is_opened ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">Read</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Unread</span>
                    </>
                  )}
                </div>
              </div>

              {/* Enquiry ID */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Enquiry ID</label>
                <div className="flex items-center justify-between group">
                  <code className="text-gray-300 text-sm font-mono bg-zinc-800 px-2 py-1 rounded">
                    {enquiry._id.slice(-8)}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(enquiry._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
                  >
                    <Copy className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Received */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Received</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-white text-sm">{receivedTime.date}</p>
                    <p className="text-gray-400 text-xs">{receivedTime.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={`mailto:${enquiry.email}?subject=Re: Your Enquiry&body=Dear ${enquiry.name},`}
                className="block w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white text-center py-3 rounded-lg font-medium transition-all shadow-lg shadow-orange-500/25"
              >
                Reply via Email
              </motion.a>
              
              {enquiry.phone && (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${enquiry.phone}`}
                  className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white text-center py-3 rounded-lg font-medium transition-colors border border-zinc-700"
                >
                  Call Contact
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleEnquiry;
