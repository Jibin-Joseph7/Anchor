import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Leads", path: "/leads" },
    { name: "Customers", path: "/customers" },
    { name: "Pipeline", path: "/pipeline" },
    { name: "Tasks", path: "/tasks" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        ⚓ Anchor CRM
      </div>

      <nav className="sidebar-links">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-name">
          {user?.name || "User"}
        </div>

        <div className="sidebar-user-role">
          {user?.role || "User"}
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
