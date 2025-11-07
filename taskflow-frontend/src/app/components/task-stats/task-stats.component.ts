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

  getCompletedCount(): number {
    if (!this.stats) return 0;
    return this.stats.byStatus.find(s => s.status === 'completed')?.count || 0;
  }

  getInProgressCount(): number {
    if (!this.stats) return 0;
    return this.stats.byStatus.find(s => s.status === 'in-progress')?.count || 0;
  }

}