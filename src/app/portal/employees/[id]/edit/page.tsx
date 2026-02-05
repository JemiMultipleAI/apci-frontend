'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, PageHeader, Alert } from '@/components/ui';

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
        <div className="text-muted-foreground">Loading employee...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Employee" description="Update employee information" />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
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
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                name="role"
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
                  required
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

            <div className="flex items-center gap-3 pt-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
              />
              <Label htmlFor="is_active" className="mb-0">Active</Label>
            </div>
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

