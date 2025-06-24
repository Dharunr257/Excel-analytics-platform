// components/admin/AuditLogTable.jsx
const AuditLogTable = ({ logs }) => (
  <div className="bg-white p-4 rounded shadow mt-6">
    <h2 className="text-xl font-semibold mb-4">📜 Audit Logs</h2>
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="border-b">
              <td className="p-2">{log.user?.name || "Unknown"}</td>
              <td className="p-2">{log.action}</td>
              <td className="p-2">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AuditLogTable;
