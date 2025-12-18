'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create New Customer</h1>
        <p className="text-gray-600">Add a new customer to your CRM</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-2 text-gray-900">
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={formData.first_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-2 text-gray-900">
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              value={formData.last_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-gray-900">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
            {mobileError && (
              <p className="mt-1 text-sm text-red-600">{mobileError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Format: 61 followed by 9 digits (e.g., 61412345678). Do not use 0 or +61.
            </p>
          </div>

          <div>
            <label htmlFor="job_title" className="block text-sm font-medium mb-2 text-gray-900">
              Job Title
            </label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              value={formData.job_title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2 text-gray-900">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="lifecycle_stage" className="block text-sm font-medium mb-2 text-gray-900">
              Lifecycle Stage
            </label>
            <select
              id="lifecycle_stage"
              name="lifecycle_stage"
              value={formData.lifecycle_stage}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="customer">Customer</option>
              <option value="churned">Churned</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-900">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
          />
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
            {saving ? 'Creating...' : 'Create Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}

