'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Calendar, Trash2, Edit, Building2, Copy, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface AgentConfig {
  id: string;
  account_id: string | null;
  agent_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  kb_campaigns_document_id?: string | null;
  kb_deals_document_id?: string | null;
  created_at: string;
  updated_at: string;
  account_name: string | null;
  knowledge_base_urls?: {
    campaigns: string;
    deals: string;
  } | null;
}

export default function AgentConfigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiClient.get(`/ai-agent-configs/${params.id}`);
        setConfig(response.data.data);
      } catch (error) {
        console.error('Failed to fetch agent config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [params.id]);

  const handleDelete = async () => {
    if (!config) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/ai-agent-configs/${config.id}`);
      router.push('/portal/ai-agent-configs');
    } catch (error: any) {
      console.error('Failed to delete agent config:', error);
      alert(error.response?.data?.error?.message || 'Failed to delete agent configuration. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyToClipboard = async (text: string, urlType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(urlType);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRefreshKnowledgeBase = async () => {
    if (!config) return;
    
    setRefreshing(true);
    setRefreshMessage(null);
    
    try {
      const response = await apiClient.post(`/ai-agent-configs/${config.id}/refresh-knowledge-base`);
      setRefreshMessage({
        type: 'success',
        text: response.data.message || 'Knowledge base refreshed successfully',
      });
      // Clear message after 5 seconds
      setTimeout(() => setRefreshMessage(null), 5000);
    } catch (error: any) {
      setRefreshMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to refresh knowledge base. Please try again.',
      });
      // Clear message after 5 seconds
      setTimeout(() => setRefreshMessage(null), 5000);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading agent configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Agent configuration not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50 transition-colors text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {config.name}
          </h1>
          <p className="text-gray-600">AI Agent Configuration Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Configuration Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Agent ID</div>
                  <div className="text-gray-900 font-mono text-sm">{config.agent_id}</div>
                </div>
              </div>
              
              {config.description && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Description</div>
                  <div className="text-gray-900">{config.description}</div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Company</div>
                  <div className="text-gray-900">
                    {config.account_name ? (
                      <Link
                        href={`/portal/accounts/${config.account_id}`}
                        className="hover:underline text-[#DC2626]"
                      >
                        {config.account_name}
                      </Link>
                    ) : (
                      <span className="text-gray-500 italic">System-wide</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Created {new Date(config.created_at).toLocaleDateString()}
                </span>
              </div>
              {config.updated_at && config.updated_at !== config.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Updated {new Date(config.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {config.account_id && config.knowledge_base_urls && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Knowledge Base URLs</h2>
                <button
                  onClick={handleRefreshKnowledgeBase}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh KB'}
                </button>
              </div>
              {refreshMessage && (
                <div
                  className={`mb-4 rounded-lg border p-3 text-sm ${
                    refreshMessage.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {refreshMessage.text}
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Copy these URLs to configure in ElevenLabs agent settings as knowledge base sources.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaigns Knowledge Base
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={config.knowledge_base_urls.campaigns}
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-900"
                    />
                    <button
                      onClick={() => copyToClipboard(config.knowledge_base_urls!.campaigns, 'campaigns')}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === 'campaigns' ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deals Knowledge Base
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={config.knowledge_base_urls.deals}
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-900"
                    />
                    <button
                      onClick={() => copyToClipboard(config.knowledge_base_urls!.deals, 'deals')}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === 'deals' ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      config.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {config.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Scope</div>
                <div className="mt-1 text-gray-900">
                  {config.account_id ? 'Company' : 'System-wide'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <Link
              href={`/portal/ai-agent-configs/${config.id}/edit`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              <Edit className="h-4 w-4" />
              Edit Configuration
            </Link>
            {(config.kb_campaigns_document_id || config.kb_deals_document_id) && (
              <button
                onClick={handleRefreshKnowledgeBase}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Knowledge Base'}
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Configuration
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Delete Agent Configuration</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete &quot;{config.name}&quot;? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

