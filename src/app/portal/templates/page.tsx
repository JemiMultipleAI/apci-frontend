'use client';

import { useEffect, useState } from 'react';
import { Plus, Mail, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject: string | null;
  body: string;
  created_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const params: any = {};
        if (filter !== 'all') {
          params.type = filter;
        }
        const response = await apiClient.get('/templates', { params });
        setTemplates(response.data.data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [filter]);

  const filteredTemplates = templates.filter((template) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      (template.subject && template.subject.toLowerCase().includes(searchLower)) ||
      template.body.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Templates</h1>
          <p className="text-gray-600">
            Manage email and SMS templates
          </p>
        </div>
        <Link
          href="/portal/templates/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          New Template
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex gap-2">
            {(['all', 'email', 'sms'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize ${
                  filter === type
                    ? 'bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading templates...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {searchTerm ? 'No templates found' : 'No templates found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first template to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/templates/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                New Template
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/portal/templates/${template.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {template.type === 'email' ? (
                      <Mail className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    )}
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 uppercase">
                    {template.type}
                  </span>
                </div>
                {template.subject && (
                  <p className="text-sm text-gray-600 mb-2">
                    Subject: {template.subject}
                  </p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {template.body}
                </p>
                <div className="text-xs text-gray-500">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

