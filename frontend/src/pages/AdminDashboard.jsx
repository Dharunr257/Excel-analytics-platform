// pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import UsersTable from "../components/admin/UsersTable.jsx";
import FilesTable from "../components/admin/FilesTable.jsx";
import AuditLogTable from "../components/admin/AuditLogTable";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🛠️ Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading stats...</p>
      ) : (
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
      )}

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">👤 Manage Users</h2>
        <UsersTable />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">📄 Manage Files</h2>
        <FilesTable />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">📜 Audit Logs</h2>
        <AuditLogTable />
      </div>
    </div>
  );
};

export default AdminDashboard;
