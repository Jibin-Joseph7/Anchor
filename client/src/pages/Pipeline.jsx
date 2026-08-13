import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  title: "",
  value: "",
  stage: "New Lead",
};

export default function Pipeline() {
  const [pipeline, setPipeline] = useState({});
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get("/opportunities")
      .then(({ data }) => {
        setPipeline(data.pipeline || {});
        setStages(data.stages || []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load pipeline"
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
      await api.post("/opportunities", {
        ...form,
        value: Number(form.value) || 0,
      });

      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create opportunity"
      );
    }
  };

  const moveStage = async (id, direction) => {
    const currentStage = stages.find((stage) =>
      (pipeline[stage] || []).some((opp) => opp._id === id)
    );

    if (!currentStage) return;

    const currentIndex = stages.indexOf(currentStage);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= stages.length) return;

    try {
      await api.patch(`/opportunities/${id}/stage`, {
        stage: stages[nextIndex],
      });

      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to move opportunity"
      );
    }
  };

  if (loading) {
    return <div>Loading pipeline...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales Pipeline</h1>

        <button
          className="btn-primary btn-small"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "+ Add Opportunity"}
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Value ($)"
            type="number"
            value={form.value}
            onChange={(e) =>
              setForm({
                ...form,
                value: e.target.value,
              })
            }
          />

          <select
            value={form.stage}
            onChange={(e) =>
              setForm({
                ...form,
                stage: e.target.value,
              })
            }
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>

          <button
            className="btn-primary btn-small"
            type="submit"
          >
            Save Opportunity
          </button>
        </form>
      )}

      <div className="pipeline-board">
        {stages.map((stage) => (
          <div className="pipeline-column" key={stage}>
            <div className="pipeline-column-header">
              <span>{stage}</span>
              <span>{pipeline[stage]?.length || 0}</span>
            </div>

            <div className="pipeline-cards">
              {(pipeline[stage] || []).map((opp) => (
                <div
                  className="pipeline-card"
                  key={opp._id}
                >
                  <div className="pipeline-card-title">
                    {opp.title}
                  </div>

                  {opp.customer && (
                    <div className="pipeline-card-sub">
                      {opp.customer.name}
                    </div>
                  )}

                  <div className="pipeline-card-value">
                    ${(opp.value || 0).toLocaleString()}
                  </div>

                  <div className="pipeline-card-actions">
                    <button
                      onClick={() =>
                        moveStage(opp._id, -1)
                      }
                      title="Move back"
                    >
                      ◀
                    </button>

                    <button
                      onClick={() =>
                        moveStage(opp._id, 1)
                      }
                      title="Move forward"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}