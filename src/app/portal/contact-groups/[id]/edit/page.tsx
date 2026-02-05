'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function EditContactGroupPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await apiClient.get(`/contact-groups/${params.id}`);
        const group = response.data.data;
        setFormData({
          name: group.name,
          description: group.description || '',
        });
      } catch (error) {
        console.error('Failed to fetch contact group:', error);
        setError('Failed to load contact group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await apiClient.put(`/contact-groups/${params.id}`, {
        name: formData.name,
        description: formData.description || null,
      });
      router.push(`/portal/contact-groups/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update contact group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading contact group...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Contact Group"
        description="Update contact group information"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="name" required>Group Name</Label>
            <Input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., VIP Customers, Dormant Contacts"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this contact group"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/portal/contact-groups/${params.id}`}>
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

