import React, { useEffect, useMemo, useState } from "react";
import {
  getAllWorksAPI,
  getAllClientsAPI,
  addWorkAPI,
  editWorkAPI,
  deleteWorkAPI,
  addProjectAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Work = () => {
  const [works, setWorks] = useState([]);
  const [clients, setClients] = useState([]);
  const [movedWorkIds, setMovedWorkIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mecatronix_finished_work_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [form, setForm] = useState({
    title: "",
    client_id: "",
    project_url: "",
    status: "started",
    info: [{ heading: "", details: "", img: "" }],
  });

  // 🟢 Fetch all works
  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await getAllWorksAPI();
      if (res?.success) setWorks(res.data || []);
      else errorNotification("Failed to fetch works");
    } catch {
      errorNotification("Error fetching works");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await getAllClientsAPI();
      if (res?.success) setClients(res.data || []);
    } catch {
      errorNotification("Error fetching clients");
    }
  };

  useEffect(() => {
    fetchWorks();
    fetchClients();
  }, []);

  const activeWorks = works.filter((work) => work.status !== "finished" && !movedWorkIds.includes(work._id));

  const clientsById = useMemo(() => {
    return new Map(clients.map((client) => [client._id, client]));
  }, [clients]);

  const getClientId = (value) => value?._id || value?.id || value || "";

  const getWorkClient = (work) => {
    if (work.client_id && typeof work.client_id === "object") return work.client_id;
    return clientsById.get(getClientId(work.client_id)) || null;
  };

  const getProjectImage = (work) => work.info?.find((section) => section.img)?.img || "";

  const getProjectDescription = (work) => {
    const details = work.info?.map((section) => section.details).filter(Boolean).join("\n\n");
    return details || work.info?.map((section) => section.heading).filter(Boolean).join(", ") || work.title;
  };

  const persistMovedWork = (id) => {
    setMovedWorkIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem("mecatronix_finished_work_ids", JSON.stringify(next));
      return next;
    });
  };

  // 🟢 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, index?: number, field?: string) => {
    if (field) {
      const updatedInfo = [...form.info];
      updatedInfo[index][field] = e.target.value;
      setForm({ ...form, info: updatedInfo });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // 🖼️ Upload image per section
  const handleUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorNotification("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errorNotification("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("images", file);

    try {
      setUploading(true);
      setUploadingIndex(index);
      const res = await uploadImageAPI(formData);
      if (res?.success && res.files?.length) {
        const updatedInfo = [...form.info];
        updatedInfo[index].img = res.files[0].url;
        setForm({ ...form, info: updatedInfo });
        successNotification("✅ Image uploaded successfully!");
      } else {
        errorNotification("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      errorNotification("Image upload failed!");
    } finally {
      setUploading(false);
      setUploadingIndex(null);
    }
  };

  // 🗑️ Delete image
  const handleImageDelete = async (index) => {
    const imageUrl = form.info[index].img;
    if (!imageUrl) return;

    try {
      const res = await deleteImageAPI({ urls: [imageUrl] });
      if (res?.success) {
        const updatedInfo = [...form.info];
        updatedInfo[index].img = "";
        setForm({ ...form, info: updatedInfo });
        successNotification("🗑️ Image deleted successfully");
      } else errorNotification("Failed to delete image");
    } catch (err) {
      console.error(err);
      errorNotification("Delete failed");
    }
  };

  // ➕ Add another info block
  const addInfoBlock = () => {
    setForm({
      ...form,
      info: [...form.info, { heading: "", details: "", img: "" }],
    });
  };

  // 🗑️ Remove info block
  const removeInfoBlock = (index) => {
    if (form.info.length <= 1) {
      errorNotification("At least one info section is required");
      return;
    }
    const updatedInfo = form.info.filter((_, i) => i !== index);
    setForm({ ...form, info: updatedInfo });
  };

  // 🧹 Reset form
  const resetForm = () => {
    setForm({
      title: "",
      client_id: "",
      project_url: "",
      status: "started",
      info: [{ heading: "", details: "", img: "" }],
    });
    setEditingId(null);
    setShowModal(false);
  };

  // 🟢 Submit (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (editingId) res = await editWorkAPI(editingId, form);
      else res = await addWorkAPI(form);

      if (res?.success) {
        successNotification(
          editingId ? "Work updated successfully!" : "Work added successfully!"
        );
        resetForm();
        fetchWorks();
      } else {
        errorNotification(res?.message || "Operation failed");
      }
    } catch {
      errorNotification("Error saving work");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete Work
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work?")) return;
    setLoading(true);
    try {
      const res = await deleteWorkAPI(id);
      if (res?.success) {
        successNotification("Work deleted successfully");
        fetchWorks();
      } else errorNotification(res?.message || "Failed to delete work");
    } catch {
      errorNotification("Error deleting work");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Work
  const handleEdit = (work) => {
    setForm({
      title: work.title,
      client_id: getClientId(work.client_id),
      project_url: work.project_url || "",
      status: work.status || "started",
      info: work.info.length > 0 ? work.info : [{ heading: "", details: "", img: "" }]
    });
    setEditingId(work._id);
    setShowModal(true);
  };

  const handleFinish = async (work) => {
    const clientId = getClientId(work.client_id);
    const projectUrl = work.project_url || "";
    const projectImage = getProjectImage(work);

    if (!clientId || !projectUrl || !projectImage) {
      setForm({
        title: work.title,
        client_id: clientId,
        project_url: projectUrl,
        status: work.status || "started",
        info: work.info?.length ? work.info : [{ heading: "", details: "", img: "" }],
      });
      setEditingId(work._id);
      setShowModal(true);
      return errorNotification("Add client, project URL, and at least one image before finishing.");
    }

    if (!window.confirm("Finish this work and move it to Projects?")) return;

    setLoading(true);
    try {
      const projectRes = await addProjectAPI({
        project_name: work.title,
        short_description: getProjectDescription(work).slice(0, 500),
        project_url: projectUrl,
        client_id: clientId,
        work_id: work._id,
        project_image: projectImage,
      });

      if (!projectRes?.success) {
        return errorNotification(projectRes?.message || "Failed to create project");
      }

      await editWorkAPI(work._id, {
        title: work.title,
        client_id: clientId,
        project_url: projectUrl,
        status: "finished",
        finished_at: new Date().toISOString(),
        info: work.info?.length ? work.info : [{ heading: "", details: "", img: "" }],
      });

      persistMovedWork(work._id);
      successNotification("Project finished and moved to Projects!");
      fetchWorks();
    } catch {
      errorNotification("Failed to finish project");
    } finally {
      setLoading(false);
    }
  };

  // Custom File Input Component
  const FileUploadButton = ({ onUpload, uploading }) => (
    <label className={`relative cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-dashed transition-all duration-300 ${uploading
        ? 'border-blue-400 bg-blue-500/10 text-blue-400'
        : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400'
      }`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span>{uploading ? "Uploading..." : "Upload Image"}</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={uploading}
      />
    </label>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 text-white shadow-2xl">
      {/* 🔹 Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Project Work Tracker
          </h2>
          <p className="text-gray-400 mt-1">Track started projects. Finish them to move into Projects.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Start Project</span>
        </button>
      </div>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{works.length}</div>
          <div className="text-gray-400 text-sm">Total Tracked</div>
        </div>
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {activeWorks.length}
          </div>
          <div className="text-gray-400 text-sm">In Progress</div>
        </div>
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {works.length - activeWorks.length}
          </div>
          <div className="text-gray-400 text-sm">Moved to Projects</div>
        </div>
      </div>

      {/* 📋 Works Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-lg">Loading works...</p>
          </div>
        </div>
      ) : activeWorks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No active projects</h3>
          <p className="text-gray-500">Start a project here, then finish it when it is ready for the Projects page.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeWorks.map((work) => {
            const client = getWorkClient(work);
            const company = client?.companies?.[0];
            const clientEmail = client?.client_emails?.[0];
            const clientPhone = client?.client_phones?.[0];

            return (
              <div
                key={work._id}
                className="group p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
              >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {work.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{work.info?.length || 0} sections</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{work.info?.filter(section => section.img).length} images</span>
                    </span>
                    {work.client_id && <span className={client ? "text-blue-300" : "text-yellow-300"}>Client: {client?.client_name || "Client not linked"}</span>}
                    {work.project_url && <span className="text-green-400">URL ready</span>}
                  </div>
                  {client && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                      {company?.name && (
                        <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1">
                          Company: <span className="text-gray-200">{company.name}</span>
                        </span>
                      )}
                      {clientEmail && (
                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-purple-200">
                          {clientEmail}
                        </span>
                      )}
                      {clientPhone && (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-200">
                          {clientPhone}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleFinish(work)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Finish</span>
                  </button>
                  <button
                    onClick={() => handleEdit(work)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(work._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Preview of first section */}
              {work.info?.[0] && (
                <div className="mt-4 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                  <h4 className="font-medium text-gray-300 mb-2">{work.info[0].heading}</h4>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {work.info[0].details}
                  </p>
                  {work.info[0].img && (
                    <div className="mt-3">
                      <img
                        src={work.info[0].img}
                        alt="Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-zinc-600"
                      />
                    </div>
                  )}
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}

      {/* 🟢 Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/70 z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 text-white p-6 rounded-2xl w-full max-w-4xl relative overflow-y-auto max-h-[90vh] shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingId ? "Edit Project Work" : "Start New Project"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Work Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter project title..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                  <select
                    name="client_id"
                    value={form.client_id}
                    onChange={handleChange}
                    className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>{client.client_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project URL</label>
                  <input
                    type="url"
                    name="project_url"
                    value={form.project_url}
                    onChange={handleChange}
                    className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="started">Started</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* Info Sections */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-300">Work Sections</label>
                  <span className="text-sm text-gray-400">{form.info.length} section(s)</span>
                </div>

                <div className="space-y-4">
                  {form.info.map((info, index) => (
                    <div
                      key={index}
                      className="border border-zinc-700/50 rounded-2xl p-6 bg-zinc-800/30 transition-all duration-300 hover:border-zinc-600/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-300">Section {index + 1}</h4>
                        {form.info.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInfoBlock(index)}
                            className="flex items-center space-x-1 px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Section heading..."
                          value={info.heading}
                          onChange={(e) => handleChange(e, index, "heading")}
                          className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                        <textarea
                          placeholder="Section details..."
                          value={info.details}
                          onChange={(e) => handleChange(e, index, "details")}
                          className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical min-h-[100px]"
                          rows={3}
                          required
                        />

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Section Image</label>
                          {info.img ? (
                            <div className="flex items-start space-x-4">
                              <img
                                src={info.img}
                                alt="Section preview"
                                className="w-32 h-32 rounded-xl object-cover border border-zinc-600 shadow-lg"
                              />
                              <div className="flex-1 space-y-2">
                                <button
                                  type="button"
                                  onClick={() => handleImageDelete(index)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200 text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Delete Image</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <FileUploadButton
                              onUpload={(e) => handleUpload(e, index)}
                              uploading={uploading && uploadingIndex === index}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addInfoBlock}
                  className="flex items-center space-x-2 px-4 py-3 w-full border-2 border-dashed border-zinc-600 hover:border-blue-500 hover:bg-blue-500/10 rounded-2xl text-gray-400 hover:text-blue-400 transition-all duration-300 mt-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Another Section</span>
                </button>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-700/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{editingId ? "Update Work" : "Start Work"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Work;
