# 📋 TaskFlow - Full-Stack Task Management Dashboard

![TaskFlow](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Angular](https://img.shields.io/badge/Angular-17-red.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![MySQL](https://img.shields.io/badge/MySQL-8+-orange.svg)

A modern, production-ready full-stack task management application built with Angular 17, Node.js, Express, and MySQL. Features JWT authentication, real-time statistics, data visualization, and a beautiful responsive UI.

## 🌟 Live Demo

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Demo Credentials**: 
  - Email: `admin@taskflow.com`
  - Password: `admin123`

---

## 📸 Screenshots

### Dashboard View
![Dashboard](screenshots/dashboard.png)

### Task Management
![Tasks](screenshots/tasks.png)

### Analytics
![Analytics](screenshots/analytics.png)

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with password hashing (bcrypt)
- Secure JWT-based authentication
- Role-based access control (Admin/User)
- Protected routes and API endpoints
- Automatic token refresh

### 📝 Task Management
- Create, Read, Update, Delete (CRUD) tasks
- Task properties:
  - Title and Description
  - Priority levels (Low, Medium, High)
  - Status tracking (Pending, In Progress, Completed)
  - Due dates
  - User assignment (for admins)
- Real-time task updates
- Task filtering by priority and status
- Search functionality

### 📊 Analytics & Visualization
- Task statistics dashboard
- Interactive charts using Chart.js:
  - Task distribution by status (Doughnut chart)
  - Task distribution by priority (Bar chart)
- Key metrics:
  - Total tasks
  - Completed tasks
  - In-progress tasks
  - Overdue tasks

### 🎨 User Interface
- Modern, minimalist design
- Fully responsive (Mobile, Tablet, Desktop)
- Tailwind CSS styling
- Smooth animations and transitions
- Color-coded priority badges
- Intuitive navigation

### 🔍 Advanced Features
- Advanced filtering system
- Search across tasks
- Input validation (frontend & backend)
- Error handling with user-friendly messages
- Loading states and animations

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 17 (Standalone Components)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **State Management**: Services + RxJS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **CORS**: cors middleware

### Development Tools
- TypeScript
- Angular CLI
- Nodemon
- Git

---

## 📁 Project Structure

TaskFlow/
├── taskflow-backend/              # Backend API
│   ├── config/
│   │   └── db.js                  # Database configuration
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT authentication
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   └── taskController.js      # Task CRUD logic
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   └── taskRoutes.js          # Task endpoints
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express server
│   └── package.json
│
└── taskflow-frontend/             # Frontend App
    ├── src/
    │   ├── app/
    │   │   ├── components/        # UI Components
    │   │   │   ├── login/
    │   │   │   ├── register/
    │   │   │   ├── dashboard/
    │   │   │   ├── task-list/
    │   │   │   ├── task-form/
    │   │   │   └── task-stats/
    │   │   ├── services/          # API Services
    │   │   │   ├── auth.service.ts
    │   │   │   ├── task.service.ts
    │   │   │   └── storage.service.ts
    │   │   ├── guards/            # Route Guards
    │   │   │   └── auth.guard.ts
    │   │   ├── interceptors/      # HTTP Interceptors
    │   │   │   └── auth.interceptor.ts
    │   │   ├── models/            # TypeScript Interfaces
    │   │   │   ├── user.model.ts
    │   │   │   └── task.model.ts
    │   │   ├── app.routes.ts      # Routing Config
    │   │   ├── app.config.ts      # App Config
    │   │   └── app.component.ts   # Root Component
    │   ├── environments/
    │   │   └── environment.ts
    │   └── styles.css             # Global Styles
    ├── tailwind.config.js
    └── package.json

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MySQL** v8+ ([Download](https://dev.mysql.com/downloads/))
- **Angular CLI** v17+ (`npm install -g @angular/cli`)
- **Git** ([Download](https://git-scm.com/))

### Installation

#### 1. Clone the Repository

git clone https://github.com/yourusername/taskflow.git
cd TaskFlow

#### 2. Database Setup

**Open MySQL and run:**

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

**Generate password hash and insert admin user:**

# Generate hash for password 'admin123'
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"

# Copy the output hash and run in MySQL:
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@taskflow.com', 'YOUR_HASH_HERE', 'admin');

#### 3. Backend Setup

cd taskflow-backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
DB_PORT=3306
JWT_SECRET=taskflow-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
EOF

# Start backend server
npm run dev

**Expected output:**
✅ MySQL Database Connected Successfully
🚀 TaskFlow API Server Started
📍 Server running on: http://localhost:5000

#### 4. Frontend Setup

cd ../taskflow-frontend

# Install dependencies
npm install

# Start development server
ng serve

**Expected output:**
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **

#### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000/api/health

---

## 📖 API Documentation

### Base URL
http://localhost:5000/api

### Authentication Endpoints

#### Register User
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

#### Login
POST /auth/login
Content-Type: application/json

{
  "email": "admin@taskflow.com",
  "password": "admin123"
}

**Response:**
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@taskflow.com",
    "role": "admin"
  }
}

#### Get Current User
GET /auth/me
Authorization: Bearer {token}

### Task Endpoints

#### Get All Tasks
GET /tasks
Authorization: Bearer {token}
Query Parameters: ?priority=high&status=pending&search=test

#### Get Task Statistics
GET /tasks/stats
Authorization: Bearer {token}

#### Get Single Task
GET /tasks/:id
Authorization: Bearer {token}

#### Create Task
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish TaskFlow application",
  "priority": "high",
  "status": "in-progress",
  "due_date": "2025-11-15"
}

#### Update Task
PUT /tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}

#### Delete Task
DELETE /tasks/:id
Authorization: Bearer {token}

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration
- [ ] User login/logout
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Filter tasks by priority
- [ ] Filter tasks by status
- [ ] Search tasks
- [ ] View statistics
- [ ] Charts rendering
- [ ] Responsive design (mobile/tablet/desktop)

### API Testing with cURL

# Health Check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskflow.com","password":"admin123"}'

# Get Tasks (replace TOKEN with actual token)
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

---

## 🎨 Customization

### Change Color Theme

Edit `tailwind.config.js`:

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#your-color',
          600: '#your-darker-color',
        }
      }
    }
  }
}

### Add New Task Field

1. **Database**: Add column to `tasks` table
2. **Backend**: Update `taskController.js` and validation
3. **Frontend**: Update `task.model.ts` and `task-form.component.html`

---

## 🚢 Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repository
4. Set environment variables
5. Deploy

### Frontend Deployment (Vercel)

# Build production
ng build --configuration production

# Deploy to Vercel
npm i -g vercel
vercel

# Set environment variables in Vercel dashboard

---

## 🐛 Troubleshooting

### Database Connection Failed
# Check MySQL is running
sudo service mysql status

# Verify credentials in .env file

### CORS Error
// In server.js, update:
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

### Port Already in Use
# Backend (kill process on port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (use different port)
ng serve --port 4201

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Express.js community
- Tailwind CSS for beautiful styling
- Chart.js for data visualization
- MySQL documentation

---

## 📈 Future Enhancements

- [ ] Dark mode toggle
- [ ] Drag-and-drop task sorting
- [ ] Email notifications
- [ ] Export tasks to CSV/PDF
- [ ] Real-time updates with Socket.io
- [ ] Task categories and tags
- [ ] Collaborative features
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: support@taskflow.com

---

## ⭐ Star This Repository

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ using Angular, Node.js, Express, and MySQL**
