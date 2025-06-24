// pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import StatsCard from "../components/admin/StatsCard";
import UsersTable from "../components/admin/UsersTable";
import AuditLogTable from "../components/admin/AuditLogTable";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await axios.get("/admin/stats");
        const usersRes = await axios.get("/admin/users");
        const logsRes = await axios.get("/admin/logs");

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
        navigate("/"); // redirect if unauthorized
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">🛠 Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={stats.totalUsers} />
        <StatsCard title="Total Files" value={stats.totalFiles} />
        <StatsCard title="Total Logs" value={stats.totalLogs} />
      </div>

      {/* Users Table */}
      <UsersTable users={users} />

      {/* Audit Logs */}
      <AuditLogTable logs={logs} />
    </div>
  );
};

export default AdminDashboard;
