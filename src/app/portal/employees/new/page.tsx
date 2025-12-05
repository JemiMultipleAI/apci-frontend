'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { getCompanyId } from '@/lib/cookies';

interface Account {
  id: string;
  name: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as 'super_admin' | 'admin' | 'manager' | 'sales_rep' | 'viewer',
    is_active: true,
    account_id: null as string | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user to check role
        const userResponse = await apiClient.get('/auth/me');
        if (userResponse.data.success) {
          setCurrentUser(userResponse.data.data);
        }

        // Fetch accounts for company dropdown
        const accountsResponse = await apiClient.get('/accounts', {
          params: { page: 1, limit: 100 },
        });
        if (accountsResponse.data.success) {
          setAccounts(accountsResponse.data.data);
        }

        // Auto-select user's company for non-super_admin
        const companyId = getCompanyId();
        if (companyId && userResponse.data.data.role !== 'super_admin') {
          setFormData(prev => ({ ...prev, account_id: companyId }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate company selection for non-super_admin roles
    if (formData.role !== 'super_admin' && !formData.account_id) {
      setError('Company selection is required for non-super_admin roles');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        account_id: formData.role === 'super_admin' ? null : formData.account_id,
      };
      const response = await apiClient.post('/users', submitData);
      router.push(`/portal/employees/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create New Employee</h1>
        <p className="text-gray-600">Add a new team member to your CRM</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-900">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-2 text-gray-900">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-2 text-gray-900">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2 text-gray-900">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as typeof formData.role;
                setFormData({
                  ...formData,
                  role: newRole,
                  // Clear company_id if super_admin is selected
                  account_id: newRole === 'super_admin' ? null : formData.account_id,
                });
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              {currentUser?.role === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
              <option value="viewer">Viewer</option>
              <option value="sales_rep">Sales Rep</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role !== 'super_admin' && (
            <div>
              <label htmlFor="account_id" className="block text-sm font-medium mb-2 text-gray-900">
                Company *
              </label>
              <select
                id="account_id"
                name="account_id"
                required={true}
                value={formData.account_id || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    account_id: e.target.value || null,
                  });
                }}
                disabled={loadingAccounts}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626] disabled:opacity-50"
              >
                <option value="">Select a company</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 pt-8">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 bg-white text-[#DC2626] focus:ring-[#DC2626]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>
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
            {saving ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

