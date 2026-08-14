const Opportunity = require("../models/Opportunity");

// GET /api/opportunities - returns pipeline grouped by stage plus a flat list
exports.getOpportunities = async (req, res) => {
  try {
    const { owner } = req.query;
    const query = owner ? { owner } : {};

    const opportunities = await Opportunity.find(query)
      .populate("customer", "name company")
      .populate("owner", "name")
      .sort({ updatedAt: -1 });

    const pipeline = Opportunity.STAGES.reduce((acc, stage) => {
      acc[stage] = opportunities.filter((o) => o.stage === stage);
      return acc;
    }, {});

    res.json({ opportunities, pipeline, stages: Opportunity.STAGES });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.create({ ...req.body, owner: req.body.owner || req.user._id });
    res.status(201).json(opp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/opportunities/:id - general update
exports.updateOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!opp) return res.status(404).json({ message: "Opportunity not found" });
    res.json(opp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/opportunities/:id/stage - move card across the pipeline
exports.updateStage = async (req, res) => {
  try {
    const { stage } = req.body;
    if (!Opportunity.STAGES.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Must be one of: ${Opportunity.STAGES.join(", ")}` });
    }
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, { stage }, { new: true });
    if (!opp) return res.status(404).json({ message: "Opportunity not found" });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ message: "Opportunity not found" });
    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};