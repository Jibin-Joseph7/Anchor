const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const {
      search = "",
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (status) {
      query.status = status;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("owner", "name email role")
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
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("convertedToCustomer", "name email");

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Lead name is required",
      });
    }

    // Prevent duplicate leads by email
    if (email) {
      const existingLead = await Lead.findOne({
        email: email.toLowerCase(),
      });

      if (existingLead) {
        return res.status(409).json({
          message: "A lead with this email already exists",
          lead: existingLead,
        });
      }
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status,
      notes,
      owner: req.user._id,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
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
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/leads/:id/convert
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    if (lead.convertedToCustomer) {
      return res.status(409).json({
        message: "Lead has already been converted",
      });
    }

    // Check whether a customer with this email already exists
    let customer = null;

    if (lead.email) {
      customer = await Customer.findOne({
        email: lead.email.toLowerCase(),
      });
    }

    // Create customer if one doesn't exist
    if (!customer) {
      customer = await Customer.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        owner: lead.owner || req.user._id,
      });
    }

    lead.convertedToCustomer = customer._id;
    lead.status = "won";

    await lead.save();

    res.json({
      message: "Lead converted to customer successfully",
      lead,
      customer,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};