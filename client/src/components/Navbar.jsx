
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/customers", label: "Customers" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/tasks", label: "Tasks" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">⚓ Anchor</div>

      <nav className="sidebar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.name}</div>

        <div className="sidebar-user-role">
          {user?.role?.replace("_", " ")}
        </div>

        <button className="btn-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
