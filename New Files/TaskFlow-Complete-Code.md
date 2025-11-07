# TaskFlow - Complete Step-by-Step Implementation Guide
## Full Frontend & Backend Code

---

## 📋 Table of Contents

### Part A: Backend Setup
1. [Prerequisites & Installation](#part-a-backend-setup)
2. [Database Configuration](#step-1-database-setup)
3. [Backend Project Structure](#step-2-create-backend-project)
4. [Complete Backend Code Files](#step-3-backend-code-files)
5. [Start Backend Server](#step-4-start-backend)

### Part B: Frontend Setup
6. [Angular Project Setup](#part-b-frontend-setup)
7. [Tailwind CSS Configuration](#step-6-configure-tailwind)
8. [Complete Frontend Code Files](#step-7-frontend-code-files)
9. [Start Frontend Application](#step-8-start-frontend)

### Part C: Testing & Deployment
10. [Testing Guide](#part-c-testing)
11. [Deployment Instructions](#deployment)

---

# PART A: BACKEND SETUP

## Prerequisites

Before starting, ensure you have:
- **Node.js** v18+ installed ([Download](https://nodejs.org/))
- **MySQL** v8+ installed ([Download](https://dev.mysql.com/downloads/))
- **VS Code** or any code editor
- **Git** installed

Verify installations:
```bash
node --version
npm --version
mysql --version
```

---

## Step 1: Database Setup

### 1.1 Open MySQL Workbench (or MySQL command line)

### 1.2 Execute the following SQL:

```sql
-- Create Database
CREATE DATABASE taskflow_db;
USE taskflow_db;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    due_date DATE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);
```

### 1.3 Generate Admin Password Hash

Open terminal and run:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Copy the hash output (starts with `$2b$10$...`)

### 1.4 Insert Admin User

Replace `YOUR_HASH_HERE` with the hash you copied:
```sql
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@taskflow.com', 'YOUR_HASH_HERE', 'admin');

-- Insert sample regular user (password: user123)
-- Generate hash first using the node command above with 'user123'
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', 'YOUR_USER_HASH_HERE', 'user');
```

---

## Step 2: Create Backend Project

### 2.1 Create project folder
```bash
mkdir TaskFlow
cd TaskFlow
mkdir taskflow-backend
cd taskflow-backend
```

### 2.2 Initialize Node.js project
```bash
npm init -y
```

### 2.3 Install dependencies
```bash
npm install express mysql2 bcrypt jsonwebtoken dotenv cors express-validator
npm install --save-dev nodemon
```

### 2.4 Create folder structure
```bash
mkdir config middleware controllers routes
```

Your structure should look like:
```
taskflow-backend/
├── config/
├── middleware/
├── controllers/
├── routes/
├── package.json
└── (files to be created below)
```

---

## Step 3: Backend Code Files

### File 1: `.env` (Root of taskflow-backend)

Create `.env` file and add:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=taskflow-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

⚠️ **IMPORTANT**: Replace `your_mysql_password` with your actual MySQL password!

---

### File 2: `package.json` (Update scripts section)

Open `package.json` and update the `scripts` section:

```json
{
  "name": "taskflow-backend",
  "version": "1.0.0",
  "description": "TaskFlow REST API Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["task-management", "rest-api", "express", "mysql"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

### File 3: `config/db.js`

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database Connected Successfully');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
        process.exit(1);
    });

module.exports = pool;
```

---

### File 4: `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

// Verify JWT token
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'Access denied. No token provided.' 
            });
        }

        // Extract token (format: "Bearer TOKEN")
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                message: 'Access denied. Invalid token format.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            message: 'Invalid token.' 
        });
    }
};

// Check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Access denied. Admin privileges required.' 
        });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
```

---

### File 5: `controllers/authController.js`

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Register new user
const register = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                message: 'User already exists with this email address' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user']
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const [users] = await db.query(
            'SELECT id, name, email, password, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Return success response
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        res.json(users[0]);
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { register, login, getCurrentUser };
```

---

### File 6: `controllers/taskController.js`

```javascript
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Get all tasks with optional filters
const getTasks = async (req, res) => {
    try {
        const { priority, status, search } = req.query;
        const userId = req.user.role === 'admin' ? null : req.user.id;

        let query = `
            SELECT t.*, u.name as user_name 
            FROM tasks t 
            JOIN users u ON t.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        // Filter by user (non-admin users only see their tasks)
        if (userId) {
            query += ' AND t.user_id = ?';
            params.push(userId);
        }

        // Filter by priority
        if (priority) {
            query += ' AND t.priority = ?';
            params.push(priority);
        }

        // Filter by status
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        // Search in title and description
        if (search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await db.query(query, params);
        res.json(tasks);

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ 
            message: 'Server error fetching tasks',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [tasks] = await db.query(
            `SELECT t.*, u.name as user_name 
             FROM tasks t 
             JOIN users u ON t.user_id = u.id 
             WHERE t.id = ?`,
            [id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        const task = tasks[0];

        // Authorization check: non-admin users can only view their own tasks
        if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own tasks.' 
            });
        }

        res.json(task);

    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ 
            message: 'Server error fetching task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create new task
const createTask = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { title, description, priority, status, due_date, user_id } = req.body;

        // Determine who the task is assigned to
        // Admins can assign to any user, regular users create for themselves
        const assignedUserId = req.user.role === 'admin' && user_id 
            ? user_id 
            : req.user.id;

        // Insert task
        const [result] = await db.query(
            `INSERT INTO tasks (title, description, priority, status, due_date, user_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title, 
                description || null, 
                priority || 'medium', 
                status || 'pending', 
                due_date || null, 
                assignedUserId
            ]
        );

        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ 
            message: 'Server error creating task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update existing task
const updateTask = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { id } = req.params;
        const { title, description, priority, status, due_date } = req.body;

        // Check if task exists
        const [existingTasks] = await db.query(
            'SELECT user_id FROM tasks WHERE id = ?',
            [id]
        );

        if (existingTasks.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        const existingTask = existingTasks[0];

        // Authorization check
        if (req.user.role !== 'admin' && existingTask.user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied. You can only update your own tasks.' 
            });
        }

        // Update task
        await db.query(
            `UPDATE tasks 
             SET title = ?, description = ?, priority = ?, status = ?, due_date = ?
             WHERE id = ?`,
            [title, description || null, priority, status, due_date || null, id]
        );

        res.json({ 
            message: 'Task updated successfully' 
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ 
            message: 'Server error updating task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if task exists
        const [existingTasks] = await db.query(
            'SELECT user_id FROM tasks WHERE id = ?',
            [id]
        );

        if (existingTasks.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        const existingTask = existingTasks[0];

        // Authorization check
        if (req.user.role !== 'admin' && existingTask.user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied. You can only delete your own tasks.' 
            });
        }

        // Delete task
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({ 
            message: 'Task deleted successfully' 
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ 
            message: 'Server error deleting task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get task statistics
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;
        const params = [];

        // Total tasks
        let totalQuery = 'SELECT COUNT(*) as total FROM tasks';
        if (userId) {
            totalQuery += ' WHERE user_id = ?';
            params.push(userId);
        }
        const [totalResult] = await db.query(totalQuery, userId ? [userId] : []);

        // Tasks by status
        let statusQuery = 'SELECT status, COUNT(*) as count FROM tasks';
        if (userId) {
            statusQuery += ' WHERE user_id = ?';
        }
        statusQuery += ' GROUP BY status';
        const [statusResult] = await db.query(statusQuery, userId ? [userId] : []);

        // Tasks by priority
        let priorityQuery = 'SELECT priority, COUNT(*) as count FROM tasks';
        if (userId) {
            priorityQuery += ' WHERE user_id = ?';
        }
        priorityQuery += ' GROUP BY priority';
        const [priorityResult] = await db.query(priorityQuery, userId ? [userId] : []);

        // Overdue tasks
        let overdueQuery = `
            SELECT COUNT(*) as overdue 
            FROM tasks 
            WHERE due_date < CURDATE() 
            AND status != 'completed'
        `;
        if (userId) {
            overdueQuery += ' AND user_id = ?';
        }
        const [overdueResult] = await db.query(overdueQuery, userId ? [userId] : []);

        res.json({
            total: totalResult[0].total,
            byStatus: statusResult,
            byPriority: priorityResult,
            overdue: overdueResult[0].overdue
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            message: 'Server error fetching statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};
```

---

### File 7: `routes/authRoutes.js`

```javascript
const express = require('express');
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], register);

// POST /api/auth/login - Login user
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], login);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
```

---

### File 8: `routes/taskRoutes.js`

```javascript
const express = require('express');
const { body } = require('express-validator');
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
} = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes are protected - require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks (with optional filters)
router.get('/', getTasks);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', getTaskStats);

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', getTaskById);

// POST /api/tasks - Create new task
router.post('/', [
    body('title')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters long'),
    body('description')
        .optional()
        .trim(),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date')
], createTask);

// PUT /api/tasks/:id - Update existing task
router.put('/:id', [
    body('title')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters long'),
    body('description')
        .optional()
        .trim(),
    body('priority')
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    body('status')
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date')
], updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

module.exports = router;
```

---

### File 9: `server.js` (Root of taskflow-backend)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:4200', // Angular development server
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'TaskFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to TaskFlow API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            tasks: '/api/tasks'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 TaskFlow API Server Started');
    console.log('═══════════════════════════════════════');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`📋 Task endpoints: http://localhost:${PORT}/api/tasks`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════');
});
```

---

## Step 4: Start Backend

### 4.1 Verify your folder structure:
```
taskflow-backend/
├── config/
│   └── db.js
├── middleware/
│   └── authMiddleware.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── .env
├── server.js
└── package.json
```

### 4.2 Start the server:
```bash
npm run dev
```

### 4.3 You should see:
```
✅ MySQL Database Connected Successfully
📊 Database: taskflow_db
═══════════════════════════════════════
🚀 TaskFlow API Server Started
═══════════════════════════════════════
📍 Server running on: http://localhost:5000
...
```

### 4.4 Test the API:
Open a new terminal and run:
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"TaskFlow API is running","timestamp":"..."}
```

✅ **Backend is complete and running!**

---

# PART B: FRONTEND SETUP

## Step 5: Create Angular Project

### 5.1 Open NEW terminal (keep backend running)

Navigate to the main TaskFlow folder:
```bash
cd .. # (if you're still in taskflow-backend)
```

### 5.2 Create Angular project:
```bash
ng new taskflow-frontend --routing --style=css --skip-git
```

When prompted:
- Would you like to enable Server-Side Rendering (SSR)? **No**
- Would you like to use standalone components? **Yes**

### 5.3 Navigate to project:
```bash
cd taskflow-frontend
```

### 5.4 Install dependencies:
```bash
npm install chart.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

---

## Step 6: Configure Tailwind CSS

### File 1: `tailwind.config.js`

Replace the entire file content with:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### File 2: `src/styles.css`

Replace the entire file content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Loading Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth Transitions */
button, a, input, select, textarea {
  transition: all 0.2s ease-in-out;
}

/* Focus Visible */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Step 7: Frontend Code Files

### Create Folder Structure

```bash
cd src/app
mkdir -p models services guards interceptors
mkdir -p components/login components/register components/dashboard components/task-list components/task-form components/task-stats
```

---

### MODELS

### File: `src/app/models/user.model.ts`

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
```

### File: `src/app/models/task.model.ts`

```typescript
export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string | null;
  user_id: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  overdue: number;
}

export interface TaskFilters {
  priority?: string;
  status?: string;
  search?: string;
}
```

---

### SERVICES

### File: `src/app/services/storage.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'taskflow_token';
  private readonly USER_KEY = 'taskflow_user';

  constructor() { }

  // Token methods
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User methods
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Clear all storage
  clear(): void {
    this.removeToken();
    this.removeUser();
  }
}
```

### File: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) { }

  // Register new user
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Login user
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        // Save token and user data to local storage
        this.storageService.saveToken(response.token);
        this.storageService.saveUser(response.user);
      })
    );
  }

  // Logout user
  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // Get current user from API
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.storageService.isLoggedIn();
  }

  // Get user from storage
  getUser(): User | null {
    return this.storageService.getUser();
  }

  // Get token from storage
  getToken(): string | null {
    return this.storageService.getToken();
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}
```

### File: `src/app/services/task.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskStats, TaskFilters } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  // Get all tasks with optional filters
  getTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters?.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  // Get single task by ID
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Create new task
  createTask(task: Partial<Task>): Observable<any> {
    return this.http.post(this.apiUrl, task);
  }

  // Update existing task
  updateTask(id: number, task: Partial<Task>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, task);
  }

  // Delete task
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get task statistics
  getStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.apiUrl}/stats`);
  }
}
```

---

*Continuing in next message due to length...*