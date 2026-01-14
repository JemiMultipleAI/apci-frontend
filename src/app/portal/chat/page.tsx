'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/ai/chat', {
        message: userMessage.content,
        conversationId: conversationId,
      });

      if (response.data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (!conversationId && response.data.data.conversationId) {
          setConversationId(response.data.data.conversationId);
        }
      } else {
        setError(response.data.error || 'Failed to get response');
        // Remove user message if request failed
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
      // Remove user message if request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      await apiClient.delete(`/ai/chat/${conversationId}`);
      setMessages([]);
      setConversationId(null);
      setError(null);
    } catch (err) {
      console.error('Failed to clear conversation:', err);
      // Still clear locally even if API call fails
      setMessages([]);
      setConversationId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            AI Chat
          </h1>
          <p className="text-gray-600">
            Test and interact with the AI agent
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] p-4 mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 max-w-md">
                Ask questions, test responses, and interact with the AI agent. This is a testing interface to check how the AI responds.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 text-gray-900 border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
