'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import { canUpdate, canDelete } from '@/utils/rolePermissions';

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
  const { role } = useUser();
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
        <div className="text-muted-foreground">Loading survey...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Survey not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{survey.name}</h1>
          <p className="text-muted-foreground mt-1">
            {survey.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              survey.is_active
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-surface-elevated border border-border text-muted-foreground'
            }`}
          >
            {survey.is_active ? 'Active' : 'Inactive'}
          </span>
          {canDelete(role) && (
            <Button variant="danger" size="sm" className="p-2" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4 shadow-xl">
            <p className="text-muted-foreground mb-4">Are you sure you want to delete this survey? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Questions</h2>
            {survey.questions && survey.questions.length > 0 ? (
              <div className="space-y-4">
                {survey.questions.map((question: any, index: number) => (
                  <div key={index} className="rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      <span className="rounded-full bg-surface-elevated border border-border px-2 py-1 text-xs text-muted-foreground capitalize">
                        {question.type || 'text'}
                      </span>
                    </div>
                    <p className="text-foreground">{question.question}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No questions defined</p>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Responses ({responsesTotal})</h2>
            {responses.length > 0 ? (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {response.contact_name && (
                          <p className="text-foreground font-medium">{response.contact_name}</p>
                        )}
                        {response.account_name && (
                          <p className="text-sm text-muted-foreground">{response.account_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(response.completed_at).toLocaleString()}
                        </p>
                      </div>
                      {response.sentiment_score !== null && (
                        <div className="flex items-center gap-2">
                          {response.sentiment_score >= 0.5 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-error" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {(response.sentiment_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {Object.entries(response.responses || {}).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground font-medium">{key}:</span>{' '}
                          <span className="text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    {response.ai_analysis && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium mb-1">AI Analysis:</p>
                        <p className="text-sm text-muted-foreground">{response.ai_analysis}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No responses yet</p>
            )}
            {responsesTotal > 20 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Button variant="secondary" size="sm" onClick={() => setResponsesPage(p => Math.max(1, p - 1))} disabled={responsesPage === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {responsesPage} of {Math.ceil(responsesTotal / 20)}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setResponsesPage(p => p + 1)} disabled={responsesPage >= Math.ceil(responsesTotal / 20)}>
                  Next
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      survey.is_active
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-surface-elevated border border-border text-muted-foreground'
                    }`}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {survey.created_by_name && (
                <div>
                  <div className="text-sm text-muted-foreground">Created By</div>
                  <div className="mt-1 text-foreground">{survey.created_by_name}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="mt-1 text-foreground">
                  {new Date(survey.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="mt-1 text-foreground">
                  {new Date(survey.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
                <div className="mt-1 text-foreground font-semibold">{responsesTotal}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

