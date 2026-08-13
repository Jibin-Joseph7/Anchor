import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = () => {
    setLoading(true);

    api
      .get("/customers", {
        params: {
          search,
          page,
          limit: 10,
        },
      })
      .then(({ data }) => {
        setCustomers(data.customers);
        setTotal(data.total);
        setPages(data.pages || 1);
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Failed to load customers"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/customers", form);

      setForm(emptyForm);
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create customer"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) {
      return;
    }

    try {
      await api.delete(`/customers/${id}`);
      loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete customer"
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Customers ({total})
        </h1>

        <button
          className="btn-primary btn-small"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <form
        className="inline-form"
        onSubmit={handleSearch}
      >
        <input
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          className="btn-secondary btn-small"
          type="submit"
        >
          Search
        </button>
      </form>

      {showForm && (
        <form
          className="inline-form"
          onSubmit={handleCreate}
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              setForm({
                ...form,
                company: e.target.value,
              })
            }
          />

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          <button
            className="btn-primary btn-small"
            type="submit"
          >
            Save Customer
          </button>
        </form>
      )}

      {loading ? (
        <div>Loading customers...</div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>

                  <td>
                    {customer.company || "—"}
                  </td>

                  <td>
                    {customer.email || "—"}
                  </td>

                  <td>
                    {customer.phone || "—"}
                  </td>

                  <td>
                    <button
                      className="btn-link danger"
                      onClick={() =>
                        handleDelete(customer._id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="empty-row"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
            >
              Prev
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              disabled={page >= pages}
              onClick={() =>
                setPage((p) => p + 1)
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}