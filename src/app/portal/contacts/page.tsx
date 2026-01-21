'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Users, Download, Upload, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import AdvancedFilters, { FilterState } from '@/components/filters/advanced-filters';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  lifecycle_stage: string;
  created_at: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ lifecycle_stage: '' });
  const [filters, setFilters] = useState<FilterState>({});

  const fetchContacts = async (filterParams?: FilterState) => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page: 1, limit: 50 };
      
      if (filterParams?.lifecycle_stage && filterParams.lifecycle_stage.length > 0) {
        params.lifecycle_stages = filterParams.lifecycle_stage.join(',');
      }
      if (filterParams?.account_id) {
        params.account_id = filterParams.account_id;
      }
      if (filterParams?.date_from) {
        params.date_from = filterParams.date_from;
      }
      if (filterParams?.date_to) {
        params.date_to = filterParams.date_to;
      }
      if (filterParams?.search) {
        params.search = filterParams.search;
      }

      const response = await apiClient.get('/contacts', { params });
      setContacts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await apiClient.get('/accounts', {
        params: { page: 1, limit: 100 },
      });
      setAccounts(response.data.data.map((acc: any) => ({ id: acc.id, name: acc.name })));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  useEffect(() => {
    fetchContacts(filters);
  }, [filters]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await apiClient.get('/import-export/contacts/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export customers:', error);
      alert('Failed to export customers. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    
    setBulkUpdating(true);
    try {
      const updates: Record<string, any> = {};
      if (bulkEditData.lifecycle_stage) {
        updates.lifecycle_stage = bulkEditData.lifecycle_stage;
      }

      if (Object.keys(updates).length === 0) {
        alert('Please select at least one field to update');
        return;
      }

      await apiClient.post('/bulk-operations/contacts/update', {
        ids: Array.from(selectedIds),
        updates,
      });

      setSelectedIds(new Set());
      setShowBulkEdit(false);
      setBulkEditData({ lifecycle_stage: '' });
      fetchContacts();
    } catch (error) {
      console.error('Failed to update customers:', error);
      alert('Failed to update customers. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setBulkUpdating(true);
    try {
      await apiClient.post('/bulk-operations/contacts/delete', {
        ids: Array.from(selectedIds),
      });

      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete customers:', error);
      alert('Failed to delete customers. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer contacts and track lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || contacts.length === 0}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <Link
            href="/portal/contacts/import"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-text-secondary hover:bg-surface-elevated transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import
          </Link>
          <Link
            href="/portal/contacts/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-border bg-surface-elevated p-4 shadow-sm flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkEdit(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-elevated transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/20 px-3 py-1.5 text-sm text-error hover:bg-error/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-elevated transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <AdvancedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            filterOptions={{
              lifecycle_stages: ['lead', 'qualified', 'customer', 'churned'],
              accounts: accounts,
            }}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading customers...
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first customer
            </p>
            <Link
              href="/portal/contacts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium w-12 text-foreground">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === contacts.length && contacts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border bg-background"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border hover:bg-surface-elevated transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border bg-background"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/contacts/${contact.id}`}
                        className="font-medium hover:underline text-foreground"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {contact.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {contact.mobile || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary">
                        {contact.lifecycle_stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showBulkEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full mx-4 shadow-xl glass">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Bulk Edit Customers</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Lifecycle Stage</label>
                <select
                  value={bulkEditData.lifecycle_stage}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, lifecycle_stage: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="">No change</option>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="customer">Customer</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowBulkEdit(false);
                    setBulkEditData({ lifecycle_stage: '' });
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-elevated transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdating}
                  className="px-4 py-2 rounded-lg bg-gradient-tech text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 btn-tech"
                >
                  {bulkUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full mx-4 shadow-xl glass">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Delete Customers</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkUpdating}
                className="px-4 py-2 rounded-lg bg-error text-white font-semibold hover:bg-error/80 transition-all disabled:opacity-50"
              >
                {bulkUpdating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

