# TaskFlow - Frontend Components & Configuration (Part 3 - FINAL)

## 3. DASHBOARD COMPONENT

### File: `src/app/components/dashboard/dashboard.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskStatsComponent } from '../task-stats/task-stats.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskListComponent, TaskStatsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    console.log('Dashboard loaded for user:', this.currentUser);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}
```

### File: `src/app/components/dashboard/dashboard.component.html`

```html
<div class="min-h-screen bg-gray-50">
  <!-- Top Navigation Bar -->
  <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left: Logo -->
        <div class="flex items-center">
          <div class="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <span class="ml-3 text-xl font-bold text-gray-900 hidden sm:block">TaskFlow</span>
        </div>

        <!-- Right: User Menu -->
        <div class="flex items-center space-x-4">
          <div class="hidden sm:flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ currentUser?.name }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ currentUser?.role }}</p>
            </div>
            <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {{ currentUser?.name?.charAt(0)?.toUpperCase() }}
            </div>
          </div>
          
          <button
            (click)="logout()"
            class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Welcome back, {{ currentUser?.name }}! 👋
      </h1>
      <p class="mt-2 text-gray-600">Here's what's happening with your tasks today.</p>
    </div>

    <!-- Statistics -->
    <app-task-stats></app-task-stats>

    <!-- Task List -->
    <div class="mt-8">
      <app-task-list></app-task-list>
    </div>
  </div>
</div>
```

### File: `src/app/components/dashboard/dashboard.component.css`

```css
/* Add any component-specific styles here if needed */
```

---

## 4. TASK STATS COMPONENT

### File: `src/app/components/task-stats/task-stats.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskStats } from '../../models/task.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-stats.component.html',
  styleUrl: './task-stats.component.css'
})
export class TaskStatsComponent implements OnInit, OnDestroy {
  stats: TaskStats | null = null;
  statusChart: any;
  priorityChart: any;
  isLoading = true;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.taskService.getStats().subscribe({
      next: (data) => {
        console.log('Stats loaded:', data);
        this.stats = data;
        this.isLoading = false;
        
        // Wait for DOM to render
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });
  }

  createCharts(): void {
    this.createStatusChart();
    this.createPriorityChart();
  }

  createStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas || !this.stats) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const statusData = this.stats.byStatus;
    const labels = statusData.map(item => this.formatLabel(item.status));
    const data = statusData.map(item => item.count);

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',   // Pending - Red
            'rgba(251, 191, 36, 0.8)',  // In Progress - Yellow
            'rgba(34, 197, 94, 0.8)'    // Completed - Green
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  createPriorityChart(): void {
    const canvas = document.getElementById('priorityChart') as HTMLCanvasElement;
    if (!canvas || !this.stats) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.priorityChart) {
      this.priorityChart.destroy();
    }

    const priorityData = this.stats.byPriority;
    const labels = priorityData.map(item => this.formatLabel(item.priority));
    const data = priorityData.map(item => item.count);

    this.priorityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tasks',
          data: data,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Low - Green
            'rgba(251, 191, 36, 0.8)',  // Medium - Yellow
            'rgba(239, 68, 68, 0.8)'    // High - Red
          ],
          borderWidth: 0,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  formatLabel(str: string): string {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  ngOnDestroy(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.priorityChart) {
      this.priorityChart.destroy();
    }
  }
}
```

### File: `src/app/components/task-stats/task-stats.component.html`

```html
<!-- Loading State -->
<div *ngIf="isLoading" class="text-center py-12">
  <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
  <p class="mt-4 text-gray-600">Loading statistics...</p>
</div>

<!-- Stats Grid -->
<div *ngIf="!isLoading && stats">
  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Tasks -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Total Tasks</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.total }}</p>
        </div>
        <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Completed Tasks -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Completed</p>
          <p class="text-3xl font-bold text-green-600 mt-2">
            {{ stats.byStatus.find(s => s.status === 'completed')?.count || 0 }}
          </p>
        </div>
        <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- In Progress -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">In Progress</p>
          <p class="text-3xl font-bold text-yellow-600 mt-2">
            {{ stats.byStatus.find(s => s.status === 'in-progress')?.count || 0 }}
          </p>
        </div>
        <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Overdue -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Overdue</p>
          <p class="text-3xl font-bold text-red-600 mt-2">{{ stats.overdue }}</p>
        </div>
        <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Status Chart -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
      <div class="h-64">
        <canvas id="statusChart"></canvas>
      </div>
    </div>

    <!-- Priority Chart -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
      <div class="h-64">
        <canvas id="priorityChart"></canvas>
      </div>
    </div>
  </div>
</div>
```

### File: `src/app/components/task-stats/task-stats.component.css`

```css
/* Add any component-specific styles here if needed */
```

---

## 5. TASK LIST COMPONENT

### File: `src/app/components/task-list/task-list.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskFilters } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = true;
  
  filters: TaskFilters = {
    priority: '',
    status: '',
    search: ''
  };

  showTaskForm = false;
  editingTask: Task | null = null;

  constructor(
    private taskService: TaskService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.filters).subscribe({
      next: (data) => {
        console.log('Tasks loaded:', data);
        this.tasks = data;
        this.filteredTasks = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadTasks();
  }

  clearFilters(): void {
    this.filters = { priority: '', status: '', search: '' };
    this.loadTasks();
  }

  openTaskForm(task?: Task): void {
    this.editingTask = task || null;
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  onTaskSaved(): void {
    this.closeTaskForm();
    this.loadTasks();
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          console.log('Task deleted');
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          alert('Failed to delete task');
        }
      });
    }
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[priority as keyof typeof classes] || '';
  }

  getStatusClass(status: string): string {
    const classes = {
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200'
    };
    return classes[status as keyof typeof classes] || '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
```

---

*Due to length, TaskList HTML and TaskForm components will be in the next file...*