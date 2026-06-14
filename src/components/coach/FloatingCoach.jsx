import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCcw } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { sendCoachMessage, startCoachChat } from '../../services/gemini';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function FloatingCoach() {
  const { floatingCoachOpen, setFloatingCoachOpen, user, profile, getRecentAvgCO2, chatMessages, addMessage, setChatLoading, chatLoading, todayLog, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  async function initialize() {
    if (initialized) return;
    setInitialized(true);
    setChatLoading(true);
    try {
      const greeting = await startCoachChat(profile, getRecentAvgCO2(), todayLog);
      addMessage({ role: 'ai', content: greeting, ts: Date.now() });
    } finally {
      setChatLoading(false);
    }
  }

  function handleOpen() {
    setFloatingCoachOpen(true);
    initialize();
  }

  function handleReset() {
    clearChat();
    setInitialized(false);
    // Let the next render cycle trigger initialize if needed, or explicitly call it here.
    // Actually, since `initialize` checks `initialized`, we just call it directly:
    setTimeout(() => {
      initialize();
    }, 50);
  }

  async function handleSend() {
    const msg = input.trim();
    if (!msg || chatLoading) return;
    setInput('');
    addMessage({ role: 'user', content: msg, ts: Date.now() });
    setChatLoading(true);
    try {
      const reply = await sendCoachMessage(msg, todayLog);
      addMessage({ role: 'ai', content: reply, ts: Date.now() });
    } finally {
      setChatLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (!floatingCoachOpen) {
    return (
      <button id="floating-coach-btn" className="floating-coach-btn" onClick={handleOpen} aria-label="Open AI Coach">
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] flex flex-col animate-slide-up"
         style={{ height: '480px', maxHeight: 'calc(100vh - 48px)' }}>
      <div className="glass-card flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Carbon Coach</p>
              <p className="text-xs text-green-400">AI-powered • Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleReset} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5" title="Reset chat">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setFloatingCoachOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your carbon coach..."
              className="input-field flex-1 py-2 text-sm"
              disabled={chatLoading}
            />
            <button onClick={handleSend} disabled={!input.trim() || chatLoading}
                    className="btn-primary px-3 py-2 rounded-xl disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
