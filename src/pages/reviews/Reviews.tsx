import React, { useEffect, useState } from "react";
import {
  getAllReviewsAPI,
  deleteReviewAPI,
  editReviewAPI,
} from "../../api/api";
import {
  successNotification,
  errorNotification,
} from "../../helpers/notifi_helper";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 🧩 Fetch all reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getAllReviewsAPI();
      if (res?.success) {
        setReviews(res.data);
      } else {
        errorNotification(res?.message || "Failed to load reviews");
      }
    } catch (err) {
      console.error("Fetch Reviews Error:", err);
      errorNotification("Server error while loading reviews");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete a review
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setLoading(true);
    try {
      const res = await deleteReviewAPI(id);
      if (res?.success) {
        successNotification("Review deleted successfully");
        fetchReviews();
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Toggle verify/unverify
  const handleVerifyToggle = async (review) => {
    setLoading(true);
    try {
      const res = await editReviewAPI(review._id, {
        is_verified: !review.is_verified,
      });
      if (res?.success) {
        successNotification(
          review.is_verified ? "Marked as Unverified" : "Marked as Verified"
        );
        fetchReviews();
      } else {
        errorNotification(res?.message);
      }
    } catch {
      errorNotification("Failed to update review status");
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews based on search and status
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "verified" && review.is_verified) ||
      (statusFilter === "unverified" && !review.is_verified);
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-600 fill-current"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-400 ml-1">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          <p className="text-gray-400 mt-1">Manage and moderate customer feedback</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-blue-500/25"
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Refreshing...</span>
            </div>
          ) : (
            "Refresh Reviews"
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reviews by name, email, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{reviews.length}</div>
          <div className="text-gray-400 text-sm">Total Reviews</div>
        </div>
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {reviews.filter(r => r.is_verified).length}
          </div>
          <div className="text-gray-400 text-sm">Verified</div>
        </div>
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {reviews.filter(r => !r.is_verified).length}
          </div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-64 text-gray-400">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-lg">Loading reviews...</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {!loading && (
        <>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No reviews found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No reviews have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="group p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {rev.user_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">
                            {rev.user_name}
                          </h3>
                          <p className="text-sm text-gray-400">{rev.user_email}</p>
                        </div>
                      </div>
                      
                      {rev.company_name && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {rev.company_name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                          rev.is_verified
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {rev.is_verified ? (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Pending</span>
                          </div>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <StarRating rating={rev.rating} />
                    <p className="mt-3 text-gray-300 text-lg leading-relaxed">
                      {rev.comment || (
                        <span className="italic text-gray-500">No comment provided</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t border-zinc-700/50 gap-3">
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {new Date(rev.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleVerifyToggle(rev)}
                        disabled={loading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          rev.is_verified
                            ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {rev.is_verified ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Unverify</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;
