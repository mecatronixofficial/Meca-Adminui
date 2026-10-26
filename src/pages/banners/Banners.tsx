import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  Eye,
  Target,
  TrendingUp
} from "lucide-react";
import {
  addBannerAPI,
  getBannersAPI,
  editBannerAPI,
  deleteBannerAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    position: "",
    is_active: true,
  });

  // ✅ Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getBannersAPI();
      if (res?.success) setBanners(res.data);
      else errorNotification(res?.message);
    } catch {
      errorNotification("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ Upload Image
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return errorNotification("Please select a valid image file");
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return errorNotification("Image size should be less than 5MB");
    }

    const formData = new FormData();
    formData.append("images", file);

    try {
      setUploading(true);
      const res = await uploadImageAPI(formData);

      if (res?.success && res.files?.length) {
        const uploaded = res.files[0].url;
        setImgUrl(uploaded);
        successNotification("Image uploaded successfully!");
      } else {
        errorNotification("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      errorNotification("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete uploaded image
  const handleImageDelete = async () => {
    if (!imgUrl) return;
    try {
      const res = await deleteImageAPI({ urls: [imgUrl] });
      if (res?.success) {
        successNotification("Image deleted successfully");
        setImgUrl("");
      } else errorNotification("Failed to delete image");
    } catch (err) {
      console.error(err);
      errorNotification("Delete failed");
    }
  };

  // ✅ Submit form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imgUrl) return errorNotification("Please upload an image first!");

    const payload = { ...form, img: imgUrl };

    try {
      let res;
      if (editMode && selectedBanner) {
        res = await editBannerAPI(selectedBanner._id, payload);
      } else {
        res = await addBannerAPI(payload);
      }

      if (res?.success) {
        successNotification(res.message);
        setModalOpen(false);
        setForm({ name: "", description: "", position: "", is_active: true });
        setImgUrl("");
        fetchBanners();
      } else errorNotification(res?.message);
    } catch {
      errorNotification("Something went wrong");
    }
  };

  // ✅ Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await deleteBannerAPI(id);
      if (res?.success) {
        successNotification("Banner deleted successfully");
        fetchBanners();
      } else errorNotification(res?.message);
    } catch {
      errorNotification("Delete failed");
    }
  };

  // ✅ Toggle banner status
  const toggleStatus = async (banner) => {
    try {
      const payload = {
        name: banner.name,
        description: banner.description,
        position: banner.position,
        img: banner.img,
        is_active: !banner.is_active
      };
      
      const res = await editBannerAPI(banner._id, payload);
      if (res?.success) {
        successNotification(`Banner ${!banner.is_active ? 'activated' : 'deactivated'} successfully`);
        fetchBanners();
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to update status");
    }
  };

  // ✅ Open modal for Add/Edit
  const openModal = (banner = null) => {
    if (banner) {
      setEditMode(true);
      setSelectedBanner(banner);
      setImgUrl(banner.img);
      setForm({
        name: banner.name,
        description: banner.description,
        position: banner.position,
        is_active: banner.is_active,
      });
    } else {
      setEditMode(false);
      setSelectedBanner(null);
      setForm({ name: "", description: "", position: "", is_active: true });
      setImgUrl("");
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Banners Management
          </h1>
          <p className="text-gray-400 mt-1">Manage website banners and promotions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchBanners}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <ImageIcon className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{banners.length}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total Banners</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Eye className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {banners.filter(b => b.is_active).length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Active Banners</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Target className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {banners.filter(b => b.position).length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Positioned</p>
        </motion.div>
      </div>

      {/* Banners Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/60 border-b border-zinc-700">
              <tr>
                <th className="p-4 text-left text-gray-300 font-semibold">Banner</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Details</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Position</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Status</th>
                <th className="p-4 text-right text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                banners.map((banner, index) => (
                  <motion.tr
                    key={banner._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative"
                        >
                          <img
                            src={banner.img}
                            alt={banner.name}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-zinc-700"
                            onClick={() => setPreviewImage(banner.img)}
                          />
                        </motion.div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{banner.name}</div>
                      <p className="text-gray-300 text-sm line-clamp-2 mt-1">
                        {banner.description}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">#{banner.position}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStatus(banner)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          banner.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </motion.button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openModal(banner)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(banner._id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                      <ImageIcon className="w-12 h-12 opacity-50" />
                      <p>No banners found</p>
                      <button
                        onClick={() => openModal()}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Create your first banner
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900/95 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {editMode ? "Edit Banner" : "Create New Banner"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Banner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Banner Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Enter banner name"
                    />
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Banner Image
                    </label>

                    {/* Image Preview */}
                    {imgUrl ? (
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <img
                            src={imgUrl}
                            alt="Uploaded"
                            className="w-32 h-20 rounded-lg object-cover cursor-pointer border border-zinc-700"
                            onClick={() => setPreviewImage(imgUrl)}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={handleImageDelete}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        </motion.div>
                      </div>
                    ) : null}

                    {/* Upload Button */}
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-3 rounded-lg text-gray-300 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-2">
                      Recommended: 1920x1080px, max 5MB (JPEG, PNG, WebP)
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      required
                      maxLength={500}
                      placeholder="Enter banner description..."
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                    <div className="text-right text-gray-500 text-xs mt-1">
                      {form.description.length}/500
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Position
                    </label>
                    <input
                      type="number"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      required
                      min={1}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Enter display position (1, 2, 3...)"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Lower numbers appear first
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-500 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label className="text-gray-300 font-medium">Active Banner</label>
                    <span className="text-gray-500 text-sm ml-auto">
                      {form.is_active ? "Visible on website" : "Hidden from website"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!imgUrl}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25"
                    >
                      {editMode ? "Update Banner" : "Create Banner"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Banners;
