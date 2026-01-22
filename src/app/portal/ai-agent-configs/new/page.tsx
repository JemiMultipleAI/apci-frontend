'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

interface Account {
  id: string;
  name: string;
}

export default function NewAgentConfigPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [formData, setFormData] = useState({
    account_id: null as string | null,
    agent_id: '',
    name: '',
    description: '',
    is_active: true,
    kb_campaigns_document_id: '',
    kb_deals_document_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        const accountsResponse = await apiClient.get('/accounts', {
          params: { page: 1, limit: 100 },
        });
        if (accountsResponse.data.success) {
          setAccounts(accountsResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agent_id.trim()) {
      setError('Agent ID is required');
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        account_id: formData.account_id || null,
        description: formData.description || null,
        kb_campaigns_document_id: formData.kb_campaigns_document_id || null,
        kb_deals_document_id: formData.kb_deals_document_id || null,
      };
      const response = await apiClient.post('/ai-agent-configs', submitData);
      router.push(`/portal/ai-agent-configs/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create agent configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Agent Configuration"
        description="Configure an ElevenLabs agent for a company"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" required>Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Customer Support Bot"
              />
              <p className="text-xs text-muted-foreground mt-1">Friendly name for this agent configuration</p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="agent_id" required>ElevenLabs Agent ID</Label>
              <Input
                id="agent_id"
                name="agent_id"
                type="text"
                required
                value={formData.agent_id}
                onChange={handleChange}
                placeholder="Enter the agent ID from ElevenLabs"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">The agent ID from your ElevenLabs dashboard</p>
            </div>

            <div>
              <Label htmlFor="account_id">Company</Label>
              <Select
                id="account_id"
                name="account_id"
                value={formData.account_id || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    account_id: e.target.value || null,
                  });
                }}
                disabled={loadingAccounts}
              >
                <option value="">Select a company (optional)</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Leave empty for system-wide configuration</p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Optional description of this agent configuration"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="kb_campaigns_document_id">Campaigns Knowledge Base Document ID</Label>
              <Input
                id="kb_campaigns_document_id"
                name="kb_campaigns_document_id"
                type="text"
                value={formData.kb_campaigns_document_id}
                onChange={handleChange}
                placeholder="Enter ElevenLabs documentation_id for campaigns KB"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the documentation_id from ElevenLabs after creating the knowledge base document from the campaigns URL</p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="kb_deals_document_id">Deals Knowledge Base Document ID</Label>
              <Input
                id="kb_deals_document_id"
                name="kb_deals_document_id"
                type="text"
                value={formData.kb_deals_document_id}
                onChange={handleChange}
                placeholder="Enter ElevenLabs documentation_id for deals KB"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter the documentation_id from ElevenLabs after creating the knowledge base document from the deals URL</p>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
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
              {saving ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

