'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface ContactGroup {
  id: string;
  name: string;
  member_count: number;
}

/**
 * Convert local datetime to UTC ISO string
 */
function localToUTC(localDateTime: string): string | null {
  if (!localDateTime) return null;
  // datetime-local input format: "YYYY-MM-DDTHH:mm"
  const date = new Date(localDateTime);
  return date.toISOString();
}

/**
 * Convert UTC ISO string to local datetime for input
 */
function utcToLocal(utcString: string | null): string {
  if (!utcString) return '';
  const date = new Date(utcString);
  // Get local datetime in YYYY-MM-DDTHH:mm format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'multi',
    status: 'draft',
    start_date: '',
    end_date: '',
    instructions: '',
    custom_introduction: '',
    use_custom_introduction: false,
    filter_dormant: false,
    days_inactive: '90',
    // Channel checkboxes and schedules (absolute date/time)
    channels: {
      email: { enabled: true, send_now: true, scheduled_time: '' },
      sms: { enabled: false, send_now: true, scheduled_time: '' },
      call: { enabled: false, send_now: true, scheduled_time: '' },
    },
  });

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

    // Require instructions (surveys are under development)
    if (!formData.instructions.trim()) {
      setError('Please provide campaign instructions');
      return;
    }

    setSaving(true);

    try {
      const metadata: any = {};

      // Add contact group IDs (primary method)
      if (selectedGroupIds.size > 0) {
        metadata.contact_group_ids = Array.from(selectedGroupIds);
      }

      // Add days_inactive if filtering by dormant contacts
      if (formData.filter_dormant) {
        metadata.days_inactive = parseInt(formData.days_inactive) || 90;
      }

      // Add channel configuration with absolute scheduled times (convert to UTC)
      const channelsWithUTC: any = {};
      for (const [channel, config] of Object.entries(formData.channels)) {
        if (config.enabled) {
          channelsWithUTC[channel] = {
            enabled: true,
            send_now: config.send_now || false,
            scheduled_time: config.send_now ? null : (config.scheduled_time ? localToUTC(config.scheduled_time) : null),
          };
        } else {
          channelsWithUTC[channel] = { enabled: false };
        }
      }
      metadata.channels = channelsWithUTC;

      // Determine channel value for backward compatibility
      // If all 3 enabled, use 'multi', otherwise use the single channel or 'multi'
      let channelValue = 'multi';
      if (enabledChannels.length === 1) {
        channelValue = enabledChannels[0] === 'call' ? 'call' : enabledChannels[0];
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        channel: channelValue,
        status: formData.status,
        instructions: formData.instructions.trim() || null,
        custom_introduction: formData.use_custom_introduction ? formData.custom_introduction.trim() || null : null,
        use_custom_introduction: formData.use_custom_introduction,
        start_date: localToUTC(formData.start_date),
        end_date: localToUTC(formData.end_date),
        metadata,
      };
      
      const response = await apiClient.post('/campaigns', payload);
      router.push('/portal/campaigns');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  // Survey fetching removed - surveys are under development

  useEffect(() => {
    const fetchContactGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await apiClient.get('/contact-groups', { params: { page: 1, limit: 100 } });
        setContactGroups(response.data.data);
      } catch (error) {
        console.error('Failed to fetch contact groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchContactGroups();
  }, []);

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
    value: string
  ) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: {
          ...formData.channels[channel],
          scheduled_time: value,
        },
      },
    });
  };

  const handleChannelSendNowToggle = (channel: 'email' | 'sms' | 'call', sendNow: boolean) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: {
          ...formData.channels[channel],
          send_now: sendNow,
          scheduled_time: sendNow ? '' : formData.channels[channel].scheduled_time,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600">Create a new marketing or reactivation campaign</p>
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
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description for this campaign"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
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
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.email.send_now}
                        onChange={(e) => handleChannelSendNowToggle('email', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                      />
                      <span className="text-sm text-gray-700">Send Now</span>
                    </label>
                    {!formData.channels.email.send_now && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Scheduled Time (UTC)</label>
                        <input
                          type="datetime-local"
                          value={formData.channels.email.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('email', e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Time is stored in UTC and converted from your local timezone</p>
                      </div>
                    )}
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
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.sms.send_now}
                        onChange={(e) => handleChannelSendNowToggle('sms', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                      />
                      <span className="text-sm text-gray-700">Send Now</span>
                    </label>
                    {!formData.channels.sms.send_now && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Scheduled Time (UTC)</label>
                        <input
                          type="datetime-local"
                          value={formData.channels.sms.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('sms', e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Time is stored in UTC and converted from your local timezone</p>
                      </div>
                    )}
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
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.call.send_now}
                        onChange={(e) => handleChannelSendNowToggle('call', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                      />
                      <span className="text-sm text-gray-700">Send Now</span>
                    </label>
                    {!formData.channels.call.send_now && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Scheduled Time (UTC)</label>
                        <input
                          type="datetime-local"
                          value={formData.channels.call.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('call', e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Time is stored in UTC and converted from your local timezone</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select one or more channels. Enable "Send Now" for immediate execution, or schedule for a specific date and time (UTC).
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
              Start Date (UTC)
            </label>
            <input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="mt-1 text-xs text-gray-500">Dates are stored in UTC and converted from your local timezone</p>
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-2 text-gray-900">
              End Date (UTC)
            </label>
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="mt-1 text-xs text-gray-500">Dates are stored in UTC and converted from your local timezone</p>
          </div>
        </div>

        {/* Campaign Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium mb-2 text-gray-900">
            Campaign Instructions *
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={6}
            required
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Provide instructions for the AI to generate personalized messages. For example: 'Send a friendly email introducing our new product line, mention any recent deals or interactions, and invite them to learn more.'"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
          />
          <p className="mt-1 text-xs text-gray-500">
            The AI will use these instructions to generate personalized messages for each contact based on their CRM data (campaigns, deals, contact info).
          </p>
        </div>

        {/* Survey Selection - Hidden (Under Development) */}

        {/* Custom Introduction */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={formData.use_custom_introduction}
              onChange={(e) => setFormData({ ...formData, use_custom_introduction: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
            />
            <span className="text-sm font-medium text-gray-900">Use Custom Introduction</span>
          </label>
          {formData.use_custom_introduction && (
            <div className="mt-3">
              <label htmlFor="custom_introduction" className="block text-sm font-medium mb-2 text-gray-900">
                Custom Introduction
              </label>
              <textarea
                id="custom_introduction"
                name="custom_introduction"
                rows={4}
                value={formData.custom_introduction}
                onChange={handleChange}
                placeholder="Enter a custom introduction or greeting. For voice calls, this will be used as the initial greeting. For email/SMS, this will be prepended to the AI-generated content."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              />
              <p className="mt-1 text-xs text-gray-500">
                This introduction will be used in voice calls as the initial greeting, or prepended to email/SMS content.
              </p>
            </div>
          )}
        </div>

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
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
