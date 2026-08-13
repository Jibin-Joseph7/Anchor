import { useEffect, useState } from "react";
import api from "../api/axios.js";

const STATUS_COLORS = {
  New: "#2563eb",
  Contacted: "#0ea5a4",
  Qualified: "#16a34a",
  Unqualified: "#64748b",
  Converted: "#7c3aed",
};

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website",
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadLeads = () => {
    setLoading(true);

    api
      .get("/leads")
      .then(({ data }) => setLeads(data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load leads"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/leads", form);

      setForm(emptyForm);
      setShowForm(false);
      loadLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create lead"
      );
    }
  };

  const handleConvert = async (id) => {
    try {
      await api.post(`/leads/${id}/convert`);
      loadLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to convert lead"
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leads</h1>

        <button
          className="btn-primary btn-small"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
          />

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <select
            value={form.source}
            onChange={(e) =>
              setForm({ ...form, source: e.target.value })
            }
          >
            {[
              "Website",
              "Referral",
              "Cold Call",
              "Social Media",
              "Advertisement",
              "Other",
            ].map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <button
            className="btn-primary btn-small"
            type="submit"
          >
            Save Lead
          </button>
        </form>
      )}

      {loading ? (
        <div>Loading leads...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.name}</td>

                <td>{lead.company || "—"}</td>

                <td>{lead.source}</td>

                <td>
                  <span
                    className="status-pill"
                    style={{
                      background:
                        STATUS_COLORS[lead.status] ||
                        "#64748b",
                    }}
                  >
                    {lead.status}
                  </span>
                </td>

                <td>
                  {lead.assignedTo?.name || "Unassigned"}
                </td>

                <td>
                  {lead.status !== "Converted" && (
                    <button
                      className="btn-link"
                      onClick={() =>
                        handleConvert(lead._id)
                      }
                    >
                      Convert
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  No leads yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}