'use client';

import { useEffect, useState } from 'react';
import { Plus, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
  probability: number;
  account_name: string | null;
  created_at: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsRes, pipelineRes] = await Promise.all([
          apiClient.get('/deals', { params: { page: 1, limit: 50 } }),
          apiClient.get('/deals/pipeline'),
        ]);
        setDeals(dealsRes.data.data);
        setPipeline(pipelineRes.data.data);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stages = ['lead', 'qualified', 'proposal', 'negotiation'];
  const filteredDeals = deals.filter((deal) =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deal.account_name && deal.account_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline
          </p>
        </div>
        <Link
          href="/portal/deals/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
        >
          <Plus className="h-4 w-4" />
          New Deal
        </Link>
      </div>

      {pipeline && (
        <div className="grid gap-4 md:grid-cols-4">
          {stages.map((stage) => {
            const stageData = pipeline.pipeline.find((p: any) => p.stage === stage);
            return (
              <div
                key={stage}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-2 text-sm font-medium text-muted-foreground capitalize">{stage}</div>
                <div className="text-2xl font-semibold text-foreground">
                  {stageData?.count || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${((stageData?.total_value || 0) / 1000).toFixed(1)}k
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading deals...
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No deals found' : 'No deals found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start tracking your sales opportunities'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/deals/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                New Deal
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Deal Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Probability</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-border hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/portal/deals/${deal.id}`} className="hover:underline">
                        {deal.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {deal.account_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary capitalize">
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-surface-elevated">
                          <div
                            className="h-2 rounded-full bg-gradient-tech"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {deal.probability}%
                        </span>
                      </div>
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
