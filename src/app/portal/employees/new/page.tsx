'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { getCompanyId } from '@/lib/cookies';
import { Button, Card, Input, Select, Label, PageHeader, Alert } from '@/components/ui';

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
      <PageHeader
        title="Create New Employee"
        description="Add a new team member to your CRM"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
              <Label htmlFor="email" required>Email</Label>
              <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
              <Label htmlFor="password" required>Password</Label>
              <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div>
              <Label htmlFor="role" required>Role</Label>
              <Select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as typeof formData.role;
                setFormData({
                  ...formData,
                  role: newRole,
                  account_id: newRole === 'super_admin' ? null : formData.account_id,
                });
              }}
            >
              {currentUser?.role === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
              <option value="viewer">Viewer</option>
              <option value="sales_rep">Sales Rep</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              </Select>
          </div>

          {formData.role !== 'super_admin' && (
            <div>
                <Label htmlFor="account_id" required>Company</Label>
                <Select
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
              >
                <option value="">Select a company</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
                </Select>
            </div>
          )}

          <div className="flex items-center gap-3 pt-8">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
              <Label htmlFor="is_active">Active</Label>
          </div>
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
            {saving ? 'Creating...' : 'Create Employee'}
            </Button>
        </div>
      </form>
      </Card>
    </div>
  );
}

