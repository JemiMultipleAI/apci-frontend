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

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'marketing',
    channel: 'multi', // Default to multi for backward compatibility
    status: 'draft',
    start_date: '',
    end_date: '',
    template_id: '',
    survey_id: '',
    days_inactive: '90',
    // Channel checkboxes and schedules
    channels: {
      email: { enabled: true, delay: 0, unit: 'minutes' },
      sms: { enabled: false, delay: 60, unit: 'minutes' },
      call: { enabled: false, delay: 120, unit: 'minutes' },
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

    if (formData.type !== 'reactivation' && selectedContactIds.size === 0) {
      setError('Please select at least one contact or use reactivation campaign type');
      return;
    }

    if (formData.type !== 'survey' && !formData.template_id) {
      setError('Please select a template');
      return;
    }

    if (formData.type === 'survey' && !formData.survey_id) {
      setError('Please select a survey');
      return;
    }

    setSaving(true);

    try {
      const metadata: any = {};

      // Add contact IDs if manually selected
      if (selectedContactIds.size > 0) {
        metadata.contact_ids = Array.from(selectedContactIds);
      }

      // Add template ID
      if (formData.template_id) {
        metadata.template_id = formData.template_id;
      }

      // Add survey ID for survey campaigns
      if (formData.type === 'survey' && formData.survey_id) {
        metadata.survey_id = formData.survey_id;
      }

      // Add days_inactive for reactivation campaigns
      if (formData.type === 'reactivation') {
        metadata.days_inactive = parseInt(formData.days_inactive) || 90;
      }

      // Add channel configuration with schedules
      metadata.channels = formData.channels;

      // Determine channel value for backward compatibility
      // If all 3 enabled, use 'multi', otherwise use the single channel or 'multi'
      let channelValue = 'multi';
      if (enabledChannels.length === 1) {
        channelValue = enabledChannels[0] === 'call' ? 'call' : enabledChannels[0];
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        channel: channelValue,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
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

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await apiClient.get('/templates');
        setTemplates(response.data.data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    if (formData.type === 'survey') {
      const fetchSurveys = async () => {
        setLoadingSurveys(true);
        try {
          const response = await apiClient.get('/surveys', { params: { page: 1, limit: 100, is_active: true } });
          setSurveys(response.data.data);
        } catch (error) {
          console.error('Failed to fetch surveys:', error);
        } finally {
          setLoadingSurveys(false);
        }
      };
      fetchSurveys();
    }
  }, [formData.type]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const response = await apiClient.get('/contacts', { params: { page: 1, limit: 100 } });
        setContacts(response.data.data);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-900">
              Campaign Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="marketing">Marketing</option>
              <option value="reactivation">Subscription Reactivation</option>
              <option value="survey">Survey</option>
            </select>
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

        {/* Template Selection */}
        {formData.type !== 'survey' && (
          <div>
            <label htmlFor="template_id" className="block text-sm font-medium mb-2 text-gray-900">
              Template *
            </label>
            <select
              id="template_id"
              name="template_id"
              required={formData.type !== 'survey'}
              value={formData.template_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="">Select a template...</option>
              {loadingTemplates ? (
                <option disabled>Loading templates...</option>
              ) : filteredTemplates.length === 0 ? (
                <option disabled>No templates available for {formData.channel} channel</option>
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
                No templates found for selected channels. 
                <Link href="/portal/templates/new" className="underline ml-1">Create one</Link>
              </p>
            )}
          </div>
        )}

        {/* Survey Selection */}
        {formData.type === 'survey' && (
          <div>
            <label htmlFor="survey_id" className="block text-sm font-medium mb-2 text-gray-900">
              Survey *
            </label>
            <select
              id="survey_id"
              name="survey_id"
              required
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
                No active surveys found. 
                <Link href="/portal/surveys/new" className="underline ml-1">Create one</Link>
              </p>
            )}
          </div>
        )}

        {/* Reactivation Options */}
        {formData.type === 'reactivation' && (
          <div>
            <label htmlFor="days_inactive" className="block text-sm font-medium mb-2 text-gray-900">
              Days Inactive *
            </label>
            <input
              id="days_inactive"
              name="days_inactive"
              type="number"
              min="1"
              required
              value={formData.days_inactive}
              onChange={handleChange}
              placeholder="90"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            <p className="mt-1 text-xs text-gray-500">
              Contacts with no activity in the last N days will be automatically selected
            </p>
          </div>
        )}

        {/* Contact Selection */}
        {formData.type !== 'reactivation' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Target Contacts *
              </label>
              <button
                type="button"
                onClick={handleSelectAllContacts}
                className="text-xs text-gray-600 hover:text-gray-900 underline"
              >
                {selectedContactIds.size === contacts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-60 overflow-y-auto p-3">
              {loadingContacts ? (
                <div className="text-center text-gray-600 py-4">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center text-gray-600 py-4">No contacts found</div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContactIds.has(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        className="rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]/50"
                      />
                      <span className="text-sm text-gray-900">
                        {contact.first_name} {contact.last_name}
                        {contact.email && <span className="text-gray-500 ml-2">({contact.email})</span>}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {selectedContactIds.size} contact{selectedContactIds.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

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

