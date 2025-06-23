// pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { getUser, isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserUploads = async () => {
    try {
      const res = await axios.get("/upload/history"); // 👈 No ID needed
      setUploads(res.data);
    } catch (error) {
      console.error("❌ Failed to load upload history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Please login to view profile.");
      navigate("/login");
      return;
    }

    fetchUserUploads();
  }, []);

  const recentFiles = uploads.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">👤 User Profile</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <strong>Name:</strong> <span>{user?.name}</span>
        </div>
        <div>
          <strong>Email:</strong> <span>{user?.email}</span>
        </div>
        <div>
          <strong>Role:</strong>{" "}
          <span>{user?.isAdmin ? "Admin" : "Normal User"}</span>
        </div>
        <div>
          <strong>Total Files Uploaded:</strong>{" "}
          <span>{uploads.length}</span>
        </div>
      </div>

      <hr className="my-6" />

      <div>
        <h3 className="text-lg font-semibold mb-2">📂 Recent Uploaded Files</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : uploads.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="list-disc ml-6 text-gray-700">
            {recentFiles.map((file) => (
              <li key={file._id}>{file.fileName}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Extra Placeholder Section */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h4 className="font-semibold mb-2">📌 Notes</h4>
        <p className="text-gray-600 text-sm">
          This area can be extended to show more statistics, preferences, or
          activity logs in the future.
        </p>
      </div>
    </div>
  );
};

export default Profile;
