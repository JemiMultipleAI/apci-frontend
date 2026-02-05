'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Users, TrendingUp, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';

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
        <div className="text-muted-foreground">Loading company...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Company not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{account.name}</h1>
          <p className="text-muted-foreground">Company Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Company Information</h2>
            <div className="space-y-4">
              {account.website && (
                <div>
                  <div className="text-sm text-muted-foreground">Website</div>
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-foreground"
                  >
                    {account.website}
                  </a>
                </div>
              )}
              {account.industry && (
                <div>
                  <div className="text-sm text-muted-foreground">Industry</div>
                  <div className="text-foreground">{account.industry}</div>
                </div>
              )}
              {account.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{account.email}</span>
                </div>
              )}
              {account.phone && (
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{account.phone}</span>
                </div>
              )}
              {(account.address || account.city || account.state || account.country) && (
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="text-foreground">
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
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href={`/portal/contacts?account_id=${account.id}`}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:bg-surface-elevated transition-colors block"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">Customers</h3>
              </div>
              <div className="text-3xl font-bold text-foreground">{account.contact_count || 0}</div>
            </Link>

            <Link
              href={`/portal/deals?account_id=${account.id}`}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:bg-surface-elevated transition-colors block"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">Deals</h3>
              </div>
              <div className="text-3xl font-bold text-foreground">{account.deal_count || 0}</div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold text-foreground">
                  ${((account.total_revenue || 0) / 1000).toFixed(1)}k
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-sm text-foreground">
                  {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Link
              href={`/portal/accounts/${account.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Company
            </Link>
            <Button
              variant="danger"
              className="w-full gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Company
            </Button>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Company</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {account?.name}? This action cannot be undone and will also delete all associated deals.
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

