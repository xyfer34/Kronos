import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, CornerDownLeft, Sparkles, MessageSquare } from 'lucide-react';

interface AdvisorChatProps {
  symbol: string;
  assetName: string;
}

export default function AdvisorChat({ symbol, assetName }: AdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{
        text: `### Active Session: **${symbol} Quantitative Advisor**
Welcome. I have initialized the active terminal dataset for **${assetName}**. 

I am prepared to perform multi-stage calculations or analyze real-time news and macro correlations. Ask me specific questions like:
* *"What is ${symbol}'s intrinsic value?"*
* *"Why is the stock experiencing selling pressure today?"*
* *"Detail the core downside risk factors."*`
      }]
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Handle message sending
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || sending) return;

    if (!customText) setInput('');

    // Append user message
    const userMsg: ChatMessage = {
      role: 'user',
      parts: [{ text: textToSend }]
    };
    
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.parts[0].text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reply');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: data.reply }]
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: `⚠️ **Terminal Sync Error**: Failed to deliver response from the AI Analyst. Please check your network connection or GEMINI_API_KEY settings.` }]
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleShortcut = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-5 flex flex-col h-[500px] shadow-[0_4px_25px_rgba(0,0,0,0.5)]" id="ai-advisor-chat">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="text-indigo-400 w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            INTEGRATED AI FINANCIAL ASSISTANT & CHATBOT
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Active Context: {symbol}</span>
        </div>
      </div>

      {/* Messages Logs */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3.5 pr-1 text-xs">
        {messages.map((msg, idx) => {
          const isBot = msg.role === 'model';
          return (
            <div key={idx} className={`flex items-start gap-3 ${isBot ? 'bg-white/2 border border-white/5 rounded-lg p-3' : 'justify-end'}`}>
              {isBot && (
                <div className="bg-indigo-600/10 text-indigo-400 p-1.5 rounded border border-indigo-500/20 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div className={`max-w-[85%] space-y-1 ${!isBot ? 'bg-indigo-600 text-white px-3.5 py-2.5 rounded-lg rounded-tr-none shadow-[0_4px_12px_rgba(79,70,229,0.2)]' : 'text-slate-300'}`}>
                {isBot ? (
                  <div className="prose prose-invert prose-xs leading-relaxed max-w-none">
                    {/* Render basic markdown text beautifully */}
                    {msg.parts[0].text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={lIdx} className="text-xs font-black text-slate-100 mt-2 mb-1 uppercase tracking-wide">{line.replace('###', '').trim()}</h4>;
                      }
                      if (line.startsWith('*') || line.startsWith('-')) {
                        return (
                          <div key={lIdx} className="flex items-start space-x-1.5 ml-2">
                            <span>•</span>
                            <span>{line.substring(1).trim()}</span>
                          </div>
                        );
                      }
                      // bold replacements
                      const boldParts = line.split('**');
                      if (boldParts.length > 2) {
                        return (
                          <p key={lIdx} className="mb-1 leading-relaxed">
                            {boldParts.map((bp, bpIdx) => bpIdx % 2 === 1 ? <strong key={bpIdx} className="text-indigo-400 font-bold">{bp}</strong> : bp)}
                          </p>
                        );
                      }
                      return <p key={lIdx} className="mb-1 leading-relaxed">{line}</p>;
                    })}
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.parts[0].text}</p>
                )}
              </div>

              {!isBot && (
                <div className="bg-indigo-500 text-white p-1.5 rounded-full mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
        {sending && (
          <div className="flex items-center space-x-2.5 bg-white/2 border border-white/5 rounded-lg p-3 text-slate-400">
            <Bot className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            <span className="italic">AI Analyst compiling data context and thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested shortcuts */}
      <div className="flex flex-wrap gap-2 mb-3.5 text-[10px]">
        <button
          onClick={() => handleShortcut(`Why did ${symbol} drop today?`)}
          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded cursor-pointer transition-colors"
        >
          Why fall today?
        </button>
        <button
          onClick={() => handleShortcut(`What is the intrinsic value of ${symbol}?`)}
          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded cursor-pointer transition-colors"
        >
          Intrinsic value?
        </button>
        <button
          onClick={() => handleShortcut(`Should I hold this stock?`)}
          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded cursor-pointer transition-colors"
        >
          Should I hold?
        </button>
        <button
          onClick={() => handleShortcut(`What are the risks of ${symbol}?`)}
          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded cursor-pointer transition-colors"
        >
          Detail risks?
        </button>
      </div>

      {/* Input controls */}
      <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg p-1 focus-within:border-indigo-500/50 transition-all">
        <input
          type="text"
          placeholder="Ask AI analyst about metrics, technical overrides, or macro alignments..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-500 font-sans"
          id="advisor-chat-input"
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-md transition-colors cursor-pointer flex items-center justify-center shadow-lg"
          id="send-chat-btn"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
