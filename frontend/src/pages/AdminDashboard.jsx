import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import UsersTable from "../components/admin/UsersTable.jsx";
import FilesTable from "../components/admin/FilesTable.jsx";
import AuditLogTable from "../components/admin/AuditLogTable";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [userUploads, setUserUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get overall stats
        const statsRes = await axios.get("/admin/stats");
        setStats(statsRes.data);

        // Get user uploads (upload count per user)
        const userUploadsRes = await axios.get("/admin/user-uploads-count");
        setUserUploads(userUploadsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🛠️ Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading dashboard data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white shadow rounded p-4 text-center">
              <h2 className="text-xl font-semibold">👥 Users</h2>
              <p className="text-2xl">{stats.totalUsers}</p>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <h2 className="text-xl font-semibold">📁 Files</h2>
              <p className="text-2xl">{stats.totalFiles}</p>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <h2 className="text-xl font-semibold">👮 Total Admins</h2>
              <p className="text-2xl">{stats.totalAdmins}</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">👤 Manage Users</h2>
            <UsersTable users={userUploads} />
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">📄 Manage Files</h2>
            <FilesTable />
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">📜 Audit Logs</h2>
            <AuditLogTable />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
