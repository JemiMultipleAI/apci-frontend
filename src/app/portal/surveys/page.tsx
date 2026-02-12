'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useUser } from '@/hooks/useUser';
import { hasPermission } from '@/utils/rolePermissions';

interface Survey {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  response_count: number;
  created_at: string;
}

export default function SurveysPage() {
  const { role } = useUser();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await apiClient.get('/surveys', {
          params: { page: 1, limit: 50 },
        });
        setSurveys(response.data.data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const filteredSurveys = surveys.filter((survey) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      survey.name.toLowerCase().includes(searchLower) ||
      (survey.description && survey.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Surveys</h1>
          <p className="text-muted-foreground">
            Create and manage customer feedback surveys
          </p>
        </div>
        {hasPermission(role, 'canManageSurveys') && (
          <Link
            href="/portal/surveys/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
          >
            <Plus className="h-4 w-4" />
            New Survey
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading surveys...
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {searchTerm ? 'No surveys found' : 'No surveys found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first survey to collect customer feedback'}
            </p>
            {!searchTerm && hasPermission(role, 'canManageSurveys') && (
              <Link
                href="/portal/surveys/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
              >
                <Plus className="h-4 w-4" />
                New Survey
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSurveys.map((survey) => (
              <Link
                key={survey.id}
                href={`/portal/surveys/${survey.id}`}
                className="rounded-lg border border-border bg-surface-elevated p-4 hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{survey.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      survey.is_active
                        ? 'bg-success/20 text-success'
                        : 'bg-surface px-2 py-1 text-text-secondary'
                    }`}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {survey.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {survey.description}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {survey.response_count} responses
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
