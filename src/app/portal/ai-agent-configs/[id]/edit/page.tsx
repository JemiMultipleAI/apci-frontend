'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

interface Account {
  id: string;
  name: string;
}

export default function EditAgentConfigPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

        // Fetch agent config data
        const response = await apiClient.get(`/ai-agent-configs/${params.id}`);
        const config = response.data.data;
        setFormData({
          account_id: config.account_id || null,
          agent_id: config.agent_id,
          agent_phone_number_id: config.agent_phone_number_id || '',
          name: config.name,
          description: config.description || '',
          is_active: config.is_active,
          kb_campaigns_document_id: config.kb_campaigns_document_id || '',
          kb_deals_document_id: config.kb_deals_document_id || '',
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load agent configuration data');
      } finally {
        setLoading(false);
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, [params.id]);

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
        agent_id: formData.agent_id,
        agent_phone_number_id: formData.agent_phone_number_id || null,
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active,
        kb_campaigns_document_id: formData.kb_campaigns_document_id || null,
        kb_deals_document_id: formData.kb_deals_document_id || null,
      };
      await apiClient.put(`/ai-agent-configs/${params.id}`, submitData);
      router.push(`/portal/ai-agent-configs/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update agent configuration');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading agent configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Edit Agent Configuration</h1>
        <p className="text-gray-600">Update agent configuration information</p>
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
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

          <div className="md:col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">Note:</strong> Company association cannot be changed after creation. 
              To change this, delete and recreate the configuration.
            </p>
            <div className="mt-2 text-sm text-gray-600">
              {formData.account_id && (
                <div>Company: {accounts.find(a => a.id === formData.account_id)?.name || formData.account_id}</div>
              )}
              {!formData.account_id && (
                <div>Scope: System-wide</div>
              )}
            </div>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

