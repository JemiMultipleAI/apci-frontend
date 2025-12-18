'use client';

import { useEffect, useState } from 'react';
import { Zap, Users, TrendingUp, AlertCircle, Loader2, CheckCircle2, XCircle, Mail, MessageSquare, Phone, Send, Calendar, Clock } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface DormantContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  days_since_activity: number;
  reactivation_score: number;
}

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject: string | null;
  body: string;
}

export default function DormantContactsPage() {
  const router = useRouter();
  const [dormantContacts, setDormantContacts] = useState<DormantContact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysInactive, setDaysInactive] = useState(90);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [reactivating, setReactivating] = useState(false);
  const [reactivationStatus, setReactivationStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Reactivation settings
  const [channel, setChannel] = useState<'email' | 'sms' | 'call' | 'multi'>('email');
  const [templateId, setTemplateId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [showBulkOptions, setShowBulkOptions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, templatesRes] = await Promise.all([
          apiClient.get('/dormant-contacts/dormant', {
            params: { days: daysInactive, limit: 50 },
          }),
          apiClient.get('/templates', { params: { type: channel === 'call' ? 'email' : channel } }),
        ]);
        setDormantContacts(contactsRes.data.data);
        setTemplates(templatesRes.data.data || []);
        
        // Auto-select first template if available
        if (templatesRes.data.data && templatesRes.data.data.length > 0 && !templateId) {
          setTemplateId(templatesRes.data.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysInactive, channel]);

  const handleSelectAll = () => {
    if (selectedContacts.size === dormantContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(dormantContacts.map(c => c.id)));
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkReactivate = async () => {
    if (selectedContacts.size === 0) {
      setReactivationStatus({ success: false, message: 'Please select at least one contact' });
      return;
    }

    if (!templateId && channel !== 'call') {
      setReactivationStatus({ success: false, message: 'Please select a template' });
      return;
    }

    setReactivating(true);
    setReactivationStatus(null);

    try {
      const contactIds = Array.from(selectedContacts);
      
      // If scheduled, create a scheduled campaign instead
      if (scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        const now = new Date();
        
        if (scheduledDateTime <= now) {
          setReactivationStatus({ success: false, message: 'Scheduled time must be in the future' });
          setReactivating(false);
          return;
        }

        // Use reactivate endpoint with scheduled date/time
        const response = await apiClient.post('/dormant-contacts/reactivate', {
          contact_ids: contactIds,
          channel: channel,
          template_id: templateId || undefined,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
        });

        if (response.data.success) {
          setReactivationStatus({
            success: true,
            message: `Scheduled reactivation for ${contactIds.length} contact(s) on ${scheduledDateTime.toLocaleString()}`,
          });
        } else {
          setReactivationStatus({ success: false, message: 'Failed to schedule reactivation' });
        }
        
        // Clear selections and refresh
        setSelectedContacts(new Set());
        setScheduledDate('');
        setScheduledTime('');
        setTimeout(() => {
          const fetchDormantContacts = async () => {
            try {
              const response = await apiClient.get('/dormant-contacts/dormant', {
                params: { days: daysInactive, limit: 50 },
              });
              setDormantContacts(response.data.data);
            } catch (error) {
              console.error('Failed to refresh dormant contacts:', error);
            }
          };
          fetchDormantContacts();
        }, 2000);
      } else {
        // Immediate reactivation
        const response = await apiClient.post('/dormant-contacts/reactivate', {
          contact_ids: contactIds,
          channel: channel,
          template_id: templateId || undefined,
        });

        if (response.data.success) {
          const result = response.data.data;
          setReactivationStatus({
            success: true,
            message: `Successfully reactivated ${result.success} contact(s). ${result.failed > 0 ? `${result.failed} failed.` : ''}`,
          });
          
          // Clear selections and refresh
          setSelectedContacts(new Set());
          setTimeout(() => {
            const fetchDormantContacts = async () => {
              try {
                const response = await apiClient.get('/dormant-contacts/dormant', {
                  params: { days: daysInactive, limit: 50 },
                });
                setDormantContacts(response.data.data);
              } catch (error) {
                console.error('Failed to refresh dormant contacts:', error);
              }
            };
            fetchDormantContacts();
          }, 2000);
        } else {
          setReactivationStatus({ success: false, message: 'Failed to send reactivation' });
        }
      }
    } catch (error: any) {
      console.error('Failed to reactivate contacts:', error);
      setReactivationStatus({
        success: false,
        message: error.response?.data?.error || 'Failed to send reactivation. Please try again.',
      });
    } finally {
      setReactivating(false);
    }
  };

  const handleSingleReactivate = async (contactId: string) => {
    if (!templateId && channel !== 'call') {
      setReactivationStatus({ success: false, message: 'Please select a template first' });
      return;
    }

    setReactivating(true);
    setReactivationStatus(null);

    try {
      const response = await apiClient.post('/dormant-contacts/reactivate', {
        contact_ids: [contactId],
        channel: channel,
        template_id: templateId || undefined,
      });

      if (response.data.success) {
        const result = response.data.data;
        if (result.success > 0) {
          setReactivationStatus({ success: true, message: 'Reactivation sent successfully!' });
          
          setTimeout(() => {
            const fetchDormantContacts = async () => {
              try {
                const response = await apiClient.get('/dormant-contacts/dormant', {
                  params: { days: daysInactive, limit: 50 },
                });
                setDormantContacts(response.data.data);
                setReactivationStatus(null);
              } catch (error) {
                console.error('Failed to refresh dormant contacts:', error);
              }
            };
            fetchDormantContacts();
          }, 2000);
        } else {
          setReactivationStatus({ success: false, message: result.errors?.[0] || 'Failed to send reactivation' });
        }
      }
    } catch (error: any) {
      console.error('Failed to reactivate contact:', error);
      setReactivationStatus({
        success: false,
        message: error.response?.data?.error || 'Failed to send reactivation. Please try again.',
      });
    } finally {
      setReactivating(false);
    }
  };

  const highPriority = dormantContacts.filter(c => c.reactivation_score >= 70);
  const mediumPriority = dormantContacts.filter(c => c.reactivation_score >= 40 && c.reactivation_score < 70);
  const lowPriority = dormantContacts.filter(c => c.reactivation_score < 40);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dormant Contacts</h1>
        <p className="text-gray-600">
          Find and reactivate dormant customers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Total Dormant</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{dormantContacts.length}</div>
          <p className="text-sm text-gray-600 mt-1">
            Contacts inactive for {daysInactive}+ days
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5 text-[#F43F5E]" />
            <h3 className="font-semibold text-gray-900">High Priority</h3>
          </div>
          <div className="text-3xl font-bold text-[#DC2626]">{highPriority.length}</div>
          <p className="text-sm text-gray-600 mt-1">
            Score 70+ (urgent reactivation)
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Reactivation Score</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {dormantContacts.length > 0
              ? Math.round(
                  dormantContacts.reduce((sum, c) => sum + c.reactivation_score, 0) /
                    dormantContacts.length
                )
              : 0}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Average score (0-100)
          </p>
        </div>
      </div>

      {/* Reactivation Settings Panel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reactivation Settings</h2>
          <button
            onClick={() => setShowBulkOptions(!showBulkOptions)}
            className="text-sm text-[#DC2626] hover:underline"
          >
            {showBulkOptions ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showBulkOptions && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Channel</label>
              <select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value as any);
                  setTemplateId(''); // Reset template when channel changes
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="call">Call</option>
                <option value="multi">Multi (Email + SMS)</option>
              </select>
            </div>

            {channel !== 'call' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
                >
                  <option value="">Select template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No templates available. <a href="/portal/templates/new" className="text-[#DC2626] hover:underline">Create one</a>
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Schedule Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Schedule Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {reactivationStatus && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            reactivationStatus.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {reactivationStatus.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{reactivationStatus.message}</span>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedContacts.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-900">
              {selectedContacts.size} contact(s) selected
            </span>
            <button
              onClick={handleBulkReactivate}
              disabled={reactivating || (!templateId && channel !== 'call')}
              className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {reactivating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : scheduledDate && scheduledTime ? (
                <>
                  <Calendar className="h-4 w-4" />
                  Schedule Reactivation
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Reactivate Selected
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Dormant Contacts</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#DC2626] hover:underline"
            >
              {selectedContacts.size === dormantContacts.length ? 'Deselect All' : 'Select All'}
            </button>
            <label className="text-sm text-gray-600">Inactive for:</label>
            <select
              value={daysInactive}
              onChange={(e) => setDaysInactive(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value={30}>30+ days</option>
              <option value={60}>60+ days</option>
              <option value={90}>90+ days</option>
              <option value={180}>180+ days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading dormant contacts...
          </div>
        ) : dormantContacts.length === 0 ? (
          <div className="py-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No dormant contacts found</h3>
            <p className="text-gray-600">
              Great! All your contacts are active.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dormantContacts.map((contact) => {
              const priority =
                contact.reactivation_score >= 70
                  ? 'high'
                  : contact.reactivation_score >= 40
                  ? 'medium'
                  : 'low';
              const priorityColor =
                priority === 'high'
                  ? 'border-red-200 bg-red-50'
                  : priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-blue-200 bg-blue-50';
              const isSelected = selectedContacts.has(contact.id);

              return (
                <div
                  key={contact.id}
                  className={`rounded-lg border p-4 ${priorityColor} ${isSelected ? 'ring-2 ring-[#DC2626]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectContact(contact.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#DC2626] focus:ring-[#DC2626]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                        {contact.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.mobile}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          Inactive for {contact.days_since_activity} days
                        </span>
                        <span>Score: {contact.reactivation_score}/100</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSingleReactivate(contact.id)}
                      disabled={reactivating || (!templateId && channel !== 'call')}
                      className="rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                      {reactivating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Reactivate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

