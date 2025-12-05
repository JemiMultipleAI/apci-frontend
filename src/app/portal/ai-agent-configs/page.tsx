'use client';

import { useEffect, useState } from 'react';
import { Plus, Bot, Search } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface AgentConfig {
  id: string;
  account_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  account_name: string | null;
}

export default function AgentConfigsPage() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await apiClient.get('/ai-agent-configs', {
          params: { page: 1, limit: 50 },
        });
        setConfigs(response.data.data);
      } catch (error) {
        console.error('Failed to fetch agent configs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const filteredConfigs = configs.filter((config) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      config.name.toLowerCase().includes(searchLower) ||
      (config.description && config.description.toLowerCase().includes(searchLower)) ||
      (config.account_name && config.account_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">AI Agent Configurations</h1>
          <p className="text-gray-600">
            Manage ElevenLabs agent configurations for companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/portal/ai-agent-configs/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Add Agent Config
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading agent configurations...
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="py-12 text-center">
            <Bot className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {searchTerm ? 'No configurations found' : 'No agent configurations found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by creating your first agent configuration'}
            </p>
            {!searchTerm && (
              <Link
                href="/portal/ai-agent-configs/new"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Add Agent Config
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredConfigs.map((config) => (
                  <tr
                    key={config.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/ai-agent-configs/${config.id}`}
                        className="font-medium hover:underline text-gray-900"
                      >
                        {config.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {config.account_name ? (
                        <Link
                          href={`/portal/accounts/${config.account_id}`}
                          className="hover:underline text-[#DC2626]"
                        >
                          {config.account_name}
                        </Link>
                      ) : (
                        <span className="text-gray-500 italic">System-wide</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {config.description || (
                        <span className="text-gray-500 italic">No description</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          config.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(config.created_at).toLocaleDateString()}
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

