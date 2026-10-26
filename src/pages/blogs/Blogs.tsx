import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  FileText,
  Eye,
  Search,
  Image as ImagesIcon,
} from "lucide-react";
import {
  addBlogAPI,
  getBlogsAPI,
  editBlogAPI,
  deleteBlogAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    blog_name: "",
    short_description: "",
  });

  // ✅ Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogsAPI();
      if (res?.success) setBlogs(res.data || []);
      else errorNotification(res?.message);
    } catch {
      errorNotification("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return blogs;

    return blogs.filter((blog) => [
      blog.blog_name,
      blog.short_description,
    ].join(" ").toLowerCase().includes(query));
  }, [blogs, searchTerm]);

  const blogStats = useMemo(() => {
    const active = blogs.filter((blog) => blog.is_active).length;
    const images = blogs.reduce((sum, blog) => sum + (blog.blog_images?.length || 0), 0);
    return {
      total: blogs.length,
      active,
      inactive: blogs.length - active,
      images,
    };
  }, [blogs]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, blog_images: imageUrls };
      let res;

      if (editMode && selectedBlog) {
        res = await editBlogAPI(selectedBlog._id, payload);
      } else {
        res = await addBlogAPI(payload);
      }

      if (res?.success) {
        successNotification(res.message);
        setModalOpen(false);
        setForm({ blog_name: "", short_description: "" });
        setImageUrls([]);
        fetchBlogs();
      } else errorNotification(res?.message);
    } catch {
      errorNotification("Something went wrong");
    }
  };

  // ✅ Delete Blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await deleteBlogAPI(id);
      if (res?.success) {
        successNotification("Blog deleted successfully");
        fetchBlogs();
      } else errorNotification(res?.message);
    } catch {
      errorNotification("Delete failed");
    }
  };

  // ✅ Open modal (for Add/Edit)
  const openModal = (blog = null) => {
    if (blog) {
      setEditMode(true);
      setSelectedBlog(blog);
      setForm({
        blog_name: blog.blog_name,
        short_description: blog.short_description,
      });
      setImageUrls(blog.blog_images || []);
    } else {
      setEditMode(false);
      setSelectedBlog(null);
      setForm({ blog_name: "", short_description: "" });
      setImageUrls([]);
    }
    setModalOpen(true);
  };

  // ✅ Upload images
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []) as File[];
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        errorNotification(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorNotification(`${file.name} is too large. Max 5MB`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const res = await uploadImageAPI(validFiles);

      if (res?.success && Array.isArray(res.files) && res.files.length > 0) {
        const uploaded = res.files.map((f) => f.url);
        setImageUrls((prev) => [...prev, ...uploaded]);
        successNotification("Images uploaded successfully!");
      } else {
        errorNotification("Upload failed");
      }
    } catch {
      errorNotification("Something went wrong during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ✅ Delete image from AWS
  const handleImageDelete = async (url) => {
    if (!url) return;
    try {
      const res = await deleteImageAPI({ urls: [url] });
      if (res?.success) {
        setImageUrls((prev) => prev.filter((img) => img !== url));
        successNotification("Image deleted successfully");
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to delete image");
    }
  };

  // ✅ Toggle blog status
  const toggleStatus = async (blog) => {
    try {
      const payload = {
        blog_name: blog.blog_name,
        short_description: blog.short_description,
        blog_images: blog.blog_images,
        is_active: !blog.is_active
      };
      
      const res = await editBlogAPI(blog._id, payload);
      if (res?.success) {
        successNotification(`Blog ${!blog.is_active ? 'activated' : 'deactivated'} successfully`);
        fetchBlogs();
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Blogs Management
          </h1>
          <p className="text-gray-400 mt-1">Create and manage your blog posts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Motion.button>
          
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Blog
          </Motion.button>
        </div>
      </Motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{blogStats.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total Blogs</p>
        </Motion.div>
        
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Eye className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {blogStats.active}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Active Blogs</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <ImagesIcon className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">{blogStats.images}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Blog Images</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-8 h-8 text-zinc-500" />
            <span className="text-2xl font-bold text-white">{blogStats.inactive}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Inactive Blogs</p>
        </Motion.div>
      </div>

      {/* Blogs Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden"
      >
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-white">Blog Library</div>
            <div className="text-xs text-zinc-500">
              Showing {filteredBlogs.length} of {blogs.length} blog{blogs.length === 1 ? "" : "s"}
            </div>
          </div>
          <label className="relative w-full md:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blog name or description..."
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/60 border-b border-zinc-700">
              <tr>
                <th className="p-4 text-left text-gray-300 font-semibold">Blog</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Description</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Images</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Status</th>
                <th className="p-4 text-right text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <div className="text-gray-400 flex flex-col items-center gap-3">
                      <RefreshCw className="w-10 h-10 animate-spin text-blue-400" />
                      <p>Loading blogs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog, index) => (
                  <Motion.tr
                    key={blog._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-white">{blog.blog_name}</div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {blog.short_description}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {Array.isArray(blog.blog_images) && blog.blog_images.length > 0 ? (
                          <>
                            {blog.blog_images.slice(0, 2).map((img, i) => (
                              <Motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                              >
                                <img
                                  src={img}
                                  alt={`Blog ${i + 1}`}
                                  className="w-12 h-12 rounded-lg object-cover cursor-pointer border border-zinc-700"
                                  onClick={() => setPreviewImage(img)}
                                />
                                {blog.blog_images.length > 2 && i === 1 && (
                                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-xs">
                                    +{blog.blog_images.length - 2}
                                  </div>
                                )}
                              </Motion.div>
                            ))}
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">No images</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStatus(blog)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          blog.is_active
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {blog.is_active ? "Active" : "Inactive"}
                      </Motion.button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openModal(blog)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Motion.button>
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Motion.button>
                      </div>
                    </td>
                  </Motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 opacity-50" />
                      <p>{searchTerm ? "No blogs match your search" : "No blogs found"}</p>
                      <button
                        onClick={() => openModal()}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Create your first blog
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
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
                  <h3 className="text-xl font-semibold text-white">
                    {editMode ? "Edit Blog" : "Create New Blog"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Blog Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Blog Name
                    </label>
                    <input
                      type="text"
                      name="blog_name"
                      value={form.blog_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter blog name"
                    />
                  </div>

                  {/* Blog Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Blog Images
                    </label>

                    {/* Image Preview Grid */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {imageUrls.map((url, i) => (
                          <Motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                          >
                            <img
                              src={url}
                              alt={`Upload ${i + 1}`}
                              className="w-full h-24 rounded-lg object-cover border border-zinc-700 cursor-pointer"
                              onClick={() => setPreviewImage(url)}
                            />
                            <Motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleImageDelete(url)}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </Motion.button>
                          </Motion.div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-3 rounded-lg text-gray-300 transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Images"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-2">
                      Supports multiple images (JPEG, PNG, WebP)
                    </p>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="short_description"
                      value={form.short_description}
                      onChange={handleChange}
                      rows={4}
                      required
                      maxLength={250}
                      placeholder="Enter short description..."
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                    <div className="text-right text-gray-500 text-xs mt-1">
                      {form.short_description.length}/250
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </Motion.button>
                    <Motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
                    >
                      {editMode ? "Update Blog" : "Create Blog"}
                    </Motion.button>
                  </div>
                </form>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setPreviewImage(null)}
          >
            <Motion.div
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
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blogs;
