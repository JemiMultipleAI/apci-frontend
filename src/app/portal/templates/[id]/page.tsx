'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MessageSquare, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject: string | null;
  body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await apiClient.get(`/templates/${params.id}`);
        setTemplate(response.data.data);
      } catch (error) {
        console.error('Failed to fetch template:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  const handleDelete = async () => {
    if (!template) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/templates/${template.id}`);
      router.push('/portal/templates');
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Loading template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-200/80">Template not found</div>
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
          <div className="flex items-center gap-3">
            {template.type === 'email' ? (
              <Mail className="h-6 w-6 text-blue-500" />
            ) : (
              <MessageSquare className="h-6 w-6 text-green-500" />
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-white">{template.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium uppercase">
            {template.type}
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
          <p className="text-red-200 mb-4">Are you sure you want to delete this template? This action cannot be undone.</p>
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
            <h2 className="text-xl font-semibold mb-4 text-white">Template Content</h2>
            {template.type === 'email' && template.subject && (
              <div className="mb-4">
                <div className="text-sm text-red-200/70 mb-2">Subject</div>
                <div className="text-white bg-white/5 p-3 rounded-lg border border-red-800/50">
                  {template.subject}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-red-200/70 mb-2">Body</div>
              <div className="text-white bg-white/5 p-4 rounded-lg border border-red-800/50 font-mono text-sm whitespace-pre-wrap">
                {template.body}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-red-800/30 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-red-200/70">Type</div>
                <div className="mt-1">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium uppercase">
                    {template.type}
                  </span>
                </div>
              </div>
              {template.variables && template.variables.length > 0 && (
                <div>
                  <div className="text-sm text-red-200/70 mb-2">Available Variables</div>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-red-900/30 border border-red-800/50 px-2 py-1 text-xs text-red-200 font-mono"
                      >
                        {'{{' + variable + '}}'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-red-200/70">Created</div>
                <div className="mt-1 text-white">
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-red-200/70">Last Updated</div>
                <div className="mt-1 text-white">
                  {new Date(template.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

