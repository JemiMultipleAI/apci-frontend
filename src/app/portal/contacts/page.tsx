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
  phone: string | null;
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Customers</h1>
          <p className="text-gray-600">
            Manage customer contacts and track lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || contacts.length === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <Link
            href="/portal/contacts/import"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import
          </Link>
          <Link
            href="/portal/contacts/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkEdit(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
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
          <div className="py-8 text-center text-gray-600">
            Loading customers...
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No customers found</h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first customer
            </p>
            <Link
              href="/portal/contacts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium w-12 text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === contacts.length && contacts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 bg-white"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 bg-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/contacts/${contact.id}`}
                        className="font-medium hover:underline text-gray-900"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contact.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contact.phone || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {contact.lifecycle_stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Bulk Edit Customers</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Lifecycle Stage</label>
                <select
                  value={bulkEditData.lifecycle_stage}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, lifecycle_stage: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
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
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdating}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Customers</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkUpdating}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
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

