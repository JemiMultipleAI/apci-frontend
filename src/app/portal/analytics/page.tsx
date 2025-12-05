'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface DashboardMetrics {
  totalContacts: number;
  totalAccounts: number;
  totalDeals: number;
  activeDeals: number;
  totalRevenue: number;
  pipelineValue: number;
}

interface PipelineStage {
  stage: string;
  count: string;
  total_value: string;
  avg_probability: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashboardRes, dealsRes, revenueRes] = await Promise.all([
          apiClient.get('/analytics/dashboard'),
          apiClient.get('/deals/pipeline'),
          apiClient.get('/analytics/revenue', { params: { period: 30 } }),
        ]);

        setMetrics(dashboardRes.data.data.metrics);
        setPipeline(dealsRes.data.data.pipeline);
        setRevenueData(revenueRes.data.data.revenueOverTime || []);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const stages = ['lead', 'qualified', 'proposal', 'negotiation'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Analytics</h1>
        <p className="text-gray-600">
          Reports and insights for your CRM
        </p>
      </div>

      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Total Contacts</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalContacts}</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Active Deals</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{metrics.activeDeals}</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Total Revenue</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${(metrics.totalRevenue / 1000).toFixed(1)}k
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Pipeline Value</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${(metrics.pipelineValue / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Pipeline by Stage</h2>
          <div className="space-y-4">
            {stages.map((stage) => {
              const stageData = pipeline.find((p) => p.stage === stage);
              const count = parseInt(stageData?.count || '0', 10);
              const value = parseFloat(stageData?.total_value || '0');
              const maxValue = Math.max(
                ...pipeline.map((p) => parseFloat(p.total_value || '0'))
              );

              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">{stage}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{count} deals</div>
                      <div className="text-xs text-gray-600">
                        ${(value / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E]"
                      style={{
                        width: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Revenue Trend (Last 30 Days)</h2>
          {revenueData.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              No revenue data available
            </div>
          ) : (
            <div className="space-y-2">
              {revenueData.slice(-7).map((item: any, index: number) => {
                const maxRevenue = Math.max(
                  ...revenueData.map((r: any) => parseFloat(r.revenue || '0'))
                );
                const revenue = parseFloat(item.revenue || '0');

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: maxRevenue > 0 ? `${(revenue / maxRevenue) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

