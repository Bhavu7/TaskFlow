import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { ToastService } from '../../services/toast.service';

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

  formData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed';
    due_date: string;
  } = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: ''
    };

  isLoading = false;
  errorMessage = '';

  constructor(private taskService: TaskService, private toastService: ToastService) { }

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
      this.toastService.warning('Validation Error', 'Title is required');
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
        const action = this.task ? 'updated' : 'created';
        this.toastService.success(
          'Success!',
          `Task ${action} successfully`
        );
        this.taskSaved.emit();
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to save task';
        this.toastService.error('Error', this.errorMessage);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}