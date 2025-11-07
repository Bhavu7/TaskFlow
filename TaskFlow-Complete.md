# TaskFlow - Task Form & Additional Components

---

## Task Form Component (Modal)

### File: `src/app/components/task-form/task-form.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() taskSaved = new EventEmitter<void>();

  formData = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description || '',
        priority: this.task.priority,
        status: this.task.status,
        due_date: this.task.due_date || ''
      };
    }
  }

  onSubmit(): void {
    if (!this.formData.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const taskData = {
      ...this.formData,
      due_date: this.formData.due_date || null
    };

    const request = this.task
      ? this.taskService.updateTask(this.task.id, taskData)
      : this.taskService.createTask(taskData);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.taskSaved.emit();
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to save task';
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
```

### File: `src/app/components/task-form/task-form.component.html`

```html
<!-- Modal Backdrop -->
<div
  *ngIf="show"
  class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  (click)="closeModal()"
>
  <!-- Modal Content -->
  <div
    class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    (click)="$event.stopPropagation()"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ task ? 'Edit Task' : 'Create New Task' }}
      </h2>
      <button
        (click)="closeModal()"
        class="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Modal Body -->
    <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="p-6">
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>

      <div class="space-y-5">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Task Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            [(ngModel)]="formData.title"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            [(ngModel)]="formData.description"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter task description (optional)"
          ></textarea>
        </div>

        <!-- Priority & Status Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Priority -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              [(ngModel)]="formData.priority"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              [(ngModel)]="formData.status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label for="due_date" class="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            [(ngModel)]="formData.due_date"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          (click)="closeModal()"
          class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="!taskForm.form.valid || isLoading"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task') }}
        </button>
      </div>
    </form>
  </div>
