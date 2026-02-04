'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface ContactGroup {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
}

export default function ContactGroupsPage() {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/contact-groups', {
          params: { page: 1, limit: 50 },
        });
        setGroups(response.data.data);
      } catch (error) {
        console.error('Failed to fetch contact groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact Groups</h1>
          <p className="text-muted-foreground">
            Organize contacts into groups for campaign targeting
          </p>
        </div>
        <Link
          href="/portal/contact-groups/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
        >
          <Plus className="h-4 w-4" />
          New Group
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contact groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading contact groups...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No contact groups found' : 'No contact groups found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first contact group to organize contacts for campaigns'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/contact-groups/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                New Group
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                href={`/portal/contact-groups/${group.id}`}
                className="rounded-lg border border-border bg-surface-elevated p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{group.name}</h3>
                  <span className="text-sm text-muted-foreground bg-surface px-2 py-1 rounded">
                    {group.member_count} {group.member_count === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {group.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

