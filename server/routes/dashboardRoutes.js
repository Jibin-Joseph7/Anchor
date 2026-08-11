const express = require("express");
const router = express.Router();

const {
  getSummary,
  getConversionReport,
  getEmployeePerformance,
  getCustomerGrowth,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getSummary);
router.get("/reports/conversion", getConversionReport);
router.get("/reports/employee-performance", getEmployeePerformance);
router.get("/reports/customer-growth", getCustomerGrowth);

module.exports = router;