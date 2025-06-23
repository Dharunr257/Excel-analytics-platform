import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { getUser } from "../utils/auth";

const Dashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [file, setFile] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const user = getUser();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [me, setme] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token]);

  useEffect(() => {
    fetchUploads();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setme(res.data); // your useState hook
      } catch (err) {
        console.error("❌ Failed to load user", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await axios.get("/upload/history");
      setUploads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await axios.post("/upload", formData);
      const refreshed = await axios.get("/upload/history");
      setUploads(refreshed.data);
      setFile(null);
      alert("✅ File uploaded!");
    } catch (err) {
      console.error("Upload failed", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`/upload/${id}`);
      setUploads((prev) => prev.filter((file) => file._id !== id));
    } catch (err) {
      console.error("❌ Delete failed", err);
      alert("Failed to delete file.");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await axios.get(`/upload/download/${fileId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "download.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const sortedUploads = [...uploads].sort((a, b) =>
    sortOrder === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="flex flex-wrap justify-center text-3xl font-bold mb-6">
        Welcome, {me?.name || "User"} 👋
      </h1>

      {/* Upload Section */}
      <form
        onSubmit={handleUpload}
        className="flex flex-wrap justify-center items-center gap-4 mb-6"
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input file-input-bordered"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Excel"}
        </button>
      </form>

      {/* Uploaded Files */}
      <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>

      {/* Sort Filter */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="select select-sm select-bordered"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {uploads.length === 0 ? (
        <p className="text-gray-500">No uploads yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedUploads.map((file) => (
            <div
              key={file._id}
              className="border rounded p-4 shadow bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold break-all">
                  {file.fileName}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/analyze/${file._id}`)}
                  className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
                >
                  Analyze
                </button>

                <button
                  onClick={() => handleDownload(file._id, file.fileName)}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 text-sm"
                >
                  Download
                </button>

                <button
                  onClick={() => handleDelete(file._id)}
                  className="text-gray-500 hover:text-red-600  transform hover:scale-110 transition-transform duration-150"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
