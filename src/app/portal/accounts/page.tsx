'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2, Download, Upload, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Account {
  id: string;
  name: string;
  industry: string | null;
  contact_count: number;
  deal_count: number;
  total_revenue: number;
  created_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get('/accounts', {
          params: { page: 1, limit: 50 },
        });
        setAccounts(response.data.data);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await apiClient.get('/import-export/accounts/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `companies-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export companies:', error);
      alert('Failed to export companies. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Companies</h1>
          <p className="text-muted-foreground">
            Manage company accounts and business relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || accounts.length === 0}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-text-secondary hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <Link
            href="/portal/accounts/import"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-text-secondary hover:bg-surface-elevated transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import
          </Link>
          <Link
            href="/portal/accounts/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading companies...
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first company
            </p>
            <Link
              href="/portal/accounts/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Company Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Industry</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Customers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Deals</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/portal/accounts/${account.id}`} className="hover:underline">
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {account.industry || '-'}
                    </td>
                    <td className="px-4 py-3 text-foreground">{account.contact_count || 0}</td>
                    <td className="px-4 py-3 text-foreground">{account.deal_count || 0}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ${((account.total_revenue || 0) / 1000).toFixed(1)}k
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
