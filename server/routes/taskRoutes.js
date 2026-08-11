const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Create task
router.post("/", protect, createTask);

// Get all tasks
router.get("/", protect, getTasks);

// Get single task
router.get("/:id", protect, getTaskById);

// Update task
router.put("/:id", protect, updateTask);

// Delete task
router.delete("/:id", protect, deleteTask);

module.exports = router;