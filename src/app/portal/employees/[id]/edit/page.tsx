'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

interface Account {
  id: string;
  name: string;
}

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
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

        // Fetch employee data
        const response = await apiClient.get(`/users/${params.id}`);
        const employee = response.data.data;
        setFormData({
          email: employee.email,
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          role: employee.role,
          is_active: employee.is_active,
          account_id: employee.company_id || null,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, [params.id]);

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
      await apiClient.put(`/users/${params.id}`, submitData);
      router.push(`/portal/employees/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update employee');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading employee...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Edit Employee</h1>
        <p className="text-red-200/80">Update employee information</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/50 border border-red-800/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="w-full rounded-lg border border-red-800/50 bg-white/5 backdrop-blur-sm px-3 py-2 text-white/70 cursor-not-allowed"
            />
            <p className="text-xs text-red-200/60 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="first_name" className="block text-sm font-medium mb-2 text-white">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-white placeholder-red-300/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium mb-2 text-white">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-white placeholder-red-300/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2 text-white">
              Role
            </label>
            <select
              id="role"
              name="role"
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
              className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
            >
              {currentUser?.role === 'super_admin' && (
                <option value="super_admin" className="bg-red-900">Super Admin</option>
              )}
              <option value="viewer" className="bg-red-900">Viewer</option>
              <option value="sales_rep" className="bg-red-900">Sales Rep</option>
              <option value="manager" className="bg-red-900">Manager</option>
              <option value="admin" className="bg-red-900">Admin</option>
            </select>
          </div>

          {formData.role !== 'super_admin' && (
            <div>
              <label htmlFor="account_id" className="block text-sm font-medium mb-2 text-white">
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
                className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 disabled:opacity-50"
              >
                <option value="" className="bg-red-900">Select a company</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id} className="bg-red-900">
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
              className="h-4 w-4 rounded border-red-700/50 bg-white/10 text-red-600 focus:ring-red-500/50"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-red-800/50 bg-red-900/30 px-4 py-2 font-medium text-white hover:bg-red-900/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white text-red-700 px-4 py-2 font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

