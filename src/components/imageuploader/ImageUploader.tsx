import React, { useState } from "react";
import { uploadImageAPI, deleteImageAPI } from "../../api/api";

const ImageUploader = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🟢 Handle File Upload
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const res = await uploadImageAPI(files);

      if (res?.success && Array.isArray(res.files)) {
        const uploaded = res.files.map((file, i) => ({
          id: Date.now() + i,
          name: file.name,
          type: file.type,
          url: file.url,
        }));

        setFileList((prev) => [...prev, ...uploaded]);
      } else {
        alert(res?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset file input
    }
  };

  // 🔴 Handle Delete
  const handleDelete = async (url) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await deleteImageAPI([url]);
      if (res?.success) {
        setFileList((prev) => prev.filter((f) => f.url !== url));
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        🖼️ Image Uploader
      </h3>

      {/* Upload Input */}
      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition">
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading ? (
          <span className="text-blue-500 font-medium animate-pulse">
            Uploading...
          </span>
        ) : (
          <>
            <span className="text-gray-600 text-sm">
              Click or drop images here to upload
            </span>
            <span className="text-gray-400 text-xs">(Max 5 images)</span>
          </>
        )}
      </label>

      {/* Image Preview Grid */}
      {fileList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="relative bg-white rounded-lg shadow-sm overflow-hidden border"
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-2 text-xs text-gray-600">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-gray-400">{file.type}</p>
              </div>
              <button
                onClick={() => handleDelete(file.url)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {fileList.length > 0 && (
        <button
          onClick={() => setFileList([])}
          className="mt-5 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
