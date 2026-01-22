'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function NewContactPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    job_title: '',
    department: '',
    lifecycle_stage: 'lead',
    notes: '',
  });

  // Helper function to normalize mobile numbers
  const normalizeMobile = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // If it starts with 0, replace with 61
    if (digitsOnly.startsWith('0')) {
      return '61' + digitsOnly.substring(1);
    }
    
    // If it starts with +61 (becomes 6161 after removing +), fix it
    if (digitsOnly.startsWith('6161') && digitsOnly.length === 13) {
      return '61' + digitsOnly.substring(2);
    }
    
    // If it already starts with 61, return as is
    if (digitsOnly.startsWith('61')) {
      return digitsOnly;
    }
    
    // If it's 9 digits (local number), add 61 prefix
    if (digitsOnly.length === 9) {
      return '61' + digitsOnly;
    }
    
    return digitsOnly;
  };

  // Validate mobile number
  const validateMobile = (mobile: string): string | null => {
    if (!mobile || mobile.trim() === '') return null; // Optional field
    const normalized = normalizeMobile(mobile);
    if (!/^61\d{9}$/.test(normalized)) {
      return 'Mobile must start with 61 followed by 9 digits (e.g., 61412345678). Do not use 0 or +61.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await apiClient.post('/contacts', formData);
      router.push(`/portal/contacts/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      const normalized = normalizeMobile(value);
      setFormData({ ...formData, [name]: normalized });
      const error = validateMobile(normalized);
      setMobileError(error || '');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Customer"
        description="Add a new customer to your CRM"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="first_name" required>First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="last_name" required>Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="61412345678"
                maxLength={11}
                error={!!mobileError}
              />
              {mobileError && (
                <p className="mt-1 text-sm text-error">{mobileError}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Format: 61 followed by 9 digits (e.g., 61412345678). Do not use 0 or +61.
              </p>
            </div>

            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                type="text"
                value={formData.job_title}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="lifecycle_stage">Lifecycle Stage</Label>
              <Select
                id="lifecycle_stage"
                name="lifecycle_stage"
                value={formData.lifecycle_stage}
                onChange={handleChange}
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="customer">Customer</option>
                <option value="churned">Churned</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
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
              {saving ? 'Creating...' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

