const express = require("express");
const router = express.Router();
const {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  updateStage,
  deleteOpportunity,
} = require("../controllers/opportunityController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getOpportunities);
router.post("/", createOpportunity);
router.put("/:id", updateOpportunity);
router.patch("/:id/stage", updateStage);
router.delete("/:id", deleteOpportunity);

module.exports = router;