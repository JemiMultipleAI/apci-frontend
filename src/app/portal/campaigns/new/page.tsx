'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

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
    // Batch execution fields
    batch_execution_enabled: false,
    batch_size: '5',
    batch_interval: 'daily',
    batch_start_time: '09:00',
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

      // Add batch execution config
      if (formData.batch_execution_enabled) {
        metadata.batch_execution = {
          enabled: true,
          batch_size: parseInt(formData.batch_size) || 5,
          batch_interval: formData.batch_interval || 'daily',
          start_time: formData.batch_start_time || '09:00',
        };
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
      <PageHeader
        title="Create New Campaign"
        description="Create a new marketing or reactivation campaign"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
              <Label htmlFor="name" required>Campaign Name</Label>
              <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description for this campaign"
            />
          </div>

          <div className="md:col-span-2">
              <Label>Communication Channels *</Label>
              <Card variant="elevated" className="p-4 space-y-4">
              {/* Email Channel */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.email.enabled}
                    onChange={() => handleChannelToggle('email')}
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Email</span>
                </label>
                {formData.channels.email.enabled && (
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.email.send_now}
                        onChange={(e) => handleChannelSendNowToggle('email', e.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Send Now</span>
                    </label>
                    {!formData.channels.email.send_now && (
                      <div>
                        <Label className="text-sm mb-1">Scheduled Time (UTC)</Label>
                        <Input
                          type="datetime-local"
                          value={formData.channels.email.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('email', e.target.value)}
                          className="text-sm"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Time is stored in UTC and converted from your local timezone</p>
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
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">SMS</span>
                </label>
                {formData.channels.sms.enabled && (
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.sms.send_now}
                        onChange={(e) => handleChannelSendNowToggle('sms', e.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary">Send Now</span>
                    </label>
                    {!formData.channels.sms.send_now && (
                      <div>
                        <Label className="text-sm mb-1">Scheduled Time (UTC)</Label>
                        <Input
                          type="datetime-local"
                          value={formData.channels.sms.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('sms', e.target.value)}
                          className="text-sm"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Time is stored in UTC and converted from your local timezone</p>
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
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Voice Call</span>
                </label>
                {formData.channels.call.enabled && (
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.call.send_now}
                        onChange={(e) => handleChannelSendNowToggle('call', e.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-secondary">Send Now</span>
                    </label>
                    {!formData.channels.call.send_now && (
                      <div>
                        <Label className="text-sm mb-1">Scheduled Time (UTC)</Label>
                        <Input
                          type="datetime-local"
                          value={formData.channels.call.scheduled_time}
                          onChange={(e) => handleChannelScheduleChange('call', e.target.value)}
                          className="text-sm"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Time is stored in UTC and converted from your local timezone</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </Card>
              <p className="mt-2 text-xs text-muted-foreground">
              Select one or more channels. Enable "Send Now" for immediate execution, or schedule for a specific date and time (UTC).
            </p>
          </div>

          <div>
              <Label htmlFor="status">Status</Label>
              <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              </Select>
          </div>

          <div>
              <Label htmlFor="start_date">Start Date (UTC)</Label>
              <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
            />
              <p className="mt-1 text-xs text-muted-foreground">Dates are stored in UTC and converted from your local timezone</p>
          </div>

          <div>
              <Label htmlFor="end_date">End Date (UTC)</Label>
              <Input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
            />
              <p className="mt-1 text-xs text-muted-foreground">Dates are stored in UTC and converted from your local timezone</p>
          </div>
        </div>

        {/* Campaign Instructions */}
        <div>
            <Label htmlFor="instructions" required>Campaign Instructions</Label>
            <Textarea
            id="instructions"
            name="instructions"
            rows={6}
            required
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Provide instructions for the AI to generate personalized messages. For example: 'Send a friendly email introducing our new product line, mention any recent deals or interactions, and invite them to learn more.'"
          />
            <p className="mt-1 text-xs text-muted-foreground">
            The AI will use these instructions to generate personalized messages for each contact based on their CRM data (campaigns, deals, contact info).
          </p>
        </div>

        {/* Custom Introduction */}
          <Card variant="elevated" className="p-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={formData.use_custom_introduction}
              onChange={(e) => setFormData({ ...formData, use_custom_introduction: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
              <span className="text-sm font-medium text-foreground">Use Custom Introduction</span>
          </label>
          {formData.use_custom_introduction && (
            <div className="mt-3">
                <Label htmlFor="custom_introduction">Custom Introduction</Label>
                <Textarea
                id="custom_introduction"
                name="custom_introduction"
                rows={4}
                value={formData.custom_introduction}
                onChange={handleChange}
                placeholder="Enter a custom introduction or greeting. For voice calls, this will be used as the initial greeting. For email/SMS, this will be prepended to the AI-generated content."
              />
                <p className="mt-1 text-xs text-muted-foreground">
                This introduction will be used in voice calls as the initial greeting, or prepended to email/SMS content.
              </p>
            </div>
          )}
          </Card>

        {/* Contact Group Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
              <Label>Target Contact Groups *</Label>
              <Button
              type="button"
                variant="ghost"
                size="sm"
              onClick={handleSelectAllGroups}
            >
              {selectedGroupIds.size === contactGroups.length ? 'Deselect All' : 'Select All'}
              </Button>
          </div>
            <Card variant="elevated" className="max-h-60 overflow-y-auto p-3">
              {loadingGroups ? (
                <div className="text-center text-muted-foreground py-4">Loading contact groups...</div>
              ) : contactGroups.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No contact groups found. <Link href="/portal/contact-groups/new" className="text-primary hover:underline">Create one</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {contactGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-surface cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.has(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="rounded border-border bg-background text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground flex-1">
                        {group.name}
                        <span className="text-muted-foreground ml-2">({group.member_count} {group.member_count === 1 ? 'contact' : 'contacts'})</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </Card>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedGroupIds.size} group{selectedGroupIds.size !== 1 ? 's' : ''} selected
            </p>
          </div>

        {/* Dormant Filter Option */}
          <Card variant="elevated" className="p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.filter_dormant}
              onChange={(e) => setFormData({ ...formData, filter_dormant: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
              <span className="text-sm font-medium text-foreground">Filter by dormant contacts</span>
          </label>
          {formData.filter_dormant && (
            <div className="mt-3 ml-7">
                <Label htmlFor="days_inactive">Days Inactive</Label>
                <Input
                id="days_inactive"
                name="days_inactive"
                type="number"
                min="1"
                value={formData.days_inactive}
                onChange={handleChange}
                placeholder="90"
              />
                <p className="mt-1 text-xs text-muted-foreground">
                Only include contacts from selected groups that have been inactive for this many days
              </p>
            </div>
          )}
          </Card>

        {/* Batch Execution Option */}
          <Card variant="elevated" className="p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.batch_execution_enabled}
              onChange={(e) => setFormData({ ...formData, batch_execution_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
              <span className="text-sm font-medium text-foreground">Enable Batch Execution</span>
          </label>
          <p className="mt-1 ml-7 text-xs text-muted-foreground">
            Spread campaign execution over multiple batches to avoid overwhelming recipients
          </p>
          {formData.batch_execution_enabled && (
            <div className="mt-4 ml-7 space-y-4">
              <div>
                <Label htmlFor="batch_size">Batch Size</Label>
                <Input
                  id="batch_size"
                  name="batch_size"
                  type="number"
                  min="1"
                  value={formData.batch_size}
                  onChange={handleChange}
                  placeholder="5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Number of contacts to process per batch
                </p>
              </div>
              <div>
                <Label htmlFor="batch_interval">Batch Interval</Label>
                <Select
                  id="batch_interval"
                  name="batch_interval"
                  value={formData.batch_interval}
                  onChange={handleChange}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  How often to send each batch
                </p>
              </div>
              <div>
                <Label htmlFor="batch_start_time">Start Time (24-hour format)</Label>
                <Input
                  id="batch_start_time"
                  name="batch_start_time"
                  type="time"
                  value={formData.batch_start_time}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Time of day to send each batch (e.g., 09:00 for 9 AM). Uses your local timezone.
                </p>
              </div>
              {selectedGroupIds.size > 0 && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Estimated Duration:</strong> With {contactGroups
                      .filter(g => selectedGroupIds.has(g.id))
                      .reduce((sum, g) => sum + g.member_count, 0)} contacts and batch size of {formData.batch_size}, 
                    this campaign will take approximately {Math.ceil(
                      contactGroups
                        .filter(g => selectedGroupIds.has(g.id))
                        .reduce((sum, g) => sum + g.member_count, 0) / parseInt(formData.batch_size || '5')
                    )} {formData.batch_interval === 'hourly' ? 'hours' : formData.batch_interval === 'daily' ? 'days' : 'weeks'} to complete.
                  </p>
                </div>
              )}
            </div>
          )}
          </Card>

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
            {saving ? 'Creating...' : 'Create Campaign'}
            </Button>
        </div>
      </form>
      </Card>
    </div>
  );
}
