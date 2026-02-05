'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Building2, User, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';

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
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{deal.name}</h1>
          <p className="text-muted-foreground">Deal Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Deal Information</h2>
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
                            : 'bg-surface-elevated'
                        }`}
                      />
                      {index < stages.length - 1 && (
                        <div
                          className={`h-0.5 w-8 ${
                            index < currentStageIndex
                              ? 'bg-primary'
                              : 'bg-surface-elevated'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className="rounded-full bg-surface-elevated border border-border px-2 py-1 text-xs font-medium capitalize text-foreground">
                    {deal.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Deal Value</div>
                  <div className="text-2xl font-bold text-foreground">
                    {deal.currency} {deal.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Probability</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-surface-elevated">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{deal.probability}%</span>
                  </div>
                </div>
              </div>

              {deal.expected_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Close Date</div>
                    <div className="text-foreground">{new Date(deal.expected_close_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {deal.actual_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Actual Close Date</div>
                    <div className="text-foreground">{new Date(deal.actual_close_date).toLocaleDateString()}</div>
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
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Related</h2>
            <div className="space-y-4">
              {deal.account_id && (
                <Link
                  href={`/portal/accounts/${deal.account_id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-elevated transition-colors"
                >
                  <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Account</div>
                    <div className="font-medium text-foreground">{deal.account_name || 'View Account'}</div>
                  </div>
                </Link>
              )}
              {deal.contact_id && (
                <Link
                  href={`/portal/contacts/${deal.contact_id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-elevated transition-colors"
                >
                  <User className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <div className="font-medium text-foreground">{deal.contact_name || 'View Contact'}</div>
                  </div>
                </Link>
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <Link
              href={`/portal/deals/${deal.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Deal
            </Link>
            <Button variant="danger" className="w-full gap-2" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Deal
            </Button>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Deal</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {deal?.name}? This action cannot be undone.
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