</div>
```

---

## Complete Task List Component HTML

### File: `src/app/components/task-list/task-list.component.html`

```html
<div class="bg-white rounded-xl shadow-sm border border-gray-200">
  <!-- Header -->
  <div class="p-6 border-b border-gray-200">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <h2 class="text-2xl font-bold text-gray-900">My Tasks</h2>
      
      <button
        (click)="openTaskForm()"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        New Task
      </button>
    </div>

    <!-- Filters -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="md:col-span-2">
        <input
          type="text"
          [(ngModel)]="filters.search"
          (ngModelChange)="applyFilters()"
          placeholder="Search tasks..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Priority Filter -->
      <div>
        <select
          [(ngModel)]="filters.priority"
          (ngModelChange)="applyFilters()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <select
          [(ngModel)]="filters.status"
          (ngModelChange)="applyFilters()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Clear Filters -->
    <div class="mt-4" *ngIf="filters.priority || filters.status || filters.search">
      <button
        (click)="clearFilters()"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  </div>

  <!-- Task List -->
  <div class="p-6">
    <!-- Empty State -->
    <div *ngIf="filteredTasks.length === 0" class="text-center py-12">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
      <p class="mt-2 text-sm text-gray-500">Get started by creating a new task.</p>
      <button
        (click)="openTaskForm()"
        class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Create Task
      </button>
    </div>

    <!-- Task Cards -->
    <div class="space-y-4" *ngIf="filteredTasks.length > 0">
      <div
        *ngFor="let task of filteredTasks"
        class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
      >
        <div class="flex items-start justify-between">
          <!-- Task Info -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ task.title }}</h3>
              
              <!-- Priority Badge -->
              <span
                class="px-2 py-1 text-xs font-medium rounded-full border"
                [ngClass]="getPriorityClass(task.priority)"
              >
                {{ task.priority | titlecase }}
              </span>

              <!-- Status Badge -->
              <span
                class="px-2 py-1 text-xs font-medium rounded-full border"
                [ngClass]="getStatusClass(task.status)"
              >
                {{ task.status === 'in-progress' ? 'In Progress' : (task.status | titlecase) }}
              </span>
            </div>

            <p class="text-gray-600 text-sm mb-3" *ngIf="task.description">
              {{ task.description }}
            </p>

            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ task.due_date ? formatDate(task.due_date) : 'No due date' }}
              </div>

              <div class="flex items-center" *ngIf="authService.isAdmin()">
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                {{ task.user_name }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 ml-4">
            <button
              (click)="openTaskForm(task)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit task"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>

            <button
              (click)="deleteTask(task.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete task"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Task Form Modal -->
<app-task-form
  [show]="showTaskForm"
  [task]="editingTask"
  (close)="closeTaskForm()"
  (taskSaved)="onTaskSaved()"
></app-task-form>
```

---

## Package.json Updates

### Backend: `package.json`

```json
{
  "name": "taskflow-backend",
  "version": "1.0.0",
  "description": "TaskFlow REST API",
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

### Frontend: `package.json` additions

```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "chart.js": "^4.4.1",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.2"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.2.2"
  }
}
```

---

## Testing Guide

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Access protected routes without token (should redirect to login)
- [ ] Logout functionality

#### Task Operations (CRUD)
- [ ] Create new task
- [ ] View all tasks
- [ ] Edit existing task
- [ ] Delete task
- [ ] Filter by priority
- [ ] Filter by status
- [ ] Search tasks by title/description

#### Dashboard & Analytics
- [ ] View task statistics
- [ ] Chart displays correctly (Status & Priority)
- [ ] Overdue tasks count accurate
- [ ] Total tasks count matches

#### Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Sidebar toggle on mobile

---

## Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution:**
```bash
# Check MySQL service is running
sudo service mysql status

# Verify credentials in .env file
# Make sure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are correct
```

### Issue 2: CORS Error
**Solution:** Update `server.js`:
```javascript
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
```

### Issue 3: JWT Token Not Sent
**Solution:** Ensure interceptor is properly configured in `app.config.ts`

### Issue 4: Chart Not Rendering
**Solution:**
```bash
# Reinstall chart.js
npm uninstall chart.js
npm install chart.js@^4.4.1
```

---

## Environment Variables Summary

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## Git Setup

```bash
# Initialize git
git init

# Create .gitignore
echo "node_modules/
.env
dist/
.angular/
.vscode/" > .gitignore

# Initial commit
git add .
git commit -m "Initial commit: TaskFlow - Full Stack Task Management App"

# Add remote and push
git remote add origin your-github-repo-url
git branch -M main
git push -u origin main
```

---

## Performance Optimization Tips

1. **Backend:**
   - Use database connection pooling ✅ (Already implemented)
   - Add pagination for large task lists
   - Implement caching for frequently accessed data

2. **Frontend:**
   - Use `OnPush` change detection strategy
   - Lazy load components
   - Optimize bundle size with `ng build --configuration production`

3. **Database:**
   - Add indexes on frequently queried columns
   - Optimize JOIN queries
   - Regular database maintenance

---

## Project Structure Overview

```
TaskFlow/
├── taskflow-backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── taskflow-frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/
    │   │   │   ├── register/
    │   │   │   ├── dashboard/
    │   │   │   ├── task-list/
    │   │   │   ├── task-form/
    │   │   │   └── task-stats/
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   ├── task.service.ts
    │   │   │   └── storage.service.ts
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts
    │   │   ├── models/
    │   │   │   ├── user.model.ts
    │   │   │   └── task.model.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.config.ts
    │   │   └── app.component.ts
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.prod.ts
    │   └── styles.css
    ├── tailwind.config.js
    └── package.json
```

---

**You now have everything needed to build, test, and deploy TaskFlow! 🚀**

This is a production-ready, portfolio-quality full-stack application that demonstrates:
- ✅ Modern Angular 17 with standalone components
- ✅ RESTful API with Express.js
- ✅ MySQL database integration
- ✅ JWT authentication & authorization
- ✅ Role-based access control
- ✅ Data visualization with Chart.js
- ✅ Responsive Tailwind CSS design
- ✅ Complete CRUD operations
- ✅ Input validation & error handling
- ✅ Professional code structure