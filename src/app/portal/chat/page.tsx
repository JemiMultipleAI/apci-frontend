'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Loader2, AlertCircle, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { getAccessToken } from '@/lib/cookies';

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

  // Voice mode state
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);

  // Voice call simulation configuration
  const [voiceCallConfig, setVoiceCallConfig] = useState({
    campaignId: '', // Select campaign instead of manual fields
    contactId: '', // Still allow contact selection for testing
    enabled: false,
  });

  // Campaigns and contacts for dropdowns
  const [campaigns, setCampaigns] = useState<Array<{
    id: string;
    name: string;
    channel: string;
  }>>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    id: string;
    instructions: string | null;
    custom_introduction: string | null;
    use_custom_introduction: boolean;
    accountId: string | null;
  } | null>(null);
  const [contacts, setContacts] = useState<Array<{ id: string; first_name: string; last_name: string; mobile: string | null }>>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Fetch campaigns when enabled
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!voiceCallConfig.enabled) {
        setCampaigns([]);
        return;
      }
      
      setLoadingConfig(true);
      try {
        const response = await apiClient.get('/campaigns', {
          params: { page: 1, limit: 100 },
        });
        // Filter to show call/multi campaigns only
        const callCampaigns = (response.data.data || []).filter(
          (c: any) => c.channel === 'call' || c.channel === 'multi'
        );
        setCampaigns(callCampaigns);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchCampaigns();
  }, [voiceCallConfig.enabled]);

  // Fetch contacts when enabled
  useEffect(() => {
    const fetchContacts = async () => {
      if (!voiceCallConfig.enabled) return;

      try {
        const contactsRes = await apiClient.get('/contacts', {
          params: { page: 1, limit: 100 },
        });
        setContacts(contactsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };

    fetchContacts();
  }, [voiceCallConfig.enabled]);

  // Fetch campaign details when selected
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!voiceCallConfig.campaignId) {
        setSelectedCampaign(null);
        return;
      }

      try {
        const response = await apiClient.get(`/campaigns/${voiceCallConfig.campaignId}`);
        const campaign = response.data.data;
        
        setSelectedCampaign({
          id: campaign.id,
          instructions: campaign.instructions || null,
          custom_introduction: campaign.custom_introduction || null,
          use_custom_introduction: campaign.use_custom_introduction || false,
          accountId: campaign.account_id || null,
        });
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
        setSelectedCampaign(null);
      }
    };

    fetchCampaignDetails();
  }, [voiceCallConfig.campaignId]);

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
        // Pass campaign config if enabled (for text chat too)
        accountId: selectedCampaign?.accountId || undefined,
        contactId: voiceCallConfig.contactId || undefined,
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

  // Voice mode functions
  const startVoiceSession = async () => {
    try {
      // Use getAccessToken from cookies instead of localStorage
      const token = getAccessToken();
      if (!token) {
        setError('Please log in to use voice mode');
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        const sessionId = `web-voice-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        sessionIdRef.current = sessionId;

        ws.send(JSON.stringify({
          type: 'voice_chat_start',
          sessionId,
          agentId: 'chatbot-test-agent',
          accountId: selectedCampaign?.accountId || undefined,
          contactId: voiceCallConfig.contactId || undefined,
          instructions: selectedCampaign?.instructions || undefined,
          customIntroduction: selectedCampaign?.use_custom_introduction && selectedCampaign.custom_introduction
            ? selectedCampaign.custom_introduction
            : undefined,
        }));

        wsRef.current = ws;

        // Start microphone
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        })
          .then(stream => {
            mediaStreamRef.current = stream;

            // Create AudioContext with 16kHz sample rate
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const context = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              if (!ws || ws.readyState !== WebSocket.OPEN || !sessionIdRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              
              // Convert Float32Array to Int16Array (PCM 16-bit)
              const int16Array = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                // Clamp and convert to 16-bit integer
                const sample = Math.max(-1, Math.min(1, inputData[i]));
                int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
              }

              // Convert ArrayBuffer to base64 (browser native method)
              const uint8Array = new Uint8Array(int16Array.buffer);
              let binary = '';
              for (let i = 0; i < uint8Array.length; i++) {
                binary += String.fromCharCode(uint8Array[i]);
              }
              const base64 = btoa(binary);
              
              ws.send(JSON.stringify({
                type: 'audio_data',
                sessionId: sessionIdRef.current,
                audio: base64,
                sampleRate: 16000,
              }));
            };

            source.connect(processor);
            processor.connect(context.destination);
            processorRef.current = processor;
            setIsRecording(true);
            setVoiceMode(true);
          })
          .catch(err => {
            console.error('Failed to access microphone:', err);
            setError('Failed to access microphone. Please check permissions.');
            ws.close();
          });

        // Handle incoming messages
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'session_started') {
              console.log('Voice session started:', message.sessionId);
            } else if (message.type === 'audio_chunk') {
              // Play audio chunk
              playAudioChunk(message.audio, message.sampleRate || 16000);
              setIsAISpeaking(true);
            } else if (message.type === 'audio_end') {
              setIsAISpeaking(false);
            } else if (message.type === 'error') {
              setError(message.message || 'Voice session error');
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          stopVoiceSession();
        };
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setError('Failed to connect to voice server');
      };
    } catch (error) {
      console.error('Failed to start voice session:', error);
      setError('Failed to start voice session');
    }
  };

  const playAudioChunk = async (audioBase64: string, sampleRate: number) => {
    if (!audioContextRef.current) {
      // Create audio context if not exists (for playback)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate });
    }

    const context = audioContextRef.current;

    try {
      // Validate base64 string
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        console.warn('[WEB_VOICE] Invalid audio data received', { audioBase64: typeof audioBase64 });
        return;
      }

      // Remove any whitespace/newlines that might have been added
      const cleanBase64 = audioBase64.trim().replace(/\s/g, '');

      if (!cleanBase64) {
        console.warn('[WEB_VOICE] Empty audio data after cleaning');
        return;
      }

      // Decode base64 to ArrayBuffer (browser native method)
      const binary = atob(cleanBase64);
      const uint8Array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(uint8Array.buffer);

      // Convert Int16Array to Float32Array
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
      }

      // Create AudioBuffer
      const audioBufferNode = context.createBuffer(1, float32Array.length, sampleRate);
      audioBufferNode.getChannelData(0).set(float32Array);

      // Play audio
      const source = context.createBufferSource();
      source.buffer = audioBufferNode;
      source.connect(context.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio chunk:', error, {
        audioBase64Length: audioBase64?.length,
        audioBase64Preview: audioBase64?.substring(0, 50),
        sampleRate,
      });
    }
  };

  const stopVoiceSession = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      if (sessionIdRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'voice_chat_end',
          sessionId: sessionIdRef.current,
        }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsRecording(false);
    setVoiceMode(false);
    setIsAISpeaking(false);
    sessionIdRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            AI Chat
          </h1>
          <p className="text-muted-foreground">
            Test and interact with the AI agent
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!voiceMode ? (
            <button
              onClick={startVoiceSession}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Start Voice
            </button>
          ) : (
            <button
              onClick={stopVoiceSession}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="h-4 w-4" />
              End Voice
            </button>
          )}
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
      </div>

      {/* Voice Call Simulation Configuration Panel */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Voice Call Simulation</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure settings to simulate a real voice call with CRM context
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={voiceCallConfig.enabled}
              onChange={(e) => setVoiceCallConfig({ ...voiceCallConfig, enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={voiceMode}
            />
            <span className="text-sm font-medium text-gray-700">Enable</span>
          </label>
        </div>

        {voiceCallConfig.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Campaign <span className="text-gray-400">(simulates real voice call)</span>
              </label>
              {loadingConfig ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading campaigns...
                </div>
              ) : (
                <select
                  value={voiceCallConfig.campaignId}
                  onChange={(e) => setVoiceCallConfig({ ...voiceCallConfig, campaignId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={voiceMode}
                >
                  <option value="">None (generic call without campaign context)</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {selectedCampaign && (
                <div className="mt-2 space-y-1 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                  {selectedCampaign.instructions && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">📋 Instructions:</span>
                      <span className="text-gray-700">{selectedCampaign.instructions.substring(0, 150)}{selectedCampaign.instructions.length > 150 ? '...' : ''}</span>
                    </div>
                  )}
                  {selectedCampaign.use_custom_introduction && selectedCampaign.custom_introduction && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">👋 Custom Intro:</span>
                      <span className="text-gray-700">{selectedCampaign.custom_introduction.substring(0, 150)}{selectedCampaign.custom_introduction.length > 150 ? '...' : ''}</span>
                    </div>
                  )}
                  {selectedCampaign.accountId && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">🏢 Account:</span>
                      <span className="text-gray-700">CRM context enabled</span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select a campaign to automatically load its instructions, custom introduction, and account context
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contact <span className="text-gray-400">(for testing)</span>
              </label>
              {loadingConfig ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading contacts...
                </div>
              ) : (
                <select
                  value={voiceCallConfig.contactId}
                  onChange={(e) => setVoiceCallConfig({ ...voiceCallConfig, contactId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={voiceMode}
                >
                  <option value="">None (no contact context)</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} {contact.mobile ? `(${contact.mobile})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select a contact to test with (campaigns target groups, but you can test with a specific contact)
              </p>
            </div>
          </div>
        )}

        {voiceCallConfig.enabled && (voiceCallConfig.campaignId || voiceCallConfig.contactId) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
              <div className="flex-shrink-0 mt-0.5">💡</div>
              <div>
                <strong>Simulation Active:</strong> When you start voice, the AI will have{' '}
                {selectedCampaign?.accountId && 'account context '}
                {voiceCallConfig.contactId && 'contact context '}
                {selectedCampaign?.instructions && 'campaign instructions '}
                {selectedCampaign?.use_custom_introduction && selectedCampaign.custom_introduction && 'custom introduction '}
                enabled. This simulates a real voice call scenario.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-gradient-tech p-4 mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground max-w-md">
                Ask questions, test responses, and interact with the AI agent. This is a testing interface to check how the AI responds.
              </p>
              {!voiceMode && (
                <p className="text-sm text-blue-600 mt-2">
                  💡 Click "Start Voice" to test voice conversations without Twilio credits
                </p>
              )}
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-tech flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-tech text-white'
                      : 'bg-surface-elevated text-foreground border border-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-tech flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-surface-elevated text-foreground border border-border rounded-2xl px-4 py-3">
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
            <div className="rounded-lg bg-error/10 border border-error/30 p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {voiceMode ? (
            <div className="flex items-center justify-center gap-4 py-2">
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">
                      {isAISpeaking ? 'AI is speaking...' : 'Listening...'}
                    </span>
                  </div>
                  {isAISpeaking && (
                    <Mic className="h-5 w-5 text-blue-600 animate-pulse" />
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Connecting to voice session...</div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}


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


