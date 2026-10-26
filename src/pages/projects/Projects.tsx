import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  ExternalLink,
  Briefcase,
  Users,
  FolderOpen,
  Globe,
  FileText
} from "lucide-react";
import {
  getAllProjectsAPI,
  addProjectAPI,
  editProjectAPI,
  deleteProjectAPI,
  getAllClientsAPI,
  getAllWorksAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [worksList, setWorksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    project_name: "",
    short_description: "",
    project_url: "",
    client_id: "",
    work_id: "",
    project_image: "",
  });

  // ✅ Fetch Data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProjects(), fetchClients(), fetchWorks()]);
    } catch {
      errorNotification("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const fetchProjects = async () => {
    const res = await getAllProjectsAPI();
    if (res?.success) setProjects(res.data);
    else errorNotification(res?.message || "Failed to fetch projects");
  };

  const fetchClients = async () => {
    const res = await getAllClientsAPI();
    if (res?.success) setClients(res.data);
  };

  const fetchWorks = async () => {
    const res = await getAllWorksAPI();
    if (res?.success) setWorksList(res.data);
  };

  const clientsById = useMemo(() => {
    return new Map(clients.map((client) => [client._id, client]));
  }, [clients]);

  const getLinkedId = (value) => value?._id || value || "";

  const getProjectClient = (project) => {
    if (project.client_id && typeof project.client_id === "object") return project.client_id;
    return clientsById.get(getLinkedId(project.client_id)) || null;
  };

  const getProjectWork = (project) => {
    if (project.work_id && typeof project.work_id === "object") return project.work_id;
    return worksList.find((work) => work._id === getLinkedId(project.work_id)) || null;
  };

  // ✅ Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Upload Project Image
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
        setForm((prev) => ({ ...prev, project_image: uploaded }));
        successNotification("Image uploaded successfully!");
      } else {
        errorNotification("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      errorNotification("Image upload failed!");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ✅ Delete uploaded image
  const handleImageDelete = async () => {
    if (!form.project_image) return;
    try {
      const res = await deleteImageAPI({ urls: [form.project_image] });
      if (res?.success) {
        successNotification("Image deleted successfully");
        setForm((prev) => ({ ...prev, project_image: "" }));
      } else errorNotification("Failed to delete image");
    } catch (err) {
      console.error(err);
      errorNotification("Delete failed");
    }
  };

  // ✅ Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.project_name?.trim() ||
      !form.short_description?.trim() ||
      !form.project_url?.trim() ||
      !form.client_id ||
      !form.work_id ||
      !form.project_image
    ) {
      return errorNotification("All fields are required!");
    }

    const payload = { ...form };

    setLoading(true);
    try {
      const res = editingId
        ? await editProjectAPI(editingId, payload)
        : await addProjectAPI(payload);

      if (res?.success) {
        successNotification(
          editingId
            ? "Project updated successfully!"
            : "Project added successfully!"
        );
        resetForm();
        fetchProjects();
      } else errorNotification(res?.message || "Operation failed");
    } catch {
      errorNotification("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit
  const handleEdit = (project) => {
    setForm({
      project_name: project.project_name,
      short_description: project.short_description,
      project_url: project.project_url,
      client_id: getLinkedId(project.client_id),
      work_id: getLinkedId(project.work_id),
      project_image: project.project_image || "",
    });
    setEditingId(project._id);
    setShowModal(true);
  };

  // ✅ Delete
  const handleDelete = async (id, imgUrl) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    setLoading(true);
    try {
      const res = await deleteProjectAPI(id);
      if (res?.success) {
        if (imgUrl) {
          try {
            await deleteImageAPI({ urls: [imgUrl] });
          } catch (err) {
            console.error("Image deletion failed:", err);
          }
        }
        successNotification("Project deleted successfully!");
        fetchProjects();
      } else errorNotification(res?.message || "Failed to delete project");
    } catch {
      errorNotification("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset
  const resetForm = () => {
    setForm({
      project_name: "",
      short_description: "",
      project_url: "",
      client_id: "",
      work_id: "",
      project_image: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Calculate statistics
  const stats = {
    total: projects.length,
    withClients: projects.filter(p => p.client_id).length,
    withWorks: projects.filter(p => p.work_id).length,
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Projects Management
          </h1>
          <p className="text-gray-400 mt-1">Manage your portfolio projects and showcase your work</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 px-4 py-2 rounded-lg text-gray-300 transition-all backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Motion.button>
          
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-fuchsia-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Project
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
            <FolderOpen className="w-8 h-8 text-fuchsia-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total Projects</p>
        </Motion.div>
        
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.withClients}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">With Clients</p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <Briefcase className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.withWorks}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">With Works</p>
        </Motion.div>
      </div>

      {/* Projects Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden"
      >
        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-400">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 flex flex-col items-center gap-3">
              <FolderOpen className="w-16 h-16 opacity-50" />
              <p className="text-lg">No projects found</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
              >
                Create your first project
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/60 border-b border-zinc-700">
                <tr>
                  <th className="p-4 text-left text-gray-300 font-semibold">Project</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">Client & Work</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">Description</th>
                  <th className="p-4 text-left text-gray-300 font-semibold">URL</th>
                  <th className="p-4 text-right text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const client = getProjectClient(project);
                  const work = getProjectWork(project);
                  const company = client?.companies?.[0];
                  const clientEmail = client?.client_emails?.[0];
                  const clientPhone = client?.client_phones?.[0];

                  return (
                    <Motion.tr
                      key={project._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative"
                        >
                          <img
                            src={project.project_image}
                            alt={project.project_name}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer border border-zinc-700"
                            onClick={() => setPreviewImage(project.project_image)}
                          />
                        </Motion.div>
                        <div className="font-semibold text-white">{project.project_name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-blue-400" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-200">
                              {client?.client_name || "Client not linked"}
                            </div>
                            {company?.name && (
                              <div className="text-xs text-gray-500">{company.name}</div>
                            )}
                            {(clientEmail || clientPhone) && (
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                                {clientEmail && <span>{clientEmail}</span>}
                                {clientPhone && <span>{clientPhone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-gray-300">
                            {work?.title || "Work not linked"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {project.short_description}
                      </p>
                    </td>
                    <td className="p-4">
                      <Motion.a
                        whileHover={{ scale: 1.05 }}
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Visit</span>
                      </Motion.a>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(project)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Motion.button>
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(project._id, project.project_image)}
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={resetForm}
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
                    {editingId ? "Edit Project" : "Create New Project"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                      placeholder="Enter project name"
                    />
                  </div>

                  {/* Project Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Project Image
                    </label>

                    {/* Image Preview */}
                    {form.project_image ? (
                      <div className="flex items-center gap-4 mb-4">
                        <Motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <img
                            src={form.project_image}
                            alt="Uploaded"
                            className="w-32 h-20 rounded-lg object-cover cursor-pointer border border-zinc-700"
                            onClick={() => setPreviewImage(form.project_image)}
                          />
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={handleImageDelete}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Motion.button>
                        </Motion.div>
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
                      Recommended: 16:9 aspect ratio, max 5MB (JPEG, PNG, WebP)
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="short_description"
                      value={form.short_description}
                      onChange={handleChange}
                      rows={3}
                      required
                      maxLength={500}
                      placeholder="Describe the project..."
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none"
                    />
                    <div className="text-right text-gray-500 text-xs mt-1">
                      {form.short_description.length}/500
                    </div>
                  </div>

                  {/* Project URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project URL
                    </label>
                    <input
                      type="url"
                      name="project_url"
                      value={form.project_url}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Client
                      </label>
                      <select
                        name="client_id"
                        value={form.client_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Client</option>
                        {clients.map((client) => (
                          <option key={client._id} value={client._id}>
                            {client.client_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Work */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Work Category
                      </label>
                      <select
                        name="work_id"
                        value={form.work_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                        required
                      >
                        <option value="">Select Work</option>
                        {worksList.map((work) => (
                          <option key={work._id} value={work._id}>
                            {work.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetForm}
                      className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </Motion.button>
                    <Motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={loading || !form.project_image}
                      className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-fuchsia-500/25"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          {editingId ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        editingId ? "Update Project" : "Create Project"
                      )}
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

export default Projects;
