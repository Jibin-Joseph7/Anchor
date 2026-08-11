const express = require("express");

const router = express.Router();

const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} = require("../controllers/leadController");

const { protect, authorize } = require("../middleware/auth");

// All lead routes require authentication
router.use(protect);

// GET /api/leads
router.get("/", getLeads);

// GET /api/leads/:id
router.get("/:id", getLead);

// POST /api/leads
router.post("/", createLead);

// PUT /api/leads/:id
router.put("/:id", updateLead);

// DELETE /api/leads/:id
router.delete(
  "/:id",
  authorize("admin", "sales_manager"),
  deleteLead
);

// POST /api/leads/:id/convert
router.post("/:id/convert", convertLead);

module.exports = router;