'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface DashboardMetrics {
  totalContacts: number;
  totalAccounts: number;
  totalDeals: number;
  activeDeals: number;
  totalRevenue: number;
  pipelineValue: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/analytics/dashboard');
        
        if (response.data.success && response.data.data?.metrics) {
          setMetrics(response.data.data.metrics);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err: any) {
        // Don't set error if it's a 401 - the API interceptor will handle redirect
        if (err.response?.status !== 401) {
          setError(err.response?.data?.error?.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Customers',
      value: metrics?.totalContacts || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Companies',
      value: metrics?.totalAccounts || 0,
      icon: Building2,
      color: 'text-green-500',
    },
    {
      label: 'Active Deals',
      value: metrics?.activeDeals || 0,
      icon: TrendingUp,
      color: 'text-[#DC2626]',
    },
    {
      label: 'Total Revenue',
      value: `$${((metrics?.totalRevenue || 0) / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'text-[#F43F5E]',
    },
    {
      label: 'Pipeline Value',
      value: `$${((metrics?.pipelineValue || 0) / 1000).toFixed(1)}k`,
      icon: Activity,
      color: 'text-[#DC2626]',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome to CRMatIQ — Your CRM On Auto-Pilot
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-xs font-medium uppercase text-gray-600">
                  {metric.label}
                </span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/portal/contacts/new"
              className="block rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Add New Customer</div>
              <div className="text-sm text-gray-600">
                Create a new customer contact
              </div>
            </a>
            <a
              href="/portal/deals/new"
              className="block rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Create New Deal</div>
              <div className="text-sm text-gray-600">
                Start tracking a new sales opportunity
              </div>
            </a>
            <a
              href="/portal/campaigns/new"
              className="block rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-900">Launch Campaign</div>
              <div className="text-sm text-gray-600">
                Create a marketing or subscription reactivation campaign
              </div>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
          <div className="text-sm text-gray-600">
            Activity feed will appear here once you start using the CRM.
          </div>
        </div>
      </section>
    </div>
  );
}

