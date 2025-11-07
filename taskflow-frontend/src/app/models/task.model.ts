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