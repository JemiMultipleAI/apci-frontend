'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Trash2, Edit, UserCog } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';

interface Employee {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await apiClient.get(`/users/${params.id}`);
        setEmployee(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  const handleDelete = async () => {
    if (!employee) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${employee.id}`);
      router.push('/portal/employees');
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      alert(error.response?.data?.error?.message || 'Failed to delete employee. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-600/50 text-purple-100';
      case 'admin':
        return 'bg-red-600/50 text-red-100';
      case 'manager':
        return 'bg-orange-600/50 text-orange-100';
      case 'viewer':
        return 'bg-gray-600/50 text-gray-100';
      default:
        return 'bg-gray-600/50 text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading employee...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Employee not found</div>
      </div>
    );
  }

  const fullName = employee.first_name || employee.last_name
    ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
    : 'No name';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {fullName}
          </h1>
          <p className="text-muted-foreground">Employee Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Employee Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-foreground">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Role:</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getRoleBadgeColor(
                      employee.role
                    )}`}
                  >
                    {employee.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-foreground">Company:</span>
                <span className="text-muted-foreground">
                  {employee.role === 'super_admin' ? (
                    <span className="italic">System Admin</span>
                  ) : employee.company_id ? (
                    <Link
                      href={`/portal/accounts/${employee.company_id}`}
                      className="hover:underline text-primary"
                    >
                      {employee.company_id}
                    </Link>
                  ) : (
                    <span className="italic">No company</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Created {new Date(employee.created_at).toLocaleDateString()}
                </span>
              </div>
              {employee.updated_at && employee.updated_at !== employee.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(employee.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      employee.is_active
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-surface-elevated border border-border text-muted-foreground'
                    }`}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Link
              href={`/portal/employees/${employee.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Employee
            </Link>
            <Button variant="danger" className="w-full gap-2" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Employee
            </Button>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Employee</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {fullName}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

