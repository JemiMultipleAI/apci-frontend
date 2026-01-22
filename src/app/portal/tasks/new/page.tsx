'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function NewTaskPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    related_to_type: '',
    related_to_id: '',
    due_date: '',
    status: 'pending',
    priority: 'medium',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users', { params: { limit: 100 } });
        setUsers(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        related_to_type: formData.related_to_type || null,
        related_to_id: formData.related_to_id || null,
        due_date: formData.due_date || null,
      };
      const response = await apiClient.post('/tasks', payload);
      router.push('/portal/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Task"
        description="Add a new task to your CRM"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="title" required>Task Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="related_to_type">Related To Type</Label>
              <Select
                id="related_to_type"
                name="related_to_type"
                value={formData.related_to_type}
                onChange={handleChange}
              >
                <option value="">None</option>
                <option value="contact">Contact</option>
                <option value="account">Account</option>
                <option value="deal">Deal</option>
              </Select>
            </div>

            {formData.related_to_type && (
              <div>
                <Label htmlFor="related_to_id">Related To ID</Label>
                <Input
                  id="related_to_id"
                  name="related_to_id"
                  type="text"
                  value={formData.related_to_id}
                  onChange={handleChange}
                  placeholder="Enter ID"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

