'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useUser } from '@/hooks/useUser';
import { hasPermission } from '@/utils/rolePermissions';

interface Campaign {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: string;
  created_at: string;
}

export default function CampaignsPage() {
  const { role } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await apiClient.get('/campaigns', {
          params: { page: 1, limit: 50 },
        });
        setCampaigns(response.data.data);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const statusColors: Record<string, string> = {
    draft: 'bg-surface-elevated text-text-secondary',
    scheduled: 'bg-primary/20 text-primary',
    running: 'bg-success/20 text-success',
    paused: 'bg-warning/20 text-warning',
    completed: 'bg-accent/20 text-accent',
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage marketing and subscription reactivation campaigns
          </p>
        </div>
        {hasPermission(role, 'canManageCampaigns') && (
          <Link
            href="/portal/campaigns/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No campaigns found' : 'No campaigns found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first campaign to engage with customers'}
            </p>
            {!searchTerm && hasPermission(role, 'canManageCampaigns') && (
              <Link
                href="/portal/campaigns/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Campaign Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Channel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-border hover:bg-surface-elevated transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/portal/campaigns/${campaign.id}`} className="hover:underline">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary uppercase">
                        {campaign.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[campaign.status] || 'bg-surface-elevated text-text-secondary'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
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

