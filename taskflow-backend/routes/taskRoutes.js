const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all tasks (with filters)
router.get("/", getTasks);

// Get statistics
router.get("/stats", getTaskStats);

// Get single task
router.get("/:id", getTaskById);

// Create task
router.post(
  "/",
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description").optional().trim(),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    body("status")
      .optional()
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("due_date").optional().isISO8601().withMessage("Invalid date format"),
  ],
  createTask
);

// Update task
router.put(
  "/:id",
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description").optional().trim(),
    body("priority")
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    body("status")
      .isIn(["pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("due_date").optional().isISO8601().withMessage("Invalid date format"),
  ],
  updateTask
);

// Delete task
router.delete("/:id", deleteTask);

module.exports = router;
