'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Survey {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  response_count: number;
  created_at: string;
}

export default function SurveysPage() {
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Surveys</h1>
          <p className="text-gray-600">
            Create and manage customer feedback surveys
          </p>
        </div>
        <Link
          href="/portal/surveys/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          New Survey
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading surveys...
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {searchTerm ? 'No surveys found' : 'No surveys found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first survey to collect customer feedback'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/surveys/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
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
                className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{survey.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      survey.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {survey.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {survey.description}
                  </p>
                )}
                <div className="text-sm text-gray-600">
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

