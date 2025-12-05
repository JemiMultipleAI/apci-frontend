'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Users, TrendingUp, DollarSign, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Account {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_count: number;
  deal_count: number;
  total_revenue: number;
  created_at: string;
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await apiClient.get(`/accounts/${params.id}`);
        setAccount(response.data.data);
      } catch (error) {
        console.error('Failed to fetch account:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [params.id]);

  const handleDelete = async () => {
    if (!account) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/accounts/${account.id}`);
      router.push('/portal/accounts');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading company...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Company not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 text-gray-900" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{account.name}</h1>
          <p className="text-gray-600">Company Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h2>
            <div className="space-y-4">
              {account.website && (
                <div>
                  <div className="text-sm text-muted-foreground">Website</div>
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {account.website}
                  </a>
                </div>
              )}
              {account.industry && (
                <div>
                  <div className="text-sm text-muted-foreground">Industry</div>
                  <div>{account.industry}</div>
                </div>
              )}
              {account.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{account.email}</span>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{account.phone}</span>
                </div>
              )}
              {(account.address || account.city || account.state || account.country) && (
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div>
                    {account.address && <div>{account.address}</div>}
                    {(account.city || account.state || account.postal_code) && (
                      <div>
                        {account.city && <span>{account.city}, </span>}
                        {account.state && <span>{account.state} </span>}
                        {account.postal_code && <span>{account.postal_code}</span>}
                      </div>
                    )}
                    {account.country && <div>{account.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href={`/portal/contacts?account_id=${account.id}`}
              className="rounded-xl border bg-card p-6 shadow-sm hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Customers</h3>
              </div>
              <div className="text-3xl font-bold">{account.contact_count || 0}</div>
            </Link>

            <Link
              href={`/portal/deals?account_id=${account.id}`}
              className="rounded-xl border bg-card p-6 shadow-sm hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Deals</h3>
              </div>
              <div className="text-3xl font-bold">{account.deal_count || 0}</div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">
                  ${((account.total_revenue || 0) / 1000).toFixed(1)}k
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-sm">
                  {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
            <Link
              href={`/portal/accounts/${account.id}/edit`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Company
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Company
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl border bg-card p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">Delete Company</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {account?.name}? This action cannot be undone and will also delete all associated deals.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border px-4 py-2 font-medium hover:bg-secondary transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-destructive px-4 py-2 font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
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

