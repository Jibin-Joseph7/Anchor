const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { search = "", status, page = 1, limit = 10 } = req.query;

    const query = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { company: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("owner", "name email")
        .populate("convertedToCustomer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Lead.countDocuments(query),
    ]);

    res.json({
      leads,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("owner", "name email")
      .populate("convertedToCustomer", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { email } = req.body;

    // Prevent duplicate leads with the same email
    if (email) {
      const existingLead = await Lead.findOne({
        email: email.toLowerCase(),
      });

      if (existingLead) {
        return res.status(409).json({
          message: "A lead with this email already exists",
        });
      }
    }

    const lead = await Lead.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/leads/:id/convert
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (lead.convertedToCustomer) {
      return res.status(409).json({
        message: "Lead has already been converted",
      });
    }

    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
      owner: lead.owner || req.user._id,
    });

    lead.convertedToCustomer = customer._id;
    lead.status = "won";

    await lead.save();

    res.json({
      message: "Lead converted to customer successfully",
      lead,
      customer,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};