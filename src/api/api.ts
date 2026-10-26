// utils/api.js
import axios from "axios";
import { errorNotification } from "../helpers/notifi_helper";

// ------------------------------
// 🌍 Environment Variables
// ------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPLOAD_BASE_URL = import.meta.env.VITE_API_UPLOAD_BASE_URL;
export const CLIENT_URL = import.meta.env.VITE_API_CUSTOMER_BASE_URL;

// ===================================================
// 🔹 Base Axios Configuration
// ===================================================
const axiosConfig = {
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ sends and receives cookies automatically
};

// ===================================================
// 🔹 Public APIs (No Auth Required)
// ===================================================
export const loginUser = async (formData) => {
  try {
    // 🧠 Backend should set HttpOnly cookie here
    const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
      ...axiosConfig,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ===================================================
// 🔹 Authenticated Axios Instance
// ===================================================
export const custom_request = axios.create(axiosConfig);

// 🧠 No manual Bearer token needed — cookies are auto-sent
custom_request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 🧩 Response Interceptor — Handle expired or unauthorized sessions
custom_request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("⚠️ Session expired — logging out user...");
      errorNotification("Your session expired. Please sign in again.");
      window.location.href = "/"; // redirect to login
    } else if (!error?.response) {
      errorNotification("Unable to reach the server. Check your connection and try again.");
    } else if (status >= 500) {
      errorNotification(error, "The server could not complete the request.");
    }

    handleApiError(error);
    return Promise.reject(error);
  }
);

// ===================================================
// 🔹 Authenticated Endpoints (Protected)
// ===================================================

