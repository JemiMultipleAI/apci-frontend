'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

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
    agent_phone_number_id: '',
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
        agent_phone_number_id: formData.agent_phone_number_id || null,
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create New Agent Configuration</h1>
        <p className="text-gray-600">Configure an ElevenLabs agent for a company</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-900">
              Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Customer Support Bot"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="text-xs text-gray-500 mt-1">Friendly name for this agent configuration</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="agent_id" className="block text-sm font-medium mb-2 text-gray-900">
              ElevenLabs Agent ID *
            </label>
            <input
              id="agent_id"
              name="agent_id"
              type="text"
              required
              value={formData.agent_id}
              onChange={handleChange}
              placeholder="Enter the agent ID from ElevenLabs"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="text-xs text-gray-500 mt-1">The agent ID from your ElevenLabs dashboard</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="agent_phone_number_id" className="block text-sm font-medium mb-2 text-gray-900">
              ElevenLabs Phone Number ID
            </label>
            <input
              id="agent_phone_number_id"
              name="agent_phone_number_id"
              type="text"
              value={formData.agent_phone_number_id}
              onChange={handleChange}
              placeholder="Enter the phone number ID from ElevenLabs"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for native Twilio calls (better latency and interruption support). 
              Get this from your ElevenLabs dashboard → Phone Numbers.
            </p>
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium mb-2 text-gray-900">
              Company
            </label>
            <select
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626] disabled:opacity-50"
            >
              <option value="">Select a company (optional)</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Leave empty for system-wide configuration</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description of this agent configuration"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="kb_campaigns_document_id" className="block text-sm font-medium mb-2 text-gray-900">
              Campaigns Knowledge Base Document ID
            </label>
            <input
              id="kb_campaigns_document_id"
              name="kb_campaigns_document_id"
              type="text"
              value={formData.kb_campaigns_document_id}
              onChange={handleChange}
              placeholder="Enter ElevenLabs documentation_id for campaigns KB"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the documentation_id from ElevenLabs after creating the knowledge base document from the campaigns URL</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="kb_deals_document_id" className="block text-sm font-medium mb-2 text-gray-900">
              Deals Knowledge Base Document ID
            </label>
            <input
              id="kb_deals_document_id"
              name="kb_deals_document_id"
              type="text"
              value={formData.kb_deals_document_id}
              onChange={handleChange}
              placeholder="Enter ElevenLabs documentation_id for deals KB"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the documentation_id from ElevenLabs after creating the knowledge base document from the deals URL</p>
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}

