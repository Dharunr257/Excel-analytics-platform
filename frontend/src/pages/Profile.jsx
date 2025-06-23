// pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch authenticated user info
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setError("Failed to fetch user profile.");
    }
  };

  // ✅ Fetch upload history
  const fetchUploadHistory = async () => {
    try {
      const res = await axios.get("/upload/history");
      setUploads(res.data);
    } catch (err) {
      setError("Failed to fetch upload history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      alert("Please login to access your profile.");
      navigate("/login");
      return;
    }

    fetchUserInfo();
    fetchUploadHistory();
  }, []);

  const recentFiles = uploads.slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">👤 User Profile</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {!user ? (
        <p className="text-center text-gray-500">Loading profile...</p>
      ) : (
        <>
          {/* User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Name:</strong> <span>{user.name}</span>
            </div>
            <div>
              <strong>Email:</strong> <span>{user.email}</span>
            </div>
            <div>
              <strong>Role:</strong>{" "}
              <span>{user.isAdmin ? "Admin" : "Normal User"}</span>
            </div>
            <div>
              <strong>Total Files Uploaded:</strong>{" "}
              <span>{uploads.length}</span>
            </div>
          </div>

          {/* Upload History */}
          <div>
            <h3 className="text-lg font-semibold mb-2">📂 Recent Uploaded Files</h3>
            {loading ? (
              <p className="text-gray-500">Loading files...</p>
            ) : uploads.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet.</p>
            ) : (
              <ul className="list-disc ml-6 text-gray-700">
                {recentFiles.map((file) => (
                  <li key={file._id}>
                    <span className="font-medium">{file.fileName}</span> (
                    {new Date(file.createdAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Placeholder for additional future content */}
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h4 className="font-semibold mb-2">📌 Notes</h4>
            <p className="text-gray-600 text-sm">
              This area can be extended to show more statistics, preferences,
              or activity logs in the future. You could also show chart
              summaries or most analyzed datasets.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
