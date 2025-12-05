'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Trash2, Edit, UserCog } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

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
      case 'sales_rep':
        return 'bg-blue-600/50 text-blue-100';
      case 'viewer':
        return 'bg-gray-600/50 text-gray-100';
      default:
        return 'bg-gray-600/50 text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading employee...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Employee not found</div>
      </div>
    );
  }

  const fullName = employee.first_name || employee.last_name
    ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
    : 'No name';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-red-800/50 bg-red-900/30 p-2 hover:bg-red-900/50 transition-colors text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {fullName}
          </h1>
          <p className="text-red-200/80">Employee Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Employee Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-300/70" />
                <span className="text-white">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5 text-red-300/70" />
                <div className="flex items-center gap-2">
                  <span className="text-white">Role:</span>
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
                <span className="text-white">Company:</span>
                <span className="text-red-200/80">
                  {employee.role === 'super_admin' ? (
                    <span className="text-red-300/70 italic">System Admin</span>
                  ) : employee.company_id ? (
                    <Link
                      href={`/portal/accounts/${employee.company_id}`}
                      className="hover:underline text-red-200"
                    >
                      {employee.company_id}
                    </Link>
                  ) : (
                    <span className="text-red-300/70 italic">No company</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-red-300/70" />
                <span className="text-sm text-red-200/80">
                  Created {new Date(employee.created_at).toLocaleDateString()}
                </span>
              </div>
              {employee.updated_at && employee.updated_at !== employee.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-red-300/70" />
                  <span className="text-sm text-red-200/80">
                    Updated {new Date(employee.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-red-200/80">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      employee.is_active
                        ? 'bg-green-600/50 text-green-100'
                        : 'bg-gray-600/50 text-gray-100'
                    }`}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl space-y-3">
            <Link
              href={`/portal/employees/${employee.id}/edit`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-white text-red-700 px-4 py-2 font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Edit className="h-4 w-4" />
              Edit Employee
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-red-700/50 bg-red-900/30 px-4 py-2 font-medium text-red-200 hover:bg-red-900/50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Employee
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-900/95 to-rose-900/95 backdrop-blur-md p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Delete Employee</h3>
                <p className="text-red-200/80 mb-6">
                  Are you sure you want to delete {fullName}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-red-800/50 bg-red-900/30 px-4 py-2 font-medium text-white hover:bg-red-900/50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

