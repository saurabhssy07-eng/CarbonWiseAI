import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Maximize2, RotateCcw } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { sendCoachMessage, startCoachChat } from '../services/gemini';

const QUICK_PROMPTS = [
  "What's my biggest carbon source?",
  "How can I reduce transport emissions?",
  "Give me a vegan meal plan",
  "How do I hit the Paris climate target?",
  "Tips for green energy at home",
];

export default function Coach() {
  const { profile, chatMessages, addMessage, setChatLoading, chatLoading, clearChat, getRecentAvgCO2, todayLog } = useAppStore();
  const [input,       setInput]       = useState('');
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!initialized && chatMessages.length === 0) {
      setInitialized(true);
      init();
    } else {
      setInitialized(true);
    }
    scrollToBottom();
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function init() {
    setChatLoading(true);
    try {
      const greeting = await startCoachChat(profile, getRecentAvgCO2(), todayLog);
      addMessage({ role: 'ai', content: greeting, ts: Date.now() });
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSend(msg) {
    const text = (msg ?? input).trim();
    if (!text || chatLoading) return;
    setInput('');
    addMessage({ role: 'user', content: text, ts: Date.now() });
    setChatLoading(true);
    try {
      const reply = await sendCoachMessage(text, todayLog);
      addMessage({ role: 'ai', content: reply, ts: Date.now() });
    } finally {
      setChatLoading(false);
    }
  }

  function handleReset() {
    clearChat();
    setInitialized(false);
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)] pt-16 md:pt-0">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 border-b border-white/5 flex items-center justify-between shrink-0"
           style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Carbon Coach</h1>
            <p className="text-xs text-green-400">Powered by Gemini 1.5 Flash • {chatMessages.length > 0 ? 'Online' : 'Ready'}</p>
          </div>
        </div>
        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Reset conversation">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Profile context banner */}
      {profile?.baselineProfile && (
        <div className="px-4 md:px-8 py-2 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto scrollbar-hide">
            <span>Context:</span>
            <span className="badge-pill bg-green-500/10 text-green-400">🚗 {profile.baselineProfile.transportMode}</span>
            <span className="badge-pill bg-teal-500/10 text-teal-400">🍽️ {profile.baselineProfile.dietType}</span>
            <span className="badge-pill bg-amber-500/10 text-amber-400">⚡ {profile.baselineProfile.energySource}</span>
            <span className="badge-pill bg-carbon-700 text-gray-400">~{getRecentAvgCO2().toFixed(1)} kg/day avg</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {chatMessages.length === 0 && !chatLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
            <div className="text-5xl mb-4 animate-bounce-gentle">🌿</div>
            <h3 className="text-lg font-semibold text-white mb-2">Your Carbon Coach is ready</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-8">Ask me anything about reducing your carbon footprint, sustainable habits, or your personal data.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((p) => (
                <button key={p} onClick={() => handleSend(p)}
                        className="text-xs px-3 py-2 rounded-full border border-white/10 bg-carbon-800/60 text-gray-300 hover:border-green-500/40 hover:text-green-300 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai">
              <div className="flex gap-1 py-0.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms'   }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts (when has messages) */}
      {chatMessages.length > 0 && (
        <div className="px-4 md:px-8 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {QUICK_PROMPTS.slice(0, 3).map((p) => (
            <button key={p} onClick={() => handleSend(p)} disabled={chatLoading}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-carbon-800/60 text-gray-400 hover:border-green-500/40 hover:text-green-300 transition-all whitespace-nowrap disabled:opacity-40 shrink-0">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 md:px-8 py-4 border-t border-white/5 shrink-0 pb-safe">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask your carbon coach anything..."
            className="input-field flex-1"
            disabled={chatLoading}
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || chatLoading}
                  className="btn-primary px-4 py-3 disabled:opacity-40 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
