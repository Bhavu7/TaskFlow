import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskFilters } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ToastService } from '../../services/toast.service';

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
    public authService: AuthService,
    private toastService: ToastService
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
          this.toastService.success('Task Deleted', 'Task has been deleted successfully');
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.toastService.error('Delete Failed', 'Failed to delete task. Please try again.');
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