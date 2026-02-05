'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

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
    customer_company_id: '', // Updated: account_id → customer_company_id
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
          customer_company_id: deal.customer_company_id || deal.account_id || '', // Support both for backward compat
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
        customer_company_id: formData.customer_company_id || null, // Updated: account_id → customer_company_id
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
      <PageHeader title="Edit Deal" description="Update deal information" />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" required>Deal Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="customer_company_id">Customer Company</Label>
              <Select
                id="customer_company_id"
                name="customer_company_id"
                value={formData.customer_company_id}
                onChange={handleChange}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="contact_id">Contact</Label>
              <Select
                id="contact_id"
                name="contact_id"
                value={formData.contact_id}
                onChange={handleChange}
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Deal Value</Label>
              <div className="flex gap-2">
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-24"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </Select>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.value}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                name="probability"
                type="number"
                min={0}
                max={100}
                value={formData.probability}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input
                id="expected_close_date"
                name="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

