import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Users,
  Building,
  Mail,
  Phone,
  X,
  UserPlus,
  Globe,
  ImageIcon,
  Link as LinkIcon,
  Search,
  BriefcaseBusiness,
} from "lucide-react";
import {
  getAllClientsAPI,
  addClientAPI,
  editClientAPI,
  deleteClientAPI,
  uploadImageAPI,
  deleteImageAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const emptyCompany = () => ({ name: "", img: "", url: "", year: "", industry: "" });

const emptyForm = () => ({
  client_name: "",
  companies: [emptyCompany()],
  client_emails: [""],
  client_phones: [""],
});

const compact = (items = []) => items.filter((item) => String(item || "").trim() !== "");

const getCompanyList = (client) => Array.isArray(client?.companies) ? client.companies : [];
const getEmailList = (client) => Array.isArray(client?.client_emails) ? client.client_emails : [];
const getPhoneList = (client) => Array.isArray(client?.client_phones) ? client.client_phones : [];

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClientsAPI();
      if (res?.success) setClients(res.data || []);
      else errorNotification(res?.message || "Failed to fetch clients");
    } catch {
      errorNotification("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const stats = useMemo(() => {
    const companies = clients.reduce((sum, client) => sum + getCompanyList(client).length, 0);
    const emails = clients.reduce((sum, client) => sum + compact(getEmailList(client)).length, 0);
    const phones = clients.reduce((sum, client) => sum + compact(getPhoneList(client)).length, 0);
    return { clients: clients.length, companies, emails, phones };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) => {
      const haystack = [
        client.client_name,
        ...getCompanyList(client).flatMap((company) => [
          company.name,
          company.industry,
          company.year,
          company.url,
        ]),
        ...getEmailList(client),
        ...getPhoneList(client),
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }, [clients, searchTerm]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompanyChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      companies: prev.companies.map((company, companyIndex) =>
        companyIndex === index ? { ...company, [field]: value } : company
      ),
    }));
  };

  const handleArrayChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => itemIndex === index ? value : item),
    }));
  };

  const addField = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], field === "companies" ? emptyCompany() : ""],
    }));
  };

  const removeField = (field, index) => {
    setForm((prev) => {
      if (prev[field].length <= 1) return prev;
      return { ...prev, [field]: prev[field].filter((_, itemIndex) => itemIndex !== index) };
    });
  };

  const handleLogoUpload = async (e, index) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    if (!files[0].type.startsWith("image/")) {
      e.target.value = "";
      return errorNotification("Please select an image file");
    }

    if (files[0].size > 5 * 1024 * 1024) {
      e.target.value = "";
      return errorNotification("Logo size should be less than 5MB");
    }

    try {
      setUploadingIndex(index);
      const res = await uploadImageAPI(files);
      if (res?.success && res.files?.[0]?.url) {
        handleCompanyChange(index, "img", res.files[0].url);
        successNotification("Logo uploaded");
      } else {
        errorNotification(res?.message || "Upload failed");
      }
    } catch {
      errorNotification("Upload failed");
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  const handleLogoDelete = async (url, index) => {
    if (!url) return;
    try {
      const res = await deleteImageAPI({ urls: [url] });
      if (res?.success) {
        handleCompanyChange(index, "img", "");
        successNotification("Logo removed");
      } else {
        errorNotification(res?.message || "Failed to delete logo");
      }
    } catch {
      errorNotification("Failed to delete logo");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setUploadingIndex(null);
    setForm(emptyForm());
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingId(client._id);
    setForm({
      client_name: client.client_name || "",
      companies: getCompanyList(client).length
        ? getCompanyList(client).map((company) => ({
          name: company.name || "",
          img: company.img || "",
          url: company.url || "",
          year: company.year || "",
          industry: company.industry || "",
        }))
        : [emptyCompany()],
      client_emails: getEmailList(client).length ? getEmailList(client) : [""],
      client_phones: getPhoneList(client).length ? getPhoneList(client) : [""],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      client_name: form.client_name.trim(),
      companies: form.companies
        .map((company) => ({
          ...company,
          name: company.name.trim(),
          url: company.url.trim(),
          year: String(company.year || "").trim(),
          industry: company.industry.trim(),
        }))
        .filter((company) => company.name),
      client_emails: compact(form.client_emails),
      client_phones: compact(form.client_phones),
    };

    if (!payload.client_name) return errorNotification("Client name is required");
    if (!payload.companies.length) return errorNotification("At least one company is required");

    setLoading(true);
    try {
      const res = editingId
        ? await editClientAPI(editingId, payload)
        : await addClientAPI(payload);

      if (res?.success) {
        successNotification(editingId ? "Client updated" : "Client created");
        closeModal();
        fetchClients();
      } else {
        errorNotification(res?.message || "Operation failed");
      }
    } catch {
      errorNotification("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Delete ${client.client_name || "this client"}?`)) return;
    setLoading(true);
    try {
      const res = await deleteClientAPI(client._id);
      if (res?.success) {
        successNotification("Client deleted");
        fetchClients();
      } else {
        errorNotification(res?.message || "Delete failed");
      }
    } catch {
      errorNotification("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              <Users className="h-3.5 w-3.5" />
              Client Directory
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Clients Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Manage client contacts, companies, logos, portfolio links, industry, and onboarding year in one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchClients}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              <UserPlus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Clients", value: stats.clients, icon: Users, color: "text-emerald-300" },
          { label: "Companies", value: stats.companies, icon: Building, color: "text-sky-300" },
          { label: "Emails", value: stats.emails, icon: Mail, color: "text-violet-300" },
          { label: "Phones", value: stats.phones, icon: Phone, color: "text-lime-300" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <div className="text-2xl font-black text-white">{item.value}</div>
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-white">Client List</div>
            <div className="text-xs text-zinc-500">
              Showing {filteredClients.length} of {clients.length} client{clients.length === 1 ? "" : "s"}
            </div>
          </div>
          <label className="relative w-full md:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search client, company, contact..."
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
            />
          </label>
        </div>

        {loading && !clients.length ? (
          <div className="flex min-h-[280px] items-center justify-center text-zinc-400">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-300" />
              <div className="mt-3 text-sm">Loading clients...</div>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <Users className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-200">No clients found</h3>
              <p className="mt-1 text-sm text-zinc-500">
                {searchTerm ? "Try a different search term." : "Add your first client to start building the directory."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredClients.map((client) => {
              const companies = getCompanyList(client);
              const emails = compact(getEmailList(client));
              const phones = compact(getPhoneList(client));
              const primaryCompany = companies[0] || {};

              return (
                <article key={client._id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-emerald-500/30 hover:bg-zinc-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                        {primaryCompany.img ? (
                          <img src={primaryCompany.img} alt={primaryCompany.name || client.client_name} className="h-full w-full object-cover" />
                        ) : (
                          <Building className="h-7 w-7 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black text-white">{client.client_name || "Unnamed Client"}</h2>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1">
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-sky-300" />
                            {companies.length} compan{companies.length === 1 ? "y" : "ies"}
                          </span>
                          {primaryCompany.industry && (
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{primaryCompany.industry}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(client)}
                        className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300 transition hover:bg-blue-500/20"
                        title="Edit client"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Companies</div>
                      <div className="space-y-2">
                        {companies.slice(0, 3).map((company, index) => (
                          <div key={`${company.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-900 px-3 py-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-zinc-200">{company.name || "Company"}</div>
                              <div className="text-xs text-zinc-500">{company.industry || "General"}{company.year ? ` / ${company.year}` : ""}</div>
                            </div>
                            {company.url && (
                              <a href={company.url} target="_blank" rel="noreferrer" className="shrink-0 text-zinc-500 transition hover:text-emerald-300" title="Open website">
                                <LinkIcon className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                        {companies.length > 3 && <div className="text-xs text-zinc-500">+{companies.length - 3} more compan{companies.length - 3 === 1 ? "y" : "ies"}</div>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contacts</div>
                      <div className="space-y-2 text-sm text-zinc-300">
                        {emails[0] ? (
                          <a href={`mailto:${emails[0]}`} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 transition hover:text-emerald-300">
                            <Mail className="h-4 w-4 text-violet-300" />
                            <span className="truncate">{emails[0]}</span>
                          </a>
                        ) : (
                          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-600">No email added</div>
                        )}
                        {phones[0] ? (
                          <a href={`tel:${phones[0]}`} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 transition hover:text-emerald-300">
                            <Phone className="h-4 w-4 text-lime-300" />
                            <span>{phones[0]}</span>
                          </a>
                        ) : (
                          <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-600">No phone added</div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
              <div>
                <h2 className="text-xl font-black">{editingId ? "Edit Client" : "Add New Client"}</h2>
                <p className="mt-1 text-xs text-zinc-500">Client identity, company portfolio, and contact channels.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(92vh-73px)] overflow-y-auto p-6">
              <div className="grid gap-6">
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Client Name</label>
                  <input
                    required
                    name="client_name"
                    value={form.client_name}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                  />
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Building className="h-4 w-4 text-sky-300" />
                        Companies
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Add logo, website, industry, and year for each company.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addField("companies")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-500/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Company
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {form.companies.map((company, index) => (
                      <div key={index} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                              {company.img ? (
                                <>
                                  <img src={company.img} alt={company.name || "Company logo"} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleLogoDelete(company.img, index)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 text-red-300 opacity-0 transition hover:opacity-100"
                                    title="Remove logo"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-zinc-500 transition hover:text-emerald-300">
                                  {uploadingIndex === index ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <ImageIcon className="h-5 w-5" />
                                  )}
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, index)} disabled={uploadingIndex !== null} />
                                </label>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-zinc-200">Company {index + 1}</div>
                              <div className="text-xs text-zinc-500">{company.img ? "Logo ready" : "Upload logo"}</div>
                            </div>
                          </div>
                          {form.companies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeField("companies", index)}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                              title="Remove company"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <input
                            value={company.name}
                            onChange={(e) => handleCompanyChange(index, "name", e.target.value)}
                            placeholder="Company name"
                            className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                          />
                          <div className="relative">
                            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <input
                              value={company.url}
                              onChange={(e) => handleCompanyChange(index, "url", e.target.value)}
                              placeholder="https://company.com"
                              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                              value={company.industry}
                              onChange={(e) => handleCompanyChange(index, "industry", e.target.value)}
                              placeholder="Industry"
                              className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                            />
                            <input
                              type="number"
                              value={company.year}
                              onChange={(e) => handleCompanyChange(index, "year", e.target.value)}
                              placeholder="Year"
                              className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-white">
                        <Mail className="h-4 w-4 text-violet-300" />
                        Emails
                      </label>
                      <button type="button" onClick={() => addField("client_emails")} className="text-xs font-bold text-violet-300 transition hover:text-violet-200">+ Add Email</button>
                    </div>
                    <div className="space-y-3">
                      {form.client_emails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleArrayChange(index, "client_emails", e.target.value)}
                            placeholder="client@example.com"
                            className="h-11 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                          />
                          {form.client_emails.length > 1 && (
                            <button type="button" onClick={() => removeField("client_emails", index)} className="rounded-xl border border-zinc-800 px-3 text-zinc-500 transition hover:border-red-500/30 hover:text-red-300">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-white">
                        <Phone className="h-4 w-4 text-lime-300" />
                        Phones
                      </label>
                      <button type="button" onClick={() => addField("client_phones")} className="text-xs font-bold text-lime-300 transition hover:text-lime-200">+ Add Phone</button>
                    </div>
                    <div className="space-y-3">
                      {form.client_phones.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => handleArrayChange(index, "client_phones", e.target.value)}
                            placeholder="+91 9876543210"
                            className="h-11 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-lime-500"
                          />
                          {form.client_phones.length > 1 && (
                            <button type="button" onClick={() => removeField("client_phones", index)} className="rounded-xl border border-zinc-800 px-3 text-zinc-500 transition hover:border-red-500/30 hover:text-red-300">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950/95 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingIndex !== null}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-black text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
