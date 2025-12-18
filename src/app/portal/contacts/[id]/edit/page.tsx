'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await apiClient.get(`/contacts/${params.id}`);
        const contact = response.data.data;
        setFormData({
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          email: contact.email || '',
          mobile: contact.mobile || '',
          job_title: contact.job_title || '',
          department: contact.department || '',
          lifecycle_stage: contact.lifecycle_stage || 'lead',
          notes: contact.notes || '',
        });
      } catch (error) {
        setError('Failed to load contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await apiClient.put(`/contacts/${params.id}`, formData);
      router.push(`/portal/contacts/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update contact');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading contact...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Contact</h1>
        <p className="text-muted-foreground">Update contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={formData.first_name}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              value={formData.last_name}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium mb-2">
              Mobile
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="61412345678"
              maxLength={11}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {mobileError && (
              <p className="mt-1 text-sm text-red-600">{mobileError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: 61 followed by 9 digits (e.g., 61412345678). Do not use 0 or +61.
            </p>
          </div>

          <div>
            <label htmlFor="job_title" className="block text-sm font-medium mb-2">
              Job Title
            </label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              value={formData.job_title}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="lifecycle_stage" className="block text-sm font-medium mb-2">
              Lifecycle Stage
            </label>
            <select
              id="lifecycle_stage"
              name="lifecycle_stage"
              value={formData.lifecycle_stage}
              onChange={handleChange}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="customer">Customer</option>
              <option value="churned">Churned</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
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

