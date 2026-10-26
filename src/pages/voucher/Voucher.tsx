import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Heading,
  Send,
  Calendar,
  Mail,
  Search
} from "lucide-react";
import {
  addVoucherAPI,
  getAllVouchersAPI,
  deleteVoucherAPI,
  getVoucherByIdAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";
import Swal from 'sweetalert2';

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendingVoucher, setSendingVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    title: "",
    heading: "",
    msg: "",
  });

  // ✅ Fetch all vouchers
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await getAllVouchersAPI();
      if (res?.success) {
        setVouchers(res.data || []);
      } else {
        errorNotification(res?.message || "Failed to fetch vouchers");
      }
    } catch {
      errorNotification("Something went wrong while fetching vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return vouchers;

    return vouchers.filter((voucher) => [
      voucher.title,
      ...(voucher.heading || []),
      ...(voucher.msg || []),
    ].join(" ").toLowerCase().includes(query));
  }, [searchTerm, vouchers]);

  const voucherStats = useMemo(() => {
    const images = vouchers.reduce((sum, voucher) => sum + (voucher.img?.length || 0), 0);
    return {
      total: vouchers.length,
      images,
      ready: vouchers.filter((voucher) => voucher.title && (voucher.heading?.length || voucher.msg?.length || voucher.img?.length)).length,
    };
  }, [vouchers]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit new voucher
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return errorNotification("Title is required");

    const payload = {
      title: form.title,
      heading: form.heading ? [form.heading] : [],
      msg: form.msg ? [form.msg] : [],
      img: imageUrls,
      createdAt: new Date().toISOString(),
    };

    try {
      setSending(true);
      const res = await addVoucherAPI(payload);
      if (res?.success) {
        successNotification("🎉 Voucher created successfully!");
        setModalOpen(false);
        setForm({ title: "", heading: "", msg: "" });
        setImageUrls([]);
        fetchVouchers();
      } else {
        errorNotification(res?.message || "Failed to create voucher");
      }
    } catch {
      errorNotification("Error while creating voucher");
    } finally {
      setSending(false);
    }
  };

  // ✅ Send voucher to all subscribers
  const handleSendToSubscribers = async (voucherId) => {
    const result = await Swal.fire({
      title: '📧 Send to All Subscribers?',
      text: "This voucher will be sent to all your subscribers!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Send Now!',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      setSendingVoucher(voucherId);
      const res = await addVoucherAPI(voucherId);
      if (res?.success) {
        successNotification(`✅ Voucher sent to ${res.data?.sentCount || 'all'} subscribers!`);
      } else {
        errorNotification(res?.message || "Failed to send voucher");
      }
    } catch {
      errorNotification("❌ Error while sending voucher");
    } finally {
      setSendingVoucher(null);
    }
  };

  // ✅ Delete voucher
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '⚠️ Are you sure?',
      text: "This voucher will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deleteVoucherAPI(id);
      if (res?.success) {
        successNotification("🗑️ Voucher deleted successfully");
        fetchVouchers();
      } else {
        errorNotification(res?.message || "Failed to delete voucher");
      }
    } catch {
      errorNotification("Error while deleting voucher");
    }
  };

  // ✅ Upload images
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []) as File[];
    if (!files.length) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        errorNotification(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorNotification(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    try {
      setUploading(true);
      const res = await uploadImageAPI(validFiles);
      if (res?.success && res.files?.length) {
        const uploaded = res.files.map((f) => f.url);
        setImageUrls((prev) => [...prev, ...uploaded]);
        successNotification("🖼️ Images uploaded successfully!");
      } else {
        errorNotification("❌ Failed to upload images");
      }
    } catch {
      errorNotification("❌ Error while uploading images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ✅ Delete image
  const handleImageDelete = async (url) => {
    try {
      const res = await deleteImageAPI({ urls: [url] });
      if (res?.success) {
        setImageUrls((prev) => prev.filter((img) => img !== url));
        successNotification("🗑️ Image deleted successfully");
      } else {
        errorNotification(res?.message || "Failed to delete image");
      }
    } catch {
      errorNotification("❌ Error deleting image");
    }
  };

  // ✅ View single voucher
  const handleView = async (id) => {
    try {
      const res = await getVoucherByIdAPI(id);
      if (res?.success) {
        setSelectedVoucher(res.data);
      } else {
        errorNotification("❌ Failed to fetch voucher details");
      }
    } catch {
      errorNotification("❌ Error fetching voucher details");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Voucher Management
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Create and send vouchers to all subscribers
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchVouchers}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700 rounded-xl text-gray-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Voucher
            </Motion.button>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{voucherStats.total}</div>
                <div className="text-gray-400 text-sm">Total Vouchers</div>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Send className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {voucherStats.images}
                </div>
                <div className="text-gray-400 text-sm">Uploaded Images</div>
              </div>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {voucherStats.ready}
                </div>
                <div className="text-gray-400 text-sm">Ready to Send</div>
              </div>
            </div>
          </Motion.div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-white font-bold">Voucher Library</h2>
              <p className="text-xs text-gray-500">
                Showing {filteredVouchers.length} of {vouchers.length} voucher{vouchers.length === 1 ? "" : "s"}
              </p>
            </div>
            <label className="relative w-full md:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, heading, message..."
                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Vouchers Grid */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Loading Vouchers</h3>
                <p className="text-gray-500">Fetching latest voucher campaigns...</p>
              </div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Vouchers Found</h3>
                <p className="text-gray-500">{searchTerm ? "Try a different search term" : "Create your first voucher to get started"}</p>
              </div>
            </div>
          ) : (
            filteredVouchers.map((voucher, index) => (
              <Motion.article
                key={voucher._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 border border-zinc-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                      {voucher.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-green-400">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(voucher.createdAt)}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                    Active
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-4">
                  {voucher.heading?.[0] && (
                    <div className="flex items-start gap-2">
                      <Heading className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{voucher.heading[0]}</p>
                    </div>
                  )}

                  {voucher.msg?.[0] && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400 text-sm line-clamp-2">{voucher.msg[0]}</p>
                    </div>
                  )}
                </div>

                {/* Images */}
                {voucher.img?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      {voucher.img.slice(0, 3).map((url, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt="voucher"
                            className="w-16 h-16 rounded-lg object-cover border border-zinc-600 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setPreviewImage(url)}
                          />
                          {voucher.img.length > 3 && i === 2 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">+{voucher.img.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-700/50">
                  <div className="flex gap-2">
                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleView(voucher._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-xl text-gray-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Motion.button>

                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendToSubscribers(voucher._id)}
                      disabled={sendingVoucher === voucher._id}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {sendingVoucher === voucher._id ? (
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Motion.button>
                  </div>

                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(voucher._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Motion.button>
                </div>
              </Motion.article>
            ))
          )}
        </Motion.div>
      </div>

      {/* Add Voucher Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Modal
            title="Create New Voucher"
            onClose={() => {
              setModalOpen(false);
              setForm({ title: "", heading: "", msg: "" });
              setImageUrls([]);
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Voucher Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter voucher title..."
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Heading */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Heading className="w-4 h-4 text-blue-400" />
                  Heading (Optional)
                </label>
                <input
                  type="text"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="Enter heading..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Message (Optional)
                </label>
                <textarea
                  name="msg"
                  value={form.msg}
                  onChange={handleChange}
                  placeholder="Enter voucher message..."
                  rows={3}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  Voucher Images (Optional)
                </label>

                {/* Image Previews */}
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt="uploaded"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-zinc-600 cursor-pointer hover:border-purple-500 transition-colors"
                          onClick={() => setPreviewImage(url)}
                        />
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleImageDelete(url)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </Motion.button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className={`cursor-pointer inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed transition-all ${uploading
                  ? 'border-blue-400 bg-blue-500/10 text-blue-400 cursor-not-allowed'
                  : 'border-zinc-600 hover:border-purple-500 hover:bg-purple-500/10 text-gray-400 hover:text-purple-400'
                  }`}>
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Images...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Voucher Images</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WEBP (Max 5MB per image)</p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-zinc-700/50">
                <Motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setModalOpen(false);
                    setForm({ title: "", heading: "", msg: "" });
                    setImageUrls([]);
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 rounded-xl text-gray-300 transition-colors"
                >
                  Cancel
                </Motion.button>
                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={sending || !form.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Voucher...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Voucher
                    </>
                  )}
                </Motion.button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Voucher Modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <Modal
            title="Voucher Details"
            onClose={() => setSelectedVoucher(null)}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedVoucher.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                      Active • Created {formatDate(selectedVoucher.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {selectedVoucher.heading?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                      <Heading className="w-4 h-4 text-purple-400" />
                      Headings
                    </h4>
                    <div className="space-y-2">
                      {selectedVoucher.heading.map((h, i) => (
                        <p key={i} className="text-white bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                          {h}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVoucher.msg?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      Messages
                    </h4>
                    <div className="space-y-2">
                      {selectedVoucher.msg.map((m, i) => (
                        <p key={i} className="text-gray-300 bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                          {m}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVoucher.img?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      Voucher Images ({selectedVoucher.img.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedVoucher.img.map((url, i) => (
                        <Motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="relative group cursor-pointer"
                          onClick={() => setPreviewImage(url)}
                        >
                          <img
                            src={url}
                            alt={`voucher-${i}`}
                            className="w-full h-24 object-cover rounded-xl border-2 border-zinc-600 group-hover:border-purple-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors" />
                        </Motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="pt-4 border-t border-zinc-700/50">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendToSubscribers(selectedVoucher._id)}
                  disabled={sendingVoucher === selectedVoucher._id}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 transition-all disabled:opacity-50"
                >
                  {sendingVoucher === selectedVoucher._id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending to Subscribers...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send to All Subscribers
                    </>
                  )}
                </Motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <Motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </Motion.button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, children, onClose }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <Motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          {title}
        </h2>
        <Motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </Motion.button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </Motion.div>
  </Motion.div>
);

export default Voucher;
