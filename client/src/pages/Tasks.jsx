import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  title: "",
  type: "Follow-up",
  dueDate: "",
};

const STATUS_ORDER = [
  "Pending",
  "In Progress",
  "Completed",
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/tasks")
      .then(({ data }) => {
        setTasks(data);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to load tasks"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/tasks", form);

      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  const cycleStatus = async (task) => {
    const index = STATUS_ORDER.indexOf(task.status);

    const next =
      STATUS_ORDER[(index + 1) % STATUS_ORDER.length];

    try {
      await api.patch(`/tasks/${task._id}/status`, {
        status: next,
      });

      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Tasks & Follow-ups
        </h1>

        <button
          className="btn-primary btn-small"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Task title (e.g. Call Customer)"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >
            {[
              "Call",
              "Meeting",
              "Follow-up",
              "Proposal",
              "Demo",
              "Other",
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) =>
              setForm({
                ...form,
                dueDate: e.target.value,
              })
            }
            required
          />

          <button
            className="btn-primary btn-small"
            type="submit"
          >
            Save Task
          </button>
        </form>
      )}

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task._id}
                className={
                  task.isOverdue ? "overdue-row" : ""
                }
              >
                <td>{task.title}</td>

                <td>{task.type}</td>

                <td>
                  {new Date(
                    task.dueDate
                  ).toLocaleString()}
                </td>

                <td>
                  <button
                    className="status-toggle"
                    onClick={() =>
                      cycleStatus(task)
                    }
                  >
                    {task.status}
                  </button>
                </td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="empty-row"
                >
                  No tasks scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}