'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Calendar, Trash2, Edit, Building2, Copy, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';

interface AgentConfig {
  id: string;
  account_id: string | null;
  agent_id: string;
  agent_phone_number_id?: string | null;
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
        <div className="text-muted-foreground">Loading agent configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Agent configuration not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {config.name}
          </h1>
          <p className="text-muted-foreground">AI Agent Configuration Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Configuration Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Agent ID</div>
                  <div className="text-foreground font-mono text-sm">{config.agent_id}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone Number ID</div>
                  <div className="text-foreground font-mono text-sm">
                    {config.agent_phone_number_id ? (
                      config.agent_phone_number_id
                    ) : (
                      <span className="text-muted-foreground italic">Not configured</span>
                    )}
                  </div>
                </div>
              </div>
              
              {config.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div className="text-foreground">{config.description}</div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Company</div>
                  <div className="text-foreground">
                    {config.account_name ? (
                      <Link
                        href={`/portal/accounts/${config.account_id}`}
                        className="hover:underline text-primary"
                      >
                        {config.account_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic">System-wide</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Created {new Date(config.created_at).toLocaleDateString()}
                </span>
              </div>
              {config.updated_at && config.updated_at !== config.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(config.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {config.account_id && config.knowledge_base_urls && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Knowledge Base URLs</h2>
                <Button variant="secondary" size="sm" onClick={handleRefreshKnowledgeBase} disabled={refreshing} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh KB'}
                </Button>
              </div>
              {refreshMessage && (
                <div
                  className={`mb-4 rounded-lg border p-3 text-sm ${
                    refreshMessage.type === 'success'
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-error/20 border-error/50 text-error'
                  }`}
                >
                  {refreshMessage.text}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Copy these URLs to configure in ElevenLabs agent settings as knowledge base sources.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Campaigns Knowledge Base
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={config.knowledge_base_urls.campaigns}
                      className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-mono text-foreground"
                    />
                    <Button variant="secondary" size="sm" onClick={() => copyToClipboard(config.knowledge_base_urls!.campaigns, 'campaigns')} className="gap-2">
                      {copiedUrl === 'campaigns' ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Deals Knowledge Base
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={config.knowledge_base_urls.deals}
                      className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-mono text-foreground"
                    />
                    <Button variant="secondary" size="sm" onClick={() => copyToClipboard(config.knowledge_base_urls!.deals, 'deals')} className="gap-2">
                      {copiedUrl === 'deals' ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      config.is_active
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-surface-elevated border border-border text-muted-foreground'
                    }`}
                  >
                    {config.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Scope</div>
                <div className="mt-1 text-foreground">
                  {config.account_id ? 'Company' : 'System-wide'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Link
              href={`/portal/ai-agent-configs/${config.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Configuration
            </Link>
            {(config.kb_campaigns_document_id || config.kb_deals_document_id) && (
              <Button variant="secondary" className="w-full gap-2" onClick={handleRefreshKnowledgeBase} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Knowledge Base'}
              </Button>
            )}
            <Button variant="danger" className="w-full gap-2" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Configuration
            </Button>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Agent Configuration</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete &quot;{config.name}&quot;? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

