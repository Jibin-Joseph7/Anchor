import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales_executive",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-brand">Create account</h1>

        <p className="auth-subtitle">
          Start managing your CRM workspace.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <label htmlFor="name">Full name</label>

        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          required
        />

        <label htmlFor="email">Email</label>

        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Minimum 6 characters"
          minLength={6}
          required
        />

        <label htmlFor="role">Role</label>

        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="sales_executive">Sales Executive</option>
          <option value="sales_manager">Sales Manager</option>
          <option value="admin">Admin</option>
        </select>

        <button
          className="btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}