'use client';

import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Mail, MessageSquare, Phone, FileText, CheckSquare, Users, Search } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface Activity {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  performed_by_name: string | null;
  created_at: string;
  metadata: any;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params: any = { page: 1, limit: 100 };
        if (filter !== 'all') {
          params.type = filter;
        }
        const response = await apiClient.get('/activities', { params });
        setActivities(response.data.data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [filter]);

  const typeIcons: Record<string, any> = {
    call: Phone,
    email: Mail,
    sms: MessageSquare,
    note: FileText,
    task: CheckSquare,
    meeting: Users,
    survey: FileText,
  };

  const typeColors: Record<string, string> = {
    call: 'bg-blue-100 text-blue-800',
    email: 'bg-green-100 text-green-800',
    sms: 'bg-purple-100 text-purple-800',
    note: 'bg-gray-100 text-gray-800',
    task: 'bg-orange-100 text-orange-800',
    meeting: 'bg-indigo-100 text-indigo-800',
    survey: 'bg-pink-100 text-pink-800',
  };

  const activityTypes = ['all', 'call', 'email', 'sms', 'note', 'task', 'meeting', 'survey'];

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    if (!matchesFilter) return false;
    
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (activity.subject && activity.subject.toLowerCase().includes(searchLower)) ||
      (activity.description && activity.description.toLowerCase().includes(searchLower)) ||
      (activity.performed_by_name && activity.performed_by_name.toLowerCase().includes(searchLower)) ||
      activity.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Activity</h1>
        <p className="text-gray-600">
          View all customer interactions and activities
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
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
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-12 text-center">
            <ActivityIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {searchTerm ? 'No activities found' : 'No activities found'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Activities will appear here as you interact with contacts and accounts'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = typeIcons[activity.type] || ActivityIcon;
              const date = new Date(activity.created_at);
              const isToday = date.toDateString() === new Date().toDateString();
              const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();

              let dateLabel = '';
              if (isToday) {
                dateLabel = `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              } else if (isYesterday) {
                dateLabel = `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              } else {
                dateLabel = date.toLocaleString();
              }

              return (
                <div
                  key={activity.id}
                  className="flex gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${typeColors[activity.type] || 'bg-gray-100 text-gray-800'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 capitalize">{activity.type}</span>
                          {activity.subject && (
                            <span className="text-gray-600">- {activity.subject}</span>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          {activity.performed_by_name && (
                            <span>By {activity.performed_by_name}</span>
                          )}
                          <span>{dateLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

