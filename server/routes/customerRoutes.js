const express = require("express");

const router = express.Router();

const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const {
  protect,
  authorize,
} = require("../middleware/auth");

// All customer routes require authentication
router.use(protect);

// GET /api/customers
router.get("/", getCustomers);

// GET /api/customers/:id
router.get("/:id", getCustomer);

// POST /api/customers
router.post("/", createCustomer);

// PUT /api/customers/:id
router.put("/:id", updateCustomer);

// DELETE /api/customers/:id
// Only admin and sales managers can delete
router.delete(
  "/:id",
  authorize("admin", "sales_manager"),
  deleteCustomer
);

module.exports = router;