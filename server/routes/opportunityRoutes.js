const express = require("express");

const router = express.Router();

const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  updateStage,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const { protect, authorize } = require("../middleware/auth");

// All opportunity routes require authentication
router.use(protect);

// GET /api/opportunities
router.get("/", getOpportunities);

// GET /api/opportunities/:id
router.get("/:id", getOpportunity);

// POST /api/opportunities
router.post("/", createOpportunity);

// PUT /api/opportunities/:id
router.put("/:id", updateOpportunity);

// PATCH /api/opportunities/:id/stage
router.patch("/:id/stage", updateStage);

// DELETE /api/opportunities/:id
router.delete(
  "/:id",
  authorize("admin", "sales_manager"),
  deleteOpportunity
);

module.exports = router;