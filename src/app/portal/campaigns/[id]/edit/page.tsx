'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
}

interface Survey {
  id: string;
  name: string;
  is_active: boolean;
}

interface ContactGroup {
  id: string;
  name: string;
  member_count: number;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'multi',
    status: 'draft',
    start_date: '',
    end_date: '',
    template_id: '',
    survey_id: '',
    filter_dormant: false,
    days_inactive: '90',
    // Channel checkboxes and schedules
    channels: {
      email: { enabled: true, delay: 0, unit: 'minutes' },
      sms: { enabled: false, delay: 60, unit: 'minutes' },
      call: { enabled: false, delay: 120, unit: 'minutes' },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignRes, templatesRes] = await Promise.all([
          apiClient.get(`/campaigns/${params.id}`),
          apiClient.get('/templates'),
        ]);

        const campaign = campaignRes.data.data;
        setTemplates(templatesRes.data.data);

        // Parse dates for datetime-local input
        const startDate = campaign.start_date 
          ? new Date(campaign.start_date).toISOString().slice(0, 16)
          : '';
        const endDate = campaign.end_date 
          ? new Date(campaign.end_date).toISOString().slice(0, 16)
          : '';

        // Load channel configuration from metadata or infer from channel field
        let channels = {
          email: { enabled: true, delay: 0, unit: 'minutes' as 'minutes' | 'hours' | 'days' },
          sms: { enabled: false, delay: 60, unit: 'minutes' as 'minutes' | 'hours' | 'days' },
          call: { enabled: false, delay: 120, unit: 'minutes' as 'minutes' | 'hours' | 'days' },
        };

        if (campaign.metadata?.channels) {
          channels = {
            email: campaign.metadata.channels.email || channels.email,
            sms: campaign.metadata.channels.sms || channels.sms,
            call: campaign.metadata.channels.call || channels.call,
          };
        } else {
          // Backward compatibility: infer from channel field
          const channel = campaign.channel || 'email';
          if (channel === 'email') {
            channels = { ...channels, email: { enabled: true, delay: 0, unit: 'minutes' } };
          } else if (channel === 'sms') {
            channels = { ...channels, sms: { enabled: true, delay: 0, unit: 'minutes' } };
          } else if (channel === 'call') {
            channels = { ...channels, call: { enabled: true, delay: 0, unit: 'minutes' } };
          } else if (channel === 'multi') {
            channels = {
              email: { enabled: true, delay: 0, unit: 'minutes' },
              sms: { enabled: true, delay: 60, unit: 'minutes' },
              call: { enabled: false, delay: 120, unit: 'minutes' },
            };
          }
        }

        setFormData({
          name: campaign.name || '',
          description: campaign.description || '',
          channel: campaign.channel || 'multi',
          status: campaign.status || 'draft',
          start_date: startDate,
          end_date: endDate,
          template_id: campaign.metadata?.template_id || '',
          survey_id: campaign.metadata?.survey_id || '',
          filter_dormant: !!campaign.metadata?.days_inactive,
          days_inactive: campaign.metadata?.days_inactive?.toString() || '90',
          channels,
        });

        // Pre-select contacts from metadata
        // Load contact groups (primary) or contact_ids (backward compatibility)
        if (campaign.metadata?.contact_group_ids && Array.isArray(campaign.metadata.contact_group_ids)) {
          setSelectedGroupIds(new Set(campaign.metadata.contact_group_ids));
        } else if (campaign.metadata?.contact_ids && Array.isArray(campaign.metadata.contact_ids)) {
          // Backward compatibility: if old campaign has contact_ids, we'll need to handle this
          // For now, just log a warning - user will need to reselect groups
          console.warn('Campaign uses deprecated contact_ids. Please reselect contact groups.');
        }
        
        // Load dormant filter
        if (campaign.metadata?.days_inactive) {
          setFormData(prev => ({ ...prev, filter_dormant: true, days_inactive: String(campaign.metadata.days_inactive) }));
        }

        // Fetch surveys and contact groups
        setLoadingSurveys(true);
        setLoadingGroups(true);
        try {
          const [surveysRes, groupsRes] = await Promise.all([
            apiClient.get('/surveys', { params: { page: 1, limit: 100, is_active: true } }),
            apiClient.get('/contact-groups', { params: { page: 1, limit: 100 } }),
          ]);
          setSurveys(surveysRes.data.data);
          setContactGroups(groupsRes.data.data);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoadingSurveys(false);
          setLoadingGroups(false);
        }
      } catch (error) {
        setError('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGroupToggle = (groupId: string) => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroupIds(newSelected);
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.size === contactGroups.length) {
      setSelectedGroupIds(new Set());
    } else {
      setSelectedGroupIds(new Set(contactGroups.map(g => g.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const enabledChannels = Object.entries(formData.channels)
      .filter(([_, config]) => config.enabled)
      .map(([channel]) => channel);
    
    if (enabledChannels.length === 0) {
      setError('Please select at least one channel (Email, SMS, or Voice Call)');
      return;
    }

    if (selectedGroupIds.size === 0) {
      setError('Please select at least one contact group');
      return;
    }

    if (!formData.survey_id && !formData.template_id) {
      setError('Please select either a template or a survey');
      return;
    }

    setSaving(true);

    try {
      const metadata: any = {};

      // Add contact group IDs (primary method)
      if (selectedGroupIds.size > 0) {
        metadata.contact_group_ids = Array.from(selectedGroupIds);
      }

      // Add template ID
      if (formData.template_id) {
        metadata.template_id = formData.template_id;
      }

      // Add survey ID
      if (formData.survey_id) {
        metadata.survey_id = formData.survey_id;
      }

      // Add days_inactive if filtering by dormant contacts
      if (formData.filter_dormant) {
        metadata.days_inactive = parseInt(formData.days_inactive) || 90;
      }

      // Add channel configuration with schedules
      metadata.channels = formData.channels;

      // Determine channel value for backward compatibility
      let channelValue = 'multi';
      if (enabledChannels.length === 1) {
        channelValue = enabledChannels[0] === 'call' ? 'call' : enabledChannels[0];
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        channel: channelValue,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        metadata,
      };
      
      await apiClient.put(`/campaigns/${params.id}`, payload);
      router.push(`/portal/campaigns/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    // Show email templates if email is enabled, SMS templates if SMS or call is enabled
    const emailEnabled = formData.channels.email.enabled;
    const smsOrCallEnabled = formData.channels.sms.enabled || formData.channels.call.enabled;
    
    if (emailEnabled && smsOrCallEnabled) {
      return true; // Show all templates
    } else if (emailEnabled) {
      return t.type === 'email';
    } else if (smsOrCallEnabled) {
      return t.type === 'sms';
    }
    return true;
  });

  const handleChannelToggle = (channel: 'email' | 'sms' | 'call') => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: {
          ...formData.channels[channel],
          enabled: !formData.channels[channel].enabled,
        },
      },
    });
  };

  const handleChannelScheduleChange = (
    channel: 'email' | 'sms' | 'call',
    field: 'delay' | 'unit',
    value: string | number
  ) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: {
          ...formData.channels[channel],
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Edit Campaign</h1>
        <p className="text-gray-600">Update campaign information</p>
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
              Campaign Name *
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
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context about this campaign. This will be used as a knowledge base for AI-powered features like ElevenLabs voice calls."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="mt-1 text-xs text-gray-600">
              This description will be used as context for AI-powered features, including ElevenLabs voice calls.
            </p>
          </div>


          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-3 text-gray-900">
              Communication Channels *
            </label>
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {/* Email Channel */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.email.enabled}
                    onChange={() => handleChannelToggle('email')}
                    className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                  />
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </label>
                {formData.channels.email.enabled && (
                  <div className="ml-7 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Send</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.channels.email.delay}
                      onChange={(e) => handleChannelScheduleChange('email', 'delay', parseInt(e.target.value) || 0)}
                      className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    />
                    <select
                      value={formData.channels.email.unit}
                      onChange={(e) => handleChannelScheduleChange('email', 'unit', e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="text-sm text-gray-600">after campaign start</span>
                  </div>
                )}
              </div>

              {/* SMS Channel */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.sms.enabled}
                    onChange={() => handleChannelToggle('sms')}
                    className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                  />
                  <span className="text-sm font-medium text-gray-900">SMS</span>
                </label>
                {formData.channels.sms.enabled && (
                  <div className="ml-7 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Send</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.channels.sms.delay}
                      onChange={(e) => handleChannelScheduleChange('sms', 'delay', parseInt(e.target.value) || 0)}
                      className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    />
                    <select
                      value={formData.channels.sms.unit}
                      onChange={(e) => handleChannelScheduleChange('sms', 'unit', e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="text-sm text-gray-600">after campaign start</span>
                  </div>
                )}
              </div>

              {/* Voice Call Channel */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.call.enabled}
                    onChange={() => handleChannelToggle('call')}
                    className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                  />
                  <span className="text-sm font-medium text-gray-900">Voice Call</span>
                </label>
                {formData.channels.call.enabled && (
                  <div className="ml-7 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Send</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.channels.call.delay}
                      onChange={(e) => handleChannelScheduleChange('call', 'delay', parseInt(e.target.value) || 0)}
                      className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    />
                    <select
                      value={formData.channels.call.unit}
                      onChange={(e) => handleChannelScheduleChange('call', 'unit', e.target.value)}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="text-sm text-gray-600">after campaign start</span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select one or more channels. Each channel will be sent at its scheduled time relative to when the campaign is executed.
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2 text-gray-900">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-2 text-gray-900">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-2 text-gray-900">
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {/* Content Selection: Template or Survey */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="template_id" className="block text-sm font-medium mb-2 text-gray-900">
              Template
            </label>
            <select
              id="template_id"
              name="template_id"
              value={formData.template_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="">Select a template...</option>
              {loadingTemplates ? (
                <option disabled>Loading templates...</option>
              ) : filteredTemplates.length === 0 ? (
                <option disabled>No templates available</option>
              ) : (
                filteredTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type.toUpperCase()})
                  </option>
                ))
              )}
            </select>
            {filteredTemplates.length === 0 && !loadingTemplates && (
              <p className="mt-1 text-xs text-gray-500">
                <Link href="/portal/templates/new" className="underline">Create a template</Link>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="survey_id" className="block text-sm font-medium mb-2 text-gray-900">
              Survey
            </label>
            <select
              id="survey_id"
              name="survey_id"
              value={formData.survey_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="">Select a survey...</option>
              {loadingSurveys ? (
                <option disabled>Loading surveys...</option>
              ) : surveys.length === 0 ? (
                <option disabled>No active surveys found</option>
              ) : (
                surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.name}
                  </option>
                ))
              )}
            </select>
            {surveys.length === 0 && !loadingSurveys && (
              <p className="mt-1 text-xs text-gray-500">
                <Link href="/portal/surveys/new" className="underline">Create a survey</Link>
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-4">
          Select either a template or a survey (or both). If both are selected, template will be used.
        </p>

        {/* Contact Group Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Target Contact Groups *
            </label>
            <button
              type="button"
              onClick={handleSelectAllGroups}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              {selectedGroupIds.size === contactGroups.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-60 overflow-y-auto p-3">
            {loadingGroups ? (
              <div className="text-center text-gray-600 py-4">Loading contact groups...</div>
            ) : contactGroups.length === 0 ? (
              <div className="text-center text-gray-600 py-4">
                No contact groups found. <Link href="/portal/contact-groups/new" className="text-[#DC2626] underline">Create one</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {contactGroups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.has(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      className="rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                    />
                    <span className="text-sm text-gray-900 flex-1">
                      {group.name}
                      <span className="text-gray-500 ml-2">({group.member_count} {group.member_count === 1 ? 'contact' : 'contacts'})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {selectedGroupIds.size} group{selectedGroupIds.size !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Dormant Filter Option */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.filter_dormant}
              onChange={(e) => setFormData({ ...formData, filter_dormant: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
            />
            <span className="text-sm font-medium text-gray-900">Filter by dormant contacts</span>
          </label>
          {formData.filter_dormant && (
            <div className="mt-3 ml-7">
              <label htmlFor="days_inactive" className="block text-sm font-medium mb-2 text-gray-900">
                Days Inactive
              </label>
              <input
                id="days_inactive"
                name="days_inactive"
                type="number"
                min="1"
                value={formData.days_inactive}
                onChange={handleChange}
                placeholder="90"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only include contacts from selected groups that have been inactive for this many days
              </p>
            </div>
          )}
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

