const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// GET /api/leads?status=&assignedTo=
exports.getLeads = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email role");
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/leads
exports.createLead = async (req, res) => {
  try {
    if (req.body.email) {
      const existing = await Lead.findOne({ email: req.body.email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "A lead with this email already exists" });
      }
    }
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A lead with this email already exists" });
    }
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/leads/:id/convert -> creates a Customer from the lead
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (lead.status === "Converted") {
      return res.status(400).json({ message: "Lead has already been converted" });
    }

    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: `Converted from lead. ${lead.notes || ""}`.trim(),
      owner: req.user._id,
    });

    lead.status = "Converted";
    lead.convertedCustomer = customer._id;
    await lead.save();

    res.json({ lead, customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};