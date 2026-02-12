'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Trash2, Play, Pause, Users, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import { hasPermission, canUpdate, canDelete } from '@/utils/rolePermissions';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  channel: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  metadata: any;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  webhook_urls?: {
    email?: string;
    email_note?: string;
    email_provider?: string;
    email_provider_note?: string;
    sms?: string;
    sms_note?: string;
    sms_twilio?: string;
    sms_twilio_note?: string;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export default function CampaignDetailPage() {
  const { role } = useUser();
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await apiClient.get(`/campaigns/${params.id}`);
        setCampaign(response.data.data);
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params.id]);

  const handleDelete = async () => {
    if (!campaign) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/campaigns/${campaign.id}`);
      router.push('/portal/campaigns');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('Failed to delete campaign. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleActivate = async () => {
    if (!campaign) return;
    try {
      await apiClient.post(`/campaigns/${campaign.id}/activate`);
      const response = await apiClient.get(`/campaigns/${params.id}`);
      setCampaign(response.data.data);
    } catch (error) {
      console.error('Failed to activate campaign:', error);
      alert('Failed to activate campaign. Please try again.');
    }
  };

  const handlePause = async () => {
    if (!campaign) return;
    try {
      await apiClient.post(`/campaigns/${campaign.id}/pause`);
      const response = await apiClient.get(`/campaigns/${params.id}`);
      setCampaign(response.data.data);
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      alert('Failed to pause campaign. Please try again.');
    }
  };

  useEffect(() => {
    if (showExecuteModal) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
          const response = await apiClient.get('/contacts', { params: { page: 1, limit: 200 } });
          setContacts(response.data.data);
          
          // Pre-select contacts from campaign metadata if available
          if (campaign?.metadata?.contact_ids && Array.isArray(campaign.metadata.contact_ids)) {
            setSelectedContactIds(new Set(campaign.metadata.contact_ids));
          }
        } catch (error) {
          console.error('Failed to fetch contacts:', error);
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [showExecuteModal, campaign]);

  const handleContactToggle = (contactId: string) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const handleSelectAllContacts = () => {
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contacts.map(c => c.id)));
    }
  };

  const handleExecute = async () => {
    if (!campaign) return;

    // Check if campaign has contact groups in metadata - execute directly
    const hasContactGroups = campaign.metadata?.contact_group_ids && 
                             Array.isArray(campaign.metadata.contact_group_ids) && 
                             campaign.metadata.contact_group_ids.length > 0;
    
    // For reactivation campaigns or campaigns with contact groups, execute directly
    if (campaign.type === 'reactivation' || hasContactGroups) {
      let confirmMessage = 'Are you sure you want to execute this campaign?';
      if (campaign.type === 'reactivation') {
        confirmMessage = 'Are you sure you want to execute this reactivation campaign? This will automatically find dormant contacts and send messages.';
      } else if (hasContactGroups) {
        confirmMessage = 'Are you sure you want to execute this campaign? This will send messages to all contacts in the selected contact groups.';
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      setExecuting(true);
      try {
        await apiClient.post(`/campaigns/${campaign.id}/execute`);
        alert('Campaign executed successfully!');
        const response = await apiClient.get(`/campaigns/${params.id}`);
        setCampaign(response.data.data);
      } catch (error: any) {
        console.error('Failed to execute campaign:', error);
        alert(error.response?.data?.error?.message || 'Failed to execute campaign. Please try again.');
      } finally {
        setExecuting(false);
      }
      return;
    }

    // For campaigns without contact groups, show contact selection modal for manual selection
    setShowExecuteModal(true);
  };

  const handleConfirmExecute = async () => {
    if (!campaign) return;

    // Check if contacts are selected (unless reactivation)
    if (campaign.type !== 'reactivation' && selectedContactIds.size === 0) {
      alert('Please select at least one contact to send the campaign to.');
      return;
    }

    if (!confirm(`Are you sure you want to execute this campaign? This will send messages to ${selectedContactIds.size} contact(s).`)) {
      return;
    }
    
    setExecuting(true);
    try {
      const payload: any = {};
      
      // Send selected contact IDs if manually selected
      if (selectedContactIds.size > 0) {
        payload.contact_ids = Array.from(selectedContactIds);
      }

      await apiClient.post(`/campaigns/${campaign.id}/execute`, payload);
      alert('Campaign executed successfully!');
      setShowExecuteModal(false);
      const response = await apiClient.get(`/campaigns/${params.id}`);
      setCampaign(response.data.data);
      setSelectedContactIds(new Set());
    } catch (error: any) {
      console.error('Failed to execute campaign:', error);
      alert(error.response?.data?.error?.message || 'Failed to execute campaign. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Campaign not found</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-surface-elevated border border-border text-foreground',
    scheduled: 'bg-primary/20 border border-primary/50 text-primary',
    running: 'bg-green-500/20 border border-green-500/50 text-green-400',
    paused: 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400',
    completed: 'bg-purple-500/20 border border-purple-500/50 text-purple-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">
            {campaign.type} campaign via {campaign.channel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[campaign.status] || 'bg-surface-elevated border border-border text-foreground'
            }`}
          >
            {campaign.status}
          </span>
          {hasPermission(role, 'canManageCampaigns') && campaign.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={handleActivate} className="p-2 text-green-400 border-green-500/50 hover:bg-green-500/20" title="Activate Campaign">
              <Play className="h-4 w-4" />
            </Button>
          )}
          {hasPermission(role, 'canManageCampaigns') && campaign.status === 'running' && (
            <Button variant="outline" size="sm" onClick={handlePause} className="p-2 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/20" title="Pause Campaign">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {hasPermission(role, 'canExecuteCampaigns') && (
            <Button variant="secondary" size="sm" onClick={handleExecute} disabled={executing}>
              {executing ? 'Executing...' : 'Execute'}
            </Button>
          )}
          {canUpdate(role) && (
            <Link href={`/portal/campaigns/${campaign.id}/edit`}>
              <Button variant="outline" size="sm" className="p-2">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {canDelete(role) && (
            <Button variant="danger" size="sm" className="p-2" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Delete Campaign</h2>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Campaign Information</h2>
            <div className="space-y-4">
              {campaign.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div className="text-foreground whitespace-pre-wrap">{campaign.description}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <div className="text-foreground capitalize">{campaign.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Channel</div>
                <div className="text-foreground uppercase">{campaign.channel}</div>
              </div>
              {campaign.start_date && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                  <div className="text-foreground">
                    {new Date(campaign.start_date).toLocaleString()}
                  </div>
                </div>
              )}
              {campaign.end_date && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">End Date</div>
                  <div className="text-foreground">
                    {new Date(campaign.end_date).toLocaleString()}
                  </div>
                </div>
              )}
              {campaign.metadata?.days_inactive && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Days Inactive</div>
                  <div className="text-foreground">{campaign.metadata.days_inactive} days</div>
                </div>
              )}
              {campaign.metadata?.contact_ids && Array.isArray(campaign.metadata.contact_ids) && campaign.metadata.contact_ids.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Target Contacts</div>
                  <div className="text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {campaign.metadata.contact_ids.length} contact{campaign.metadata.contact_ids.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
              {campaign.type === 'reactivation' && !campaign.metadata?.contact_ids && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Target Contacts</div>
                  <div className="text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Automatic (dormant contacts)
                  </div>
                </div>
              )}
              {(campaign.webhook_urls?.email || campaign.webhook_urls?.email_provider || campaign.webhook_urls?.sms || campaign.webhook_urls?.sms_twilio) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-3 font-semibold">Webhook URLs for Inbound Replies</div>
                  <div className="space-y-3">
                    {campaign.webhook_urls.email_provider && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                          <span>Email Webhook (Provider Dashboard)</span>
                          <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/50 rounded text-[10px] text-primary">Recommended</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-foreground break-all">
                            {campaign.webhook_urls.email_provider}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.email_provider!);
                              alert('Email provider webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.email_provider_note && (
                          <div className="text-xs text-muted-foreground mt-1">{campaign.webhook_urls.email_provider_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.email && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email Webhook (Token-based)</div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-foreground break-all">
                            {campaign.webhook_urls.email}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.email!);
                              alert('Webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.email_note && (
                          <div className="text-xs text-muted-foreground mt-1">{campaign.webhook_urls.email_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.sms_twilio && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                          <span>SMS Webhook (Twilio)</span>
                          <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/50 rounded text-[10px] text-primary">Recommended</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-foreground break-all">
                            {campaign.webhook_urls.sms_twilio}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.sms_twilio!);
                              alert('Twilio webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.sms_twilio_note && (
                          <div className="text-xs text-muted-foreground mt-1">{campaign.webhook_urls.sms_twilio_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.sms && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">SMS Webhook (Token-based)</div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-foreground break-all">
                            {campaign.webhook_urls.sms}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.sms!);
                              alert('Token-based webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.sms_note && (
                          <div className="text-xs text-muted-foreground mt-1">{campaign.webhook_urls.sms_note}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
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
                      statusColors[campaign.status] || 'bg-surface-elevated border border-border text-foreground'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>
              {campaign.created_by_name && (
                <div>
                  <div className="text-sm text-muted-foreground">Created By</div>
                  <div className="mt-1 text-foreground">{campaign.created_by_name}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="mt-1 text-foreground">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="mt-1 text-foreground">
                  {new Date(campaign.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Execute Modal */}
      {showExecuteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Select Contacts to Target</h2>
            
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  Select contacts to send this campaign to
                </p>
                <button
                  type="button"
                  onClick={handleSelectAllContacts}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedContactIds.size === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="rounded-lg border border-border bg-surface-elevated max-h-96 overflow-y-auto p-3">
                {loadingContacts ? (
                  <div className="text-center text-muted-foreground py-4">Loading contacts...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No contacts found</div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-surface cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContactIds.has(contact.id)}
                          onChange={() => handleContactToggle(contact.id)}
                          className="rounded border-border bg-background text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm text-foreground">
                          {contact.first_name} {contact.last_name}
                          {contact.email && <span className="text-muted-foreground ml-2">({contact.email})</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedContactIds.size} contact{selectedContactIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowExecuteModal(false);
                  setSelectedContactIds(new Set());
                }}
                disabled={executing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmExecute}
                disabled={executing || selectedContactIds.size === 0}
              >
                {executing ? 'Executing...' : `Execute (${selectedContactIds.size})`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

