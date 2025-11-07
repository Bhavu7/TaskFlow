import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() { }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  show(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      duration: toast.duration || 5000
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        this.remove(newToast.id);
      }, newToast.duration);
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number): void {
    this.show({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
