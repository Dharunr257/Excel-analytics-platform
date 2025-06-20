import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [file, setFile] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
  }, [token]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get("/upload/history");
        setUploads(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUploads();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData);
      setUploads((prev) => [res.data.upload, ...prev]);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.name || "User"} 👋
      </h1>

      <form onSubmit={handleUpload} className="flex gap-4 mb-6">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input file-input-bordered"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload Excel
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {uploads.length === 0 ? (
          <p className="text-gray-500">No uploads yet.</p>
        ) : (
          uploads.map((file) => (
            <div
              key={file._id}
              className="border rounded p-4 shadow bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{file.fileName}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/analyze/${file._id}`)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 self-start"
              >
                Analyze
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
