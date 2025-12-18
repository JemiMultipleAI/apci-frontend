'use client';

import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Mail, MessageSquare, Phone, FileText, CheckSquare, Users, Search, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

interface ConversationMessage {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  performed_by_name: string | null;
  created_at: string;
  metadata: any;
  direction: 'inbound' | 'outbound';
  ai_generated?: boolean;
}

interface Conversation {
  contact_id: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_mobile: string | null;
  channel: string;
  messages: ConversationMessage[];
  last_activity: string;
}

export default function ActivityPage() {
  const [viewMode, setViewMode] = useState<'list' | 'conversations'>('conversations');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (viewMode === 'conversations') {
          const params: any = { page: 1, limit: 50 };
          if (filter === 'email' || filter === 'sms') {
            params.type = filter;
          } else if (filter !== 'all') {
            // For non-email/sms filters, fall back to list view
            setViewMode('list');
            const listParams: any = { page: 1, limit: 100 };
            listParams.type = filter;
            const listResponse = await apiClient.get('/activities', { params: listParams });
            setActivities(listResponse.data.data);
            setLoading(false);
            return;
          }
          const response = await apiClient.get('/activities/conversations', { params });
          setConversations(response.data.data);
        } else {
          const params: any = { page: 1, limit: 100 };
          if (filter !== 'all') {
            params.type = filter;
          }
          const response = await apiClient.get('/activities', { params });
          setActivities(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, viewMode]);

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

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.contact_name.toLowerCase().includes(searchLower) ||
      (conversation.contact_email && conversation.contact_email.toLowerCase().includes(searchLower)) ||
      (conversation.contact_mobile && conversation.contact_mobile.toLowerCase().includes(searchLower)) ||
      conversation.messages.some(msg => 
        (msg.subject && msg.subject.toLowerCase().includes(searchLower)) ||
        (msg.description && msg.description.toLowerCase().includes(searchLower))
      )
    );
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const isToday = date.toDateString() === new Date().toDateString();
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString();
    }
  };

  const toggleConversation = (conversationKey: string) => {
    setExpandedConversations(prev => {
      const next = new Set(prev);
      if (next.has(conversationKey)) {
        next.delete(conversationKey);
      } else {
        next.add(conversationKey);
      }
      return next;
    });
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('conversations')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'conversations'
                  ? 'bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Conversations
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ActivityIcon className="h-4 w-4 inline mr-2" />
              All Activities
            </button>
          </div>
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
              placeholder={viewMode === 'conversations' ? 'Search conversations...' : 'Search activities...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">
            Loading {viewMode === 'conversations' ? 'conversations' : 'activities'}...
          </div>
        ) : viewMode === 'conversations' ? (
          filteredConversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {searchTerm ? 'No conversations found' : 'No conversations found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Email and SMS conversations will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const conversationKey = `${conversation.contact_id}_${conversation.channel}`;
                const isExpanded = expandedConversations.has(conversationKey);
                const Icon = conversation.channel === 'email' ? Mail : MessageSquare;
                const channelColor = conversation.channel === 'email' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';

                return (
                  <div
                    key={conversationKey}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleConversation(conversationKey)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${channelColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{conversation.contact_name}</span>
                            <span className="text-xs text-gray-500 capitalize">({conversation.channel})</span>
                            {conversation.contact_id && (
                              <Link
                                href={`/portal/contacts/${conversation.contact_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View Contact
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}</span>
                            <span>Last: {formatTime(conversation.last_activity)}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3 max-h-96 overflow-y-auto">
                        {conversation.messages.map((message) => {
                          const isInbound = message.direction === 'inbound';
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isInbound
                                    ? 'bg-white border border-gray-200'
                                    : 'bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white'
                                }`}
                              >
                                {message.subject && (
                                  <div className={`font-semibold mb-1 ${isInbound ? 'text-gray-900' : 'text-white'}`}>
                                    {message.subject}
                                  </div>
                                )}
                                <div className={`text-sm ${isInbound ? 'text-gray-700' : 'text-white'}`}>
                                  {message.description}
                                </div>
                                <div className={`flex items-center gap-2 mt-2 text-xs ${isInbound ? 'text-gray-500' : 'text-white/80'}`}>
                                  <span>{formatTime(message.created_at)}</span>
                                  {message.ai_generated && (
                                    <span className="px-2 py-0.5 rounded bg-white/20 text-xs">AI</span>
                                  )}
                                  {message.performed_by_name && !isInbound && (
                                    <span>by {message.performed_by_name}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
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