// ✅ Check if user still logged in (cookie-based)
export const checkLoginStatus = async () => {
  try {
    const { data } = await custom_request.get("/auth/check_login");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Change Password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const { data } = await custom_request.post("/auth/change_password", {
      oldPassword,
      newPassword,
    });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// forgotPasswordAPI
export const forgotPasswordAPI = async (email) => {
  try {
    const { data } = await custom_request.post("/auth/forgot_password", { email });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
}

// resetPasswordAPI
export const resetPasswordAPI = async ({ token, newPassword }) => {
  try {
    const { data } = await custom_request.post("/auth/reset_password", { token, newPassword });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
}

// verifyResetTokenAPI
export const verifyResetTokenAPI = async (token) => {
  try {
    const { data } = await custom_request.post("/auth/verifyresettoken", { token });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
}

// ✅ Logout (clears HttpOnly cookie from server)
export const logout = async () => {
  try {
    const { data } = await custom_request.post("/auth/logout");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Add new admin
export const addAdminAPI = async (adminData) => {
  try {
    const { data } = await custom_request.post("/admin/add_admin", adminData);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Get admin by ID
export const getAdminAPI = async (id) => {
  try {
    const { data } = await custom_request.get(`/admin/get_admin/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const getAllAdminsAPI = async () => {
  try {
    const { data } = await custom_request.get("/admin/get_all_admins");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Update admin
export const updateAdminAPI = async (id, adminData) => {
  try {
    const { data } = await custom_request.put(`/admin/update_admin/${id}`, adminData);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Delete admin
export const deleteAdminAPI = async (id) => {
  try {
    const { data } = await custom_request.delete(`/admin/delete_admin/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};


// 🧩 src/api/api.js

// ✅ Upload Images
export const uploadImageAPI = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const { data } = await custom_request.post("/img/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;

  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Delete Images
export const deleteImageAPI = async (body) => {
  try {
    const { data } = await custom_request.delete("/img/delete", { data: body });
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// DashboardStats
export const DashboardStats = async () => {
  try {
    const { data } = await custom_request.get("/dash/all");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};


// 🧠 BLOGS API

// ✅ Add Blog
export const addBlogAPI = async (formData) => {
  try {
    const { data } = await custom_request.post("/blogs/add", formData);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Get All Blogs
export const getBlogsAPI = async () => {
  try {
    const { data } = await custom_request.get("/blogs/all");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Edit Blog
export const editBlogAPI = async (id, formData) => {
  try {
    const { data } = await custom_request.put(`/blogs/edit/${id}`, formData);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Delete Blog
export const deleteBlogAPI = async (id) => {
  try {
    const { data } = await custom_request.delete(`/blogs/delete/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};


// ==================================================
// 🖼️ BANNER API FUNCTIONS
// ==================================================

// ➕ Add new banner
export const addBannerAPI = async (data) => {
  try {
    const res = await custom_request.post("/banner/add", data);
    return res.data;
  } catch (err) {
    console.error("Add banner failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📜 Get all banners
export const getBannersAPI = async () => {
  try {
    const res = await custom_request.get("/banner/get");
    return res.data;
  } catch (err) {
    console.error("Get banners failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🔍 Get banner by ID
export const getBannerByIdAPI = async (id) => {
  try {
    const res = await custom_request.get(`/banner/get/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get banner by ID failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ✏️ Edit banner
export const editBannerAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/banner/edit/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit banner failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🗑️ Delete banner
export const deleteBannerAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/banner/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete banner failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Add Enquiry (public — no token needed)
export const addEnquiryAPI = async (data) => {
  try {
    const res = await custom_request.post(`/enquiry/add`, data);
    return res.data;
  } catch (err) {
    console.error("Add enquiry failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📜 Get All Enquiries (Admin — token required)
export const getAllEnquiriesAPI = async () => {
  try {
    const res = await custom_request.get(`/enquiry/getall`);
    return res.data;
  } catch (err) {
    console.error("Get all enquiries failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🔍 Get Enquiry By ID
export const getEnquiryByIdAPI = async (id) => {
  try {
    const res = await custom_request.get(`/enquiry/get/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get enquiry by ID failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ✏️ Edit Enquiry
export const editEnquiryAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/enquiry/edit/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit enquiry failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🗑️ Delete Enquiry
export const deleteEnquiryAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/enquiry/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete enquiry failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ================================
// 📦 REVIEW API CALLS
// ================================

// ➕ Add Review (Public or Auth, based on your backend)
export const addReviewAPI = async (data) => {
  try {
    const res = await custom_request.post("/review/add", data);
    return res.data;
  } catch (err) {
    console.error("Add review failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📜 Get All Reviews
export const getAllReviewsAPI = async () => {
  try {
    const res = await custom_request.get("/review/all");
    return res.data;
  } catch (err) {
    console.error("Get all reviews failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ✏️ Edit Review (Requires Auth)
export const editReviewAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/review/edit/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit review failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ❌ Delete Review (Requires Auth)
export const deleteReviewAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/review/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete review failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📨 Add new subscriber (Public)
export const addSubscriberAPI = async (data) => {
  try {
    const res = await custom_request.post("/news/add", data);
    return res.data;
  } catch (err) {
    console.error("Add subscriber failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📰 Get all subscribers
export const getAllSubscribersAPI = async () => {
  try {
    const res = await custom_request.get("/news/get");
    return res.data;
  } catch (err) {
    console.error("Get all subscribers failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🗑️ Delete subscribers (bulk delete)
export const deleteSubscribersAPI = async (ids) => {
  try {
    const res = await custom_request.delete("/news/delete", {
      data: { ids }, // send ids array in body
    });
    return res.data;
  } catch (err) {
    console.error("Delete subscribers failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};


// 🧩 Add a new client
export const addClientAPI = async (data) => {
  try {
    const res = await custom_request.post("/clients/add_client", data);
    return res.data;
  } catch (err) {
    console.error("Add client failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 📋 Get all clients
export const getAllClientsAPI = async () => {
  try {
    const res = await custom_request.get("/clients/get_all_clients");
    return res.data;
  } catch (err) {
    console.error("Get all clients failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🔍 Get client by ID
export const getClientByIdAPI = async (id) => {
  try {
    const res = await custom_request.get(`/clients/get_client/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get client by ID failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ✏️ Edit client
export const editClientAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/clients/edit_client/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit client failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🗑️ Delete client
export const deleteClientAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/clients/delete_client/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete client failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 ADD PROJECT
export const addProjectAPI = async (data) => {
  try {
    const res = await custom_request.post("/project/add", data);
    return res.data;
  } catch (err) {
    console.error("Add project failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 GET ALL PROJECTS
export const getAllProjectsAPI = async () => {
  try {
    const res = await custom_request.get("/project/all");
    return res.data;
  } catch (err) {
    console.error("Get all projects failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 GET PROJECT BY ID
export const getProjectByIdAPI = async (id) => {
  try {
    const res = await custom_request.get(`/project/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get project by ID failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 EDIT PROJECT
export const editProjectAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/project/edit/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit project failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 DELETE PROJECT
export const deleteProjectAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/project/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete project failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Add Work
export const addWorkAPI = async (data) => {
  try {
    const res = await custom_request.post("/work/add", data);
    return res.data;
  } catch (err) {
    console.error("Add work failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Get All Works (Public)
export const getAllWorksAPI = async () => {
  try {
    const res = await custom_request.get("/work/get");
    return res.data;
  } catch (err) {
    console.error("Get all works failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Get Work by ID (Admin)
export const getWorkByIdAPI = async (id) => {
  try {
    const res = await custom_request.get(`/work/get/${id}`);
    return res.data;
  } catch (err) {
    console.error("Get work by id failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Edit Work
export const editWorkAPI = async (id, data) => {
  try {
    const res = await custom_request.put(`/work/edit/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Edit work failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// 🟢 Delete Work
export const deleteWorkAPI = async (id) => {
  try {
    const res = await custom_request.delete(`/work/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Delete work failed:", err);
    return err.response?.data || { success: false, message: "Server error" };
  }
};

// ✅ Add new voucher
export const addVoucherAPI = async (voucherData) => {
  try {
    const { data } = await custom_request.post("/voucher/add", voucherData);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Get all vouchers
export const getAllVouchersAPI = async () => {
  try {
    const { data } = await custom_request.get("/voucher/all");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Get voucher by ID
export const getVoucherByIdAPI = async (id) => {
  try {
    const { data } = await custom_request.get(`/voucher/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Delete voucher
export const deleteVoucherAPI = async (id) => {
  try {
    const { data } = await custom_request.delete(`/voucher/delete/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ✅ Invoice APIs
export const addInvoiceAPI = async (invoiceData) => {
  try {
    const { data } = await custom_request.post("/invoice/add", invoiceData);
    return data;
  } catch (error) {
    handleApiError(error);
    return error.response?.data || null;
  }
};

export const getAllInvoicesAPI = async () => {
  try {
    const { data } = await custom_request.get("/invoice/all");
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const getInvoiceByIdAPI = async (id) => {
  try {
    const { data } = await custom_request.get(`/invoice/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const updateInvoiceAPI = async (id, invoiceData) => {
  try {
    const { data } = await custom_request.put(`/invoice/edit/${id}`, invoiceData);
    return data;
  } catch (error) {
    handleApiError(error);
    return error.response?.data || null;
  }
};

export const generateInvoiceBillAPI = async (id) => {
  try {
    const { data } = await custom_request.patch(`/invoice/generate-bill/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const sendInvoiceEmailAPI = async (id) => {
  try {
    const { data } = await custom_request.post(`/invoice/send-email/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return error.response?.data || null;
  }
};

export const markInvoiceWhatsappSentAPI = async (id) => {
  try {
    const { data } = await custom_request.patch(`/invoice/send-whatsapp/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteInvoiceAPI = async (id) => {
  try {
    const { data } = await custom_request.delete(`/invoice/delete/${id}`);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

// ===================================================
// 🔹 Utility
// ===================================================
export const searchData = (value) => (value ? value : null);

function handleApiError(error) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "An unexpected error occurred";

  console.error("⚠️ API Error:", message);
}

export { BASE_URL, UPLOAD_BASE_URL };
