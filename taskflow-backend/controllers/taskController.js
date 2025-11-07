const { validationResult } = require("express-validator");
const db = require("../config/db");

// Get All Tasks (with filters)
const getTasks = async (req, res) => {
  try {
    const { priority, status, search } = req.query;
    const userId = req.user.role === "admin" ? null : req.user.id;

    let query =
      "SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE 1=1";
    const params = [];

    // Filter by user (non-admin)
    if (userId) {
      query += " AND t.user_id = ?";
      params.push(userId);
    }

    // Filter by priority
    if (priority) {
      query += " AND t.priority = ?";
      params.push(priority);
    }

    // Filter by status
    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    // Search in title/description
    if (search) {
      query += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY t.created_at DESC";

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Server error fetching tasks",
    });
  }
};

// Get Task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await db.query(
      "SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.id = ?",
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check authorization (non-admin can only view their own tasks)
    if (req.user.role !== "admin" && tasks[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      message: "Server error fetching task",
    });
  }
};

// Create Task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, status, due_date, user_id } =
      req.body;

    // Admins can assign tasks to any user, regular users create for themselves
    const assignedUserId =
      req.user.role === "admin" && user_id ? user_id : req.user.id;

    const [result] = await db.query(
      "INSERT INTO tasks (title, description, priority, status, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        priority || "medium",
        status || "pending",
        due_date,
        assignedUserId,
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Server error creating task",
    });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, priority, status, due_date } = req.body;

    // Check if task exists
    const [existingTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);

    if (existingTask.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && existingTask[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await db.query(
      "UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ? WHERE id = ?",
      [title, description, priority, status, due_date, id]
    );

    res.json({
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: "Server error updating task",
    });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const [existingTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);

    if (existingTask.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && existingTask[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await db.query("DELETE FROM tasks WHERE id = ?", [id]);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Server error deleting task",
    });
  }
};

// Get Task Statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user.id;

    // Total tasks
    let totalQuery = "SELECT COUNT(*) as total FROM tasks";
    const params = [];

    if (userId) {
      totalQuery += " WHERE user_id = ?";
      params.push(userId);
    }

    const [totalResult] = await db.query(totalQuery, params);

    // Tasks by status
    let statusQuery = "SELECT status, COUNT(*) as count FROM tasks";
    const statusParams = [];

    if (userId) {
      statusQuery += " WHERE user_id = ?";
      statusParams.push(userId);
    }

    statusQuery += " GROUP BY status";
    const [statusResult] = await db.query(statusQuery, statusParams);

    // Tasks by priority
    let priorityQuery = "SELECT priority, COUNT(*) as count FROM tasks";
    const priorityParams = [];

    if (userId) {
      priorityQuery += " WHERE user_id = ?";
      priorityParams.push(userId);
    }

    priorityQuery += " GROUP BY priority";
    const [priorityResult] = await db.query(priorityQuery, priorityParams);

    // Overdue tasks
    let overdueQuery =
      'SELECT COUNT(*) as overdue FROM tasks WHERE due_date < CURDATE() AND status != "completed"';
    const overdueParams = [];

    if (userId) {
      overdueQuery += " AND user_id = ?";
      overdueParams.push(userId);
    }

    const [overdueResult] = await db.query(overdueQuery, overdueParams);

    res.json({
      total: totalResult[0].total,
      byStatus: statusResult,
      byPriority: priorityResult,
      overdue: overdueResult[0].overdue,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      message: "Server error fetching statistics",
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
