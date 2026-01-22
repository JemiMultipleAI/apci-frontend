'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function NewDealPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    customer_company_id: '',
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
        const [accountsRes, contactsRes] = await Promise.all([
          apiClient.get('/accounts', { params: { limit: 100 } }),
          apiClient.get('/contacts', { params: { limit: 100 } }),
        ]);
        setAccounts(accountsRes.data.data);
        setContacts(contactsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch accounts/contacts:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        probability: parseInt(formData.probability) || 0,
        customer_company_id: formData.customer_company_id || null,
        contact_id: formData.contact_id || null,
        expected_close_date: formData.expected_close_date || null,
      };
      const response = await apiClient.post('/deals', payload);
      router.push(`/portal/deals/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create deal');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Deal"
        description="Add a new deal to your pipeline"
      />

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
                  className="w-auto"
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
                  min="0"
                  value={formData.value}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                name="probability"
                type="number"
                min="0"
                max="100"
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
              {saving ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
