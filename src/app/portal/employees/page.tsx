'use client';

import { useEffect, useState } from 'react';
import { Plus, UserCog, Search } from 'lucide-react';
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
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user role
        const userResponse = await apiClient.get('/auth/me');
        if (userResponse.data.success) {
          setCurrentUserRole(userResponse.data.data.role);
        }

        // Fetch employees
        const response = await apiClient.get('/users', {
          params: { page: 1, limit: 50 },
        });
        setEmployees(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.role.toLowerCase().includes(searchLower)
    );
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground">
            Manage your internal team members
          </p>
        </div>
        {currentUserRole === 'super_admin' && (
          <div className="flex items-center gap-2">
            <Link
              href="/portal/employees/new"
              className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-12 text-center">
            <UserCog className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No employees found' : 'No employees found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by adding your first team member'}
            </p>
            {!searchTerm && currentUserRole === 'super_admin' && (
              <Link
                href="/portal/employees/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-border hover:bg-surface-elevated transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/employees/${employee.id}`}
                        className="font-medium hover:underline text-foreground"
                      >
                        {employee.first_name || employee.last_name
                          ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
                          : 'No name'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {employee.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary capitalize">
                        {employee.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {employee.role === 'super_admin' ? (
                        <span className="text-muted-foreground italic">System Admin</span>
                      ) : employee.company_id ? (
                        <span>{employee.company_id}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No company</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          employee.is_active
                            ? 'bg-success/20 text-success'
                            : 'bg-surface-elevated text-text-secondary'
                        }`}
                      >
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(employee.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

