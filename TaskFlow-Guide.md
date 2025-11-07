# TaskFlow - Complete Implementation Guide
## Full-Stack Task Management Dashboard

---

## 📋 Table of Contents
1. [Prerequisites & Installation](#prerequisites--installation)
2. [Database Setup](#database-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Authentication Flow](#authentication-flow)
6. [Testing & Deployment](#testing--deployment)

---

## Prerequisites & Installation

### Required Software
- **Node.js** (v18+ recommended)
- **MySQL** (v8.0+)
- **Angular CLI** (v17)
- **Git**
- **VS Code** (recommended)

### Installation Steps

```bash
# Install Angular CLI globally
npm install -g @angular/cli@17

# Verify installations
node --version
npm --version
ng version
mysql --version
```

---

## Database Setup

### Step 1: Create Database

Open MySQL Workbench or command line:

```sql
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@taskflow.com', '$2b$10$YourHashedPasswordHere', 'admin');
```

### Step 2: Database Configuration

Create a `.env` file in the backend root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development
```

---

## Backend Implementation

### Step 1: Initialize Backend Project

```bash
mkdir taskflow-backend
cd taskflow-backend
npm init -y

# Install dependencies
npm install express mysql2 bcrypt jsonwebtoken dotenv cors express-validator
npm install --save-dev nodemon
```

### Step 2: Update package.json

```json
{
  "name": "taskflow-backend",
  "version": "1.0.0",
  "description": "TaskFlow Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["task-management", "rest-api"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Step 3: Create Backend Structure

```
taskflow-backend/
├── config/
│   └── db.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── .env
├── server.js
└── package.json
```

### File: `config/db.js`

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database Connected Successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
    });

module.exports = pool;
```

### File: `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                message: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'Invalid or expired token.' 
        });
    }
};

// Admin role check middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Access denied. Admin only.' 
        });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
```

### File: `controllers/authController.js`

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Register User
const register = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                message: 'User already exists with this email' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
            message: 'Server error during registration' 
        });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

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
            message: 'Server error during login' 
        });
    }
};

// Get Current User
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
            message: 'Server error' 
        });
    }
};

module.exports = { register, login, getCurrentUser };
```

### File: `controllers/taskController.js`

```javascript
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Get All Tasks (with filters)
const getTasks = async (req, res) => {
    try {
        const { priority, status, search } = req.query;
        const userId = req.user.role === 'admin' ? null : req.user.id;

        let query = 'SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE 1=1';
        const params = [];

        // Filter by user (non-admin)
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

        // Search in title/description
        if (search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await db.query(query, params);
        res.json(tasks);

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ 
            message: 'Server error fetching tasks' 
        });
    }
};

// Get Task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [tasks] = await db.query(
            'SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
            [id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        // Check authorization (non-admin can only view their own tasks)
        if (req.user.role !== 'admin' && tasks[0].user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied' 
            });
        }

        res.json(tasks[0]);

    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ 
            message: 'Server error fetching task' 
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

        const { title, description, priority, status, due_date, user_id } = req.body;

        // Admins can assign tasks to any user, regular users create for themselves
        const assignedUserId = req.user.role === 'admin' && user_id 
            ? user_id 
            : req.user.id;

        const [result] = await db.query(
            'INSERT INTO tasks (title, description, priority, status, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, priority || 'medium', status || 'pending', due_date, assignedUserId]
        );

        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ 
            message: 'Server error creating task' 
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
        const [existingTask] = await db.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        if (existingTask.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && existingTask[0].user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied' 
            });
        }

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ? WHERE id = ?',
            [title, description, priority, status, due_date, id]
        );

        res.json({ 
            message: 'Task updated successfully' 
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ 
            message: 'Server error updating task' 
        });
    }
};

// Delete Task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if task exists
        const [existingTask] = await db.query(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        if (existingTask.length === 0) {
            return res.status(404).json({ 
                message: 'Task not found' 
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' && existingTask[0].user_id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Access denied' 
            });
        }

        await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({ 
            message: 'Task deleted successfully' 
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ 
            message: 'Server error deleting task' 
        });
    }
};

// Get Task Statistics
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;

        // Total tasks
        let totalQuery = 'SELECT COUNT(*) as total FROM tasks';
        const params = [];
        
        if (userId) {
            totalQuery += ' WHERE user_id = ?';
            params.push(userId);
        }

        const [totalResult] = await db.query(totalQuery, params);

        // Tasks by status
        let statusQuery = 'SELECT status, COUNT(*) as count FROM tasks';
        const statusParams = [];
        
        if (userId) {
            statusQuery += ' WHERE user_id = ?';
            statusParams.push(userId);
        }
        
        statusQuery += ' GROUP BY status';
        const [statusResult] = await db.query(statusQuery, statusParams);

        // Tasks by priority
        let priorityQuery = 'SELECT priority, COUNT(*) as count FROM tasks';
        const priorityParams = [];
        
        if (userId) {
            priorityQuery += ' WHERE user_id = ?';
            priorityParams.push(userId);
        }
        
        priorityQuery += ' GROUP BY priority';
        const [priorityResult] = await db.query(priorityQuery, priorityParams);

        // Overdue tasks
        let overdueQuery = 'SELECT COUNT(*) as overdue FROM tasks WHERE due_date < CURDATE() AND status != "completed"';
        const overdueParams = [];
        
        if (userId) {
            overdueQuery += ' AND user_id = ?';
            overdueParams.push(userId);
        }

        const [overdueResult] = await db.query(overdueQuery, overdueParams);

        res.json({
            total: totalResult[0].total,
            byStatus: statusResult,
            byPriority: priorityResult,
            overdue: overdueResult[0].overdue
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            message: 'Server error fetching statistics' 
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

### File: `routes/authRoutes.js`

```javascript
const express = require('express');
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
], login);

// Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
```

### File: `routes/taskRoutes.js`

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

// All routes are protected
router.use(authMiddleware);

// Get all tasks (with filters)
router.get('/', getTasks);

// Get statistics
router.get('/stats', getTaskStats);

// Get single task
router.get('/:id', getTaskById);

// Create task
router.post('/', [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('due_date').optional().isISO8601().withMessage('Invalid date format')
], createTask);

// Update task
router.put('/:id', [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().trim(),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('due_date').optional().isISO8601().withMessage('Invalid date format')
], updateTask);

// Delete task
router.delete('/:id', deleteTask);

module.exports = router;
```

### File: `server.js`

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:4200', // Angular default port
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TaskFlow API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
});
```

### Step 4: Start Backend Server

```bash
# Generate hashed password for admin user
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"

# Update the INSERT query in database with the generated hash

# Start server
npm run dev
```

Test the API:
```bash
# Health check
curl http://localhost:5000/api/health
```

---

## Frontend Implementation

### Step 1: Create Angular Project

```bash
# Create new Angular project
ng new taskflow-frontend --routing --style=css
cd taskflow-frontend

# Install dependencies
npm install chart.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### Step 2: Configure Tailwind CSS

**File: `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
```

**File: `src/styles.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
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
```

### Step 3: Generate Angular Components

```bash
# Generate components
ng generate component components/login
ng generate component components/register
ng generate component components/dashboard
ng generate component components/task-list
ng generate component components/task-form
ng generate component components/task-stats

# Generate services
ng generate service services/auth
ng generate service services/task
ng generate service services/storage

# Generate guard
ng generate guard guards/auth
```

### Step 4: Environment Configuration

**File: `src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

**File: `src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

### Step 5: Create Models

**File: `src/app/models/user.model.ts`**

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
```

**File: `src/app/models/task.model.ts`**

```typescript
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
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
```

---

**Continue to Part 2 for remaining frontend implementation, authentication flow, and deployment...**

---

## Quick Start Commands

```bash
# Backend
cd taskflow-backend
npm install
npm run dev

# Frontend (new terminal)
cd taskflow-frontend
npm install
ng serve

# Access app at http://localhost:4200
```

---

*This is Part 1 of the complete implementation guide. The guide continues with detailed frontend components, routing, authentication implementation, and deployment instructions.*