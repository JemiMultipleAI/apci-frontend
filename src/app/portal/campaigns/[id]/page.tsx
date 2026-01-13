'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Calendar, Trash2, Play, Pause, Users, FileText, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

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
        <div className="text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Campaign not found</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    running: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 text-gray-900" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{campaign.name}</h1>
          <p className="text-gray-600 mt-1">
            {campaign.type} campaign via {campaign.channel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[campaign.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {campaign.status}
          </span>
          {campaign.status === 'draft' && (
          <button
            onClick={handleActivate}
            className="rounded-lg border border-green-300 bg-green-50 p-2 text-green-700 hover:bg-green-100 transition-colors"
            title="Activate Campaign"
          >
            <Play className="h-4 w-4" />
          </button>
          )}
          {campaign.status === 'running' && (
            <button
              onClick={handlePause}
              className="rounded-lg border border-yellow-300 bg-yellow-50 p-2 text-yellow-700 hover:bg-yellow-100 transition-colors"
              title="Pause Campaign"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleExecute}
            disabled={executing}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {executing ? 'Executing...' : 'Execute'}
          </button>
          <Link
            href={`/portal/campaigns/${campaign.id}/edit`}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-300 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-colors"
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Campaign</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Campaign Information</h2>
            <div className="space-y-4">
              {campaign.description && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Description</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{campaign.description}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 mb-1">Type</div>
                <div className="text-gray-900 capitalize">{campaign.type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Channel</div>
                <div className="text-gray-900 uppercase">{campaign.channel}</div>
              </div>
              {campaign.start_date && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="text-gray-900">
                    {new Date(campaign.start_date).toLocaleString()}
                  </div>
                </div>
              )}
              {campaign.end_date && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">End Date</div>
                  <div className="text-gray-900">
                    {new Date(campaign.end_date).toLocaleString()}
                  </div>
                </div>
              )}
              {/* Template section hidden - templates are deprecated */}
              {/* Survey section hidden - under development */}
              {campaign.metadata?.days_inactive && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Days Inactive</div>
                  <div className="text-gray-900">{campaign.metadata.days_inactive} days</div>
                </div>
              )}
              {campaign.metadata?.contact_ids && Array.isArray(campaign.metadata.contact_ids) && campaign.metadata.contact_ids.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Contacts</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {campaign.metadata.contact_ids.length} contact{campaign.metadata.contact_ids.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
              {campaign.type === 'reactivation' && !campaign.metadata?.contact_ids && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Contacts</div>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Automatic (dormant contacts)
                  </div>
                </div>
              )}
              {(campaign.webhook_urls?.email || campaign.webhook_urls?.email_provider || campaign.webhook_urls?.sms || campaign.webhook_urls?.sms_twilio) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-3 font-semibold">Webhook URLs for Inbound Replies</div>
                  <div className="space-y-3">
                    {campaign.webhook_urls.email_provider && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                          <span>Email Webhook (Provider Dashboard)</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 border border-blue-300 rounded text-[10px] text-blue-800">Recommended</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-gray-900 break-all">
                            {campaign.webhook_urls.email_provider}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.email_provider!);
                              alert('Email provider webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.email_provider_note && (
                          <div className="text-xs text-gray-500 mt-1">{campaign.webhook_urls.email_provider_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.email && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Email Webhook (Token-based)</div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-gray-900 break-all">
                            {campaign.webhook_urls.email}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.email!);
                              alert('Webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.email_note && (
                          <div className="text-xs text-gray-500 mt-1">{campaign.webhook_urls.email_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.sms_twilio && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                          <span>SMS Webhook (Twilio)</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 border border-blue-300 rounded text-[10px] text-blue-800">Recommended</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-gray-900 break-all">
                            {campaign.webhook_urls.sms_twilio}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.sms_twilio!);
                              alert('Twilio webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.sms_twilio_note && (
                          <div className="text-xs text-gray-500 mt-1">{campaign.webhook_urls.sms_twilio_note}</div>
                        )}
                      </div>
                    )}
                    {campaign.webhook_urls.sms && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">SMS Webhook (Token-based)</div>
                        <div className="flex items-start gap-2">
                          <code className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-gray-900 break-all">
                            {campaign.webhook_urls.sms}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(campaign.webhook_urls!.sms!);
                              alert('Token-based webhook URL copied to clipboard!');
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900 underline"
                          >
                            Copy
                          </button>
                        </div>
                        {campaign.webhook_urls.sms_note && (
                          <div className="text-xs text-gray-500 mt-1">{campaign.webhook_urls.sms_note}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
                      statusColors[campaign.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>
              {campaign.created_by_name && (
                <div>
                  <div className="text-sm text-gray-600">Created By</div>
                  <div className="mt-1 text-gray-900">{campaign.created_by_name}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">Created</div>
                <div className="mt-1 text-gray-900">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="mt-1 text-gray-900">
                  {new Date(campaign.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execute Modal */}
      {showExecuteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900/95 to-rose-900/95 backdrop-blur-md rounded-2xl border border-red-800/50 p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-white">Select Contacts to Target</h2>
            
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-red-200/70">
                  Select contacts to send this campaign to
                </p>
                <button
                  type="button"
                  onClick={handleSelectAllContacts}
                  className="text-xs text-red-200/70 hover:text-red-200 underline"
                >
                  {selectedContactIds.size === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="rounded-lg border border-red-800/50 bg-white/5 max-h-96 overflow-y-auto p-3">
                {loadingContacts ? (
                  <div className="text-center text-red-200/70 py-4">Loading contacts...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-center text-red-200/70 py-4">No contacts found</div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContactIds.has(contact.id)}
                          onChange={() => handleContactToggle(contact.id)}
                          className="rounded border-red-800/50 bg-white/10 text-red-500 focus:ring-red-500/50"
                        />
                        <span className="text-sm text-white">
                          {contact.first_name} {contact.last_name}
                          {contact.email && <span className="text-red-200/70 ml-2">({contact.email})</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="mt-3 text-sm text-red-200/70">
                {selectedContactIds.size} contact{selectedContactIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-red-800/50">
              <button
                type="button"
                onClick={() => {
                  setShowExecuteModal(false);
                  setSelectedContactIds(new Set());
                }}
                className="rounded-lg border border-red-800/50 bg-red-900/30 px-4 py-2 text-white hover:bg-red-900/50 transition-colors"
                disabled={executing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExecute}
                disabled={executing || selectedContactIds.size === 0}
                className="rounded-lg bg-white text-red-700 px-4 py-2 font-semibold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing ? 'Executing...' : `Execute (${selectedContactIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

