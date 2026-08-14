import { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import api from "../api/axios.js";

const emptyForm = { title: "", value: "", stage: "New Lead" };

function OpportunityCard({ opp }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opp._id,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="pipeline-card"
    >
      <div className="pipeline-card-title">{opp.title}</div>
      {opp.customer && <div className="pipeline-card-sub">{opp.customer.name}</div>}
      <div className="pipeline-card-value">${(opp.value || 0).toLocaleString()}</div>
    </div>
  );
}

function PipelineColumn({ stage, opportunities }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={"pipeline-column" + (isOver ? " drop-active" : "")}
    >
      <div className="pipeline-column-header">
        <span>{stage}</span>
        <span>{opportunities.length}</span>
      </div>
      <div className="pipeline-cards">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp._id} opp={opp} />
        ))}
        {opportunities.length === 0 && <div className="pipeline-empty">Drop here</div>}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [pipeline, setPipeline] = useState({});
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [activeOpp, setActiveOpp] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // avoids accidental drags on click
    })
  );

  const load = () => {
    setLoading(true);
    api
      .get("/opportunities")
      .then(({ data }) => {
        setPipeline(data.pipeline || {});
        setStages(data.stages || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load pipeline"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/opportunities", { ...form, value: Number(form.value) || 0 });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create opportunity");
    }
  };

  const findOpp = (id) => {
    for (const stage of stages) {
      const found = (pipeline[stage] || []).find((o) => o._id === id);
      if (found) return { opp: found, fromStage: stage };
    }
    return null;
  };

  const handleDragStart = (event) => {
    const match = findOpp(event.active.id);
    setActiveOpp(match?.opp || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveOpp(null);
    if (!over) return;

    const targetStage = over.id;
    const match = findOpp(active.id);
    if (!match || match.fromStage === targetStage) return;

    // Optimistic update so the card moves instantly, then reconcile with the server
    setPipeline((prev) => {
      const next = { ...prev };
      next[match.fromStage] = next[match.fromStage].filter((o) => o._id !== active.id);
      next[targetStage] = [...(next[targetStage] || []), { ...match.opp, stage: targetStage }];
      return next;
    });

    try {
      await api.patch(`/opportunities/${active.id}/stage`, { stage: targetStage });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move opportunity");
      load(); // revert to server state on failure
    }
  };

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales Pipeline</h1>
        <button className="btn-primary btn-small" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Opportunity"}
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Deal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Value ($)"
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
          <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="btn-primary btn-small" type="submit">
            Save Opportunity
          </button>
        </form>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="pipeline-board">
          {stages.map((stage) => (
            <PipelineColumn key={stage} stage={stage} opportunities={pipeline[stage] || []} />
          ))}
        </div>

        <DragOverlay>
          {activeOpp && (
            <div className="pipeline-card dragging-overlay">
              <div className="pipeline-card-title">{activeOpp.title}</div>
              {activeOpp.customer && (
                <div className="pipeline-card-sub">{activeOpp.customer.name}</div>
              )}
              <div className="pipeline-card-value">
                ${(activeOpp.value || 0).toLocaleString()}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}