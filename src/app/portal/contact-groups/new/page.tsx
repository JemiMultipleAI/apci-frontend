'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function NewContactGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/contact-groups', {
        name: formData.name,
        description: formData.description || null,
      });
      router.push('/portal/contact-groups');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create contact group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal/contact-groups"
          className="text-text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title="New Contact Group"
          description="Create a new contact group for campaign targeting"
        />
      </div>

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
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/portal/contact-groups')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

