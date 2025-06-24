import { useState } from "react";
import axios from "../api/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { saveAuthData } from "../utils/auth";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/auth/login", form);
      const { token, ...userData } = res.data;

      // Save token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      saveAuthData(token, userData); // Optional helper if used

      dispatch(setCredentials(res.data));

      // Redirect based on role
      if (res.data.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert(
        err?.response?.data?.message || "Invalid credentials or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Email"
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">Don’t have an account?</p>
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          ➕ Register Now
        </Link>
      </div>
    </div>
  );
};

export default Login;
