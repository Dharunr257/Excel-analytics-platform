import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "../../api/axiosInstance";

// Accept users as props from parent
const UsersTable = ({ users = [] }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/admin/user/${id}`);
      window.location.reload(); // Or lift state to remove without refresh
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-4 shadow rounded">
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Files</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.isAdmin ? "Admin" : "User"}</td>
              <td>{u.uploadCount || 0}</td>
              <td>
                <button
                  onClick={() => handleDelete(u._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete user"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
