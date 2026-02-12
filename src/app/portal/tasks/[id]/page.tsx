'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckSquare, Clock, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import { canDelete } from '@/utils/rolePermissions';

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
  const { role } = useUser();
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
        <div className="text-muted-foreground">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Task not found</div>
      </div>
    );
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckSquare,
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-error/20 border border-error/50 text-error',
    high: 'bg-orange-500/20 border border-orange-500/50 text-orange-400',
    medium: 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400',
    low: 'bg-primary/20 border border-primary/50 text-primary',
  };

  const StatusIcon = statusIcons[task.status] || Clock;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{task.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
          <span className="rounded-full bg-surface-elevated border border-border px-3 py-1 text-sm font-medium capitalize text-foreground">
            {task.status.replace('_', ' ')}
          </span>
          {canDelete(role) && (
            <Button variant="danger" size="sm" className="p-2" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4 shadow-xl">
            <p className="text-muted-foreground mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isOverdue && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/20 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">This task is overdue</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
            {task.description ? (
              <p className="text-foreground whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-muted-foreground">No description provided</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1">
                  <span className="rounded-full bg-surface-elevated border border-border px-2 py-1 text-xs font-medium capitalize text-foreground">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Priority</div>
                <div className="mt-1">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              {task.assigned_to_name && (
                <div>
                  <div className="text-sm text-muted-foreground">Assigned To</div>
                  <div className="mt-1 text-foreground">{task.assigned_to_name}</div>
                </div>
              )}
              {task.due_date && (
                <div>
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className={`mt-1 ${isOverdue ? 'text-yellow-400 font-medium' : 'text-foreground'}`}>
                    {new Date(task.due_date).toLocaleString()}
                  </div>
                </div>
              )}
              {task.related_to_type && task.related_to_id && (
                <div>
                  <div className="text-sm text-muted-foreground">Related To</div>
                  <div className="mt-1">
                    <Link
                      href={`/portal/${task.related_to_type === 'account' ? 'accounts' : task.related_to_type === 'contact' ? 'contacts' : 'deals'}/${task.related_to_id}`}
                      className="text-primary hover:underline capitalize"
                    >
                      {task.related_to_type} - View
                    </Link>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="mt-1 text-foreground">
                  {new Date(task.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="mt-1 text-foreground">
                  {new Date(task.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

