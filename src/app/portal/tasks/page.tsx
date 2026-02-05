'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckSquare, Clock, AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to_name: string | null;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params: any = { page: 1, limit: 100 };
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await apiClient.get('/tasks', { params });
        setTasks(response.data.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filter]);

  const priorityColors: Record<string, string> = {
    urgent: 'bg-error/20 text-error',
    high: 'bg-warning/20 text-warning',
    medium: 'bg-warning/20 text-warning',
    low: 'bg-primary/20 text-primary',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckSquare,
  };

  const filteredTasks = tasks.filter(
    task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      if (!matchesFilter) return false;
      
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.assigned_to_name && task.assigned_to_name.toLowerCase().includes(searchLower))
      );
    }
  );

  const overdueTasks = filteredTasks.filter(
    task => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and follow-ups
          </p>
        </div>
        <Link
          href="/portal/tasks/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex gap-2">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-gradient-tech text-white'
                    : 'border border-border bg-surface text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {overdueTasks.length > 0 && (
          <div className="mb-4 rounded-lg border border-warning bg-warning/20 p-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No tasks found' : 'No tasks found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/tasks/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const StatusIcon = statusIcons[task.status] || Clock;
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              
              return (
                <Link
                  key={task.id}
                  href={`/portal/tasks/${task.id}`}
                  className={`block rounded-lg border border-border bg-surface-elevated p-4 hover:bg-secondary transition-colors ${
                    isOverdue ? 'border-warning bg-warning/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.assigned_to_name && (
                          <span>Assigned to: {task.assigned_to_name}</span>
                        )}
                        {task.due_date && (
                          <span className={isOverdue ? 'text-warning font-medium' : ''}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-1 text-xs font-medium text-text-secondary capitalize">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
