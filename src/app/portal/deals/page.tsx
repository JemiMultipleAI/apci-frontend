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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Deals</h1>
          <p className="text-gray-600">
            Manage your sales pipeline
          </p>
        </div>
        <Link
          href="/portal/deals/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
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
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 text-sm font-medium text-gray-600 capitalize">{stage}</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stageData?.count || 0}
                </div>
                <div className="text-xs text-gray-600">
                  ${((stageData?.total_value || 0) / 1000).toFixed(1)}k
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading deals...
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {searchTerm ? 'No deals found' : 'No deals found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start tracking your sales opportunities'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/deals/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
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
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Deal Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Probability</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/portal/deals/${deal.id}`} className="hover:underline">
                        {deal.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {deal.account_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 capitalize">
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E]"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
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

