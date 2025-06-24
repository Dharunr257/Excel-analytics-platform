// components/admin/FilesTable.jsx
import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";

const FilesTable = () => {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("");

  const fetchFiles = async () => {
    try {
      const res = await axios.get("/admin/files");
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`/upload/${id}`);
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert("Failed to delete file");
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const res = await axios.get(`/upload/download/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Download failed");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white shadow p-4 rounded mt-6">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium">🔍 Filter by file name:</label>
        <input
          type="text"
          placeholder="Enter keyword..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input input-bordered input-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th>File Name</th>
              <th>User</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-500">
                  No files found.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file._id}>
                  <td className="break-all">{file.fileName}</td>
                  <td>{file.userName || "Unknown"}</td>
                  <td>
                    {new Date(file.createdAt).toLocaleDateString()}{" "}
                    {new Date(file.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="flex gap-3 items-center">
                    <button
                      onClick={() => handleDownload(file._id, file.fileName)}
                      className="text-green-600 hover:text-green-800"
                      title="Download"
                    >
                      <FontAwesomeIcon icon={faDownload} className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilesTable;
