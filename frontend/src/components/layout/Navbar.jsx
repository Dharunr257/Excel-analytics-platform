import { Link, useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "../../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleProtectedNav = (path) => {
    if (!loggedIn) {
      alert("🔐 Please login to access this page.");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout(); // Clear token/session
    alert("👋 You have been logged out.");
    navigate("/login");
  };

  const navLinkClass = (path) =>
    `hover:text-yellow-300 ${
      location.pathname === path ? "font-bold underline" : ""
    }`;

  const handleDashboardClick = () => {
    if (!loggedIn) {
      alert("🔐 Please login to access this page.");
      navigate("/login");
    } else {
      user?.isAdmin ? navigate("/admin/dashboard") : navigate("/");
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <button onClick={handleDashboardClick} className="text-xl font-bold">
        📊 Excel analysis
      </button>

      <div className="flex gap-6 items-center">
        <button
          onClick={handleDashboardClick}
          className={navLinkClass(user?.isAdmin ? "/admin/dashboard" : "/")}
        >
          Dashboard
        </button>

        <button
          onClick={() => handleProtectedNav("/profile")}
          className={navLinkClass("/profile")}
        >
          Profile
        </button>

        {loggedIn ? (
          <button onClick={handleLogout} className="hover:text-red-300">
            Logout
          </button>
        ) : (
          <Link to="/login" className={navLinkClass("/login")}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
