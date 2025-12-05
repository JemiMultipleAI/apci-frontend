'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function EditDealPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    account_id: '',
    contact_id: '',
    stage: 'lead',
    value: '',
    probability: '0',
    expected_close_date: '',
    currency: 'USD',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealRes, accountsRes, contactsRes] = await Promise.all([
          apiClient.get(`/deals/${params.id}`),
          apiClient.get('/accounts', { params: { limit: 100 } }),
          apiClient.get('/contacts', { params: { limit: 100 } }),
        ]);

        const deal = dealRes.data.data;
        setFormData({
          name: deal.name || '',
          account_id: deal.account_id || '',
          contact_id: deal.contact_id || '',
          stage: deal.stage || 'lead',
          value: deal.value?.toString() || '',
          probability: deal.probability?.toString() || '0',
          expected_close_date: deal.expected_close_date || '',
          currency: deal.currency || 'USD',
          description: deal.description || '',
        });
        setAccounts(accountsRes.data.data);
        setContacts(contactsRes.data.data);
      } catch (error) {
        setError('Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 0,
        account_id: formData.account_id || null,
        contact_id: formData.contact_id || null,
        expected_close_date: formData.expected_close_date || null,
      };
      await apiClient.put(`/deals/${params.id}`, payload);
      router.push(`/portal/deals/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading deal...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Deal</h1>
        <p className="text-muted-foreground">Update deal information</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Deal Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium mb-2">
              Account
            </label>
            <select
              id="account_id"
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact_id" className="block text-sm font-medium mb-2">
              Contact
            </label>
            <select
              id="contact_id"
              name="contact_id"
              value={formData.contact_id}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium mb-2">
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium mb-2">
              Deal Value
            </label>
            <div className="flex gap-2">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={handleChange}
                className="flex-1 rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="probability" className="block text-sm font-medium mb-2">
              Probability (%)
            </label>
            <input
              id="probability"
              name="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="expected_close_date" className="block text-sm font-medium mb-2">
              Expected Close Date
            </label>
            <input
              id="expected_close_date"
              name="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 font-medium hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

