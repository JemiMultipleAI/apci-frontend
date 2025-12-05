'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Survey {
  id: string;
  name: string;
  description: string | null;
  questions: any[];
  is_active: boolean;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

interface SurveyResponse {
  id: string;
  contact_name: string | null;
  account_name: string | null;
  responses: any;
  sentiment_score: number | null;
  ai_analysis: string | null;
  completed_at: string;
}

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [responsesPage, setResponsesPage] = useState(1);
  const [responsesTotal, setResponsesTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyRes, responsesRes] = await Promise.all([
          apiClient.get(`/surveys/${params.id}`),
          apiClient.get(`/surveys/${params.id}/responses`, {
            params: { page: responsesPage, limit: 20 },
          }),
        ]);
        setSurvey(surveyRes.data.data);
        setResponses(responsesRes.data.data);
        setResponsesTotal(responsesRes.data.pagination?.total || 0);
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, responsesPage]);

  const handleDelete = async () => {
    if (!survey) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/surveys/${survey.id}`);
      router.push('/portal/surveys');
    } catch (error) {
      console.error('Failed to delete survey:', error);
      alert('Failed to delete survey. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading survey...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Survey not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border p-2 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{survey.name}</h1>
          <p className="text-red-200/80 mt-1">
            {survey.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              survey.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {survey.is_active ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-800/50 bg-red-900/30 p-2 text-red-400 hover:bg-red-900/50 transition-colors"
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/30 p-4">
          <p className="text-red-200 mb-4">Are you sure you want to delete this survey? This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-red-800/50 bg-red-900/30 px-4 py-2 text-white hover:bg-red-900/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Questions</h2>
            {survey.questions && survey.questions.length > 0 ? (
              <div className="space-y-4">
                {survey.questions.map((question: any, index: number) => (
                  <div key={index} className="rounded-lg border border-red-800/50 bg-white/5 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-red-200/70">Question {index + 1}</span>
                      <span className="rounded-full bg-red-900/30 px-2 py-1 text-xs text-red-200/70 capitalize">
                        {question.type || 'text'}
                      </span>
                    </div>
                    <p className="text-white">{question.question}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-200/70">No questions defined</p>
            )}
          </div>

          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Responses ({responsesTotal})</h2>
            {responses.length > 0 ? (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="rounded-lg border border-red-800/50 bg-white/5 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {response.contact_name && (
                          <p className="text-white font-medium">{response.contact_name}</p>
                        )}
                        {response.account_name && (
                          <p className="text-sm text-red-200/70">{response.account_name}</p>
                        )}
                        <p className="text-xs text-red-200/50 mt-1">
                          {new Date(response.completed_at).toLocaleString()}
                        </p>
                      </div>
                      {response.sentiment_score !== null && (
                        <div className="flex items-center gap-2">
                          {response.sentiment_score >= 0.5 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm text-red-200/70">
                            {(response.sentiment_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {Object.entries(response.responses || {}).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-red-200/70 font-medium">{key}:</span>{' '}
                          <span className="text-white">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    {response.ai_analysis && (
                      <div className="mt-3 pt-3 border-t border-red-800/50">
                        <p className="text-xs text-red-200/70 font-medium mb-1">AI Analysis:</p>
                        <p className="text-sm text-red-200/80">{response.ai_analysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-200/70">No responses yet</p>
            )}
            {responsesTotal > 20 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-800/50">
                <button
                  onClick={() => setResponsesPage(p => Math.max(1, p - 1))}
                  disabled={responsesPage === 1}
                  className="rounded-lg border border-red-800/50 bg-red-900/30 px-3 py-1 text-sm text-white hover:bg-red-900/50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-red-200/70">
                  Page {responsesPage} of {Math.ceil(responsesTotal / 20)}
                </span>
                <button
                  onClick={() => setResponsesPage(p => p + 1)}
                  disabled={responsesPage >= Math.ceil(responsesTotal / 20)}
                  className="rounded-lg border border-red-800/50 bg-red-900/30 px-3 py-1 text-sm text-white hover:bg-red-900/50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-red-200/70">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      survey.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {survey.created_by_name && (
                <div>
                  <div className="text-sm text-red-200/70">Created By</div>
                  <div className="mt-1 text-white">{survey.created_by_name}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-red-200/70">Created</div>
                <div className="mt-1 text-white">
                  {new Date(survey.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-red-200/70">Last Updated</div>
                <div className="mt-1 text-white">
                  {new Date(survey.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-red-200/70">Total Responses</div>
                <div className="mt-1 text-white font-semibold">{responsesTotal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

