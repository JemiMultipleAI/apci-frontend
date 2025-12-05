'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Building2, User, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  currency: string;
  description: string | null;
  account_id: string | null;
  account_name: string | null;
  contact_id: string | null;
  contact_name: string | null;
  created_at: string;
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await apiClient.get(`/deals/${params.id}`);
        setDeal(response.data.data);
      } catch (error) {
        console.error('Failed to fetch deal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [params.id]);

  const handleDelete = async () => {
    if (!deal) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/deals/${deal.id}`);
      router.push('/portal/deals');
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Failed to delete deal. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading deal...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Deal not found</div>
      </div>
    );
  }

  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const currentStageIndex = stages.indexOf(deal.stage);

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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{deal.name}</h1>
          <p className="text-gray-600">Deal Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Deal Information</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Stage</div>
                <div className="flex items-center gap-2">
                  {stages.map((stage, index) => (
                    <div key={stage} className="flex items-center">
                      <div
                        className={`h-2 w-16 rounded-full ${
                          index <= currentStageIndex
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      />
                      {index < stages.length - 1 && (
                        <div
                          className={`h-0.5 w-8 ${
                            index < currentStageIndex
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium capitalize">
                    {deal.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Deal Value</div>
                  <div className="text-2xl font-bold">
                    {deal.currency} {deal.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Probability</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{deal.probability}%</span>
                  </div>
                </div>
              </div>

              {deal.expected_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Close Date</div>
                    <div>{new Date(deal.expected_close_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {deal.actual_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Actual Close Date</div>
                    <div>{new Date(deal.actual_close_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {deal.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Related</h2>
            <div className="space-y-4">
              {deal.account_id && (
                <Link
                  href={`/portal/accounts/${deal.account_id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary transition-colors"
                >
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Account</div>
                    <div className="font-medium">{deal.account_name || 'View Account'}</div>
                  </div>
                </Link>
              )}
              {deal.contact_id && (
                <Link
                  href={`/portal/contacts/${deal.contact_id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary transition-colors"
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <div className="font-medium">{deal.contact_name || 'View Contact'}</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
            <Link
              href={`/portal/deals/${deal.id}/edit`}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Deal
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Deal
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl border bg-card p-6 shadow-xl max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">Delete Deal</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {deal?.name}? This action cannot be undone.
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

