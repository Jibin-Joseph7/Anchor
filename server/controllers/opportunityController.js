const Opportunity = require("../models/Opportunity");
const Customer = require("../models/Customer");

// GET /api/opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const { stage, search = "", page = 1, limit = 20 } = req.query;

    const query = {
      ...(stage ? { stage } : {}),
      ...(search
        ? {
            title: {
              $regex: search,
              $options: "i",
            },
          }
        : {}),
    };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate("customer", "name email company")
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Opportunity.countDocuments(query),
    ]);

    res.json({
      opportunities,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/opportunities/:id
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("customer", "name email company")
      .populate("owner", "name email");

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      customer,
      value,
      stage,
      expectedCloseDate,
      probability,
      notes,
    } = req.body;

    if (!title || !customer) {
      return res.status(400).json({
        message: "title and customer are required",
      });
    }

    const existingCustomer = await Customer.findById(customer);

    if (!existingCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const opportunity = await Opportunity.create({
      title,
      customer,
      owner: req.user._id,
      value,
      stage,
      expectedCloseDate,
      probability,
      notes,
    });

    const populatedOpportunity = await Opportunity.findById(
      opportunity._id
    )
      .populate("customer", "name email company")
      .populate("owner", "name email");

    res.status(201).json(populatedOpportunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/opportunities/:id
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email company")
      .populate("owner", "name email");

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/opportunities/:id/stage
exports.updateStage = async (req, res) => {
  try {
    const { stage } = req.body;

    const validStages = [
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "won",
      "lost",
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        message: "Invalid opportunity stage",
      });
    }

    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { stage },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email company")
      .populate("owner", "name email");

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(
      req.params.id
    );

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json({
      message: "Opportunity deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};