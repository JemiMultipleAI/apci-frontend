'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckSquare, Clock, AlertCircle, Trash2, Edit, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  related_to_type: string | null;
  related_to_id: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await apiClient.get(`/tasks/${params.id}`);
        setTask(response.data.data);
      } catch (error) {
        console.error('Failed to fetch task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  const handleDelete = async () => {
    if (!task) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      router.push('/portal/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Task not found</div>
      </div>
    );
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckSquare,
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const StatusIcon = statusIcons[task.status] || Clock;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border p-2 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-6 w-6 text-red-200/80" />
            <h1 className="text-3xl font-semibold tracking-tight text-white">{task.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize">
            {task.status.replace('_', ' ')}
          </span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-800/50 bg-red-900/30 p-2 text-red-400 hover:bg-red-900/50 transition-colors"
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/30 p-4">
          <p className="text-red-200 mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-red-800/50 bg-red-900/30 px-4 py-2 text-white hover:bg-red-900/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isOverdue && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50/50 p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">This task is overdue</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Description</h2>
            {task.description ? (
              <p className="text-white whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-red-200/70">No description provided</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-red-200/70">Status</div>
                <div className="mt-1">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-red-200/70">Priority</div>
                <div className="mt-1">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              {task.assigned_to_name && (
                <div>
                  <div className="text-sm text-red-200/70">Assigned To</div>
                  <div className="mt-1 text-white">{task.assigned_to_name}</div>
                </div>
              )}
              {task.due_date && (
                <div>
                  <div className="text-sm text-red-200/70">Due Date</div>
                  <div className={`mt-1 ${isOverdue ? 'text-yellow-400 font-medium' : 'text-white'}`}>
                    {new Date(task.due_date).toLocaleString()}
                  </div>
                </div>
              )}
              {task.related_to_type && task.related_to_id && (
                <div>
                  <div className="text-sm text-red-200/70">Related To</div>
                  <div className="mt-1">
                    <Link
                      href={`/portal/${task.related_to_type === 'account' ? 'accounts' : task.related_to_type === 'contact' ? 'contacts' : 'deals'}/${task.related_to_id}`}
                      className="text-white hover:underline capitalize"
                    >
                      {task.related_to_type} - View
                    </Link>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-red-200/70">Created</div>
                <div className="mt-1 text-white">
                  {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-red-200/70">Last Updated</div>
                <div className="mt-1 text-white">
                  {new Date(task.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

