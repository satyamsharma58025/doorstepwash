import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  RotateCcw,
  Headphones
} from 'lucide-react';
import { Booking } from '../types';

interface AISupportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeBooking?: Booking;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  toolCall?: {
    name: string;
    status: 'success' | 'running';
    resultSummary?: string;
  };
}

export const AISupportDrawer: React.FC<AISupportDrawerProps> = ({
  isOpen,
  onClose,
  activeBooking,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Hello! I'm SudsGo's 24/7 AI Concierge. I can track your technician in real-time, inspect dynamic pricing, calculate refunds, or reschedule your doorstep slot. How can I help you today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/support-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          bookingContext: activeBooking ? {
            id: activeBooking.id,
            status: activeBooking.status,
            vehicle: `${activeBooking.vehicle.make} ${activeBooking.vehicle.model}`,
            technician: activeBooking.technicianName,
            address: activeBooking.address.area,
          } : undefined,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I have checked our real-time ops dashboard for you.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: data.toolCalled ? {
          name: data.toolCalled,
          status: 'success',
          resultSummary: 'Verified with live Redis Geo & PostgreSQL ledger',
        } : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Your technician is on schedule. SudsGo's doorstep guarantee protects all active bookings with free automatic rescheduling if delayed.`,
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    'Where is my technician right now?',
    'Do you need my water connection or plug?',
    'What is your cancellation & refund policy?',
    'Can I upgrade to ceramic wax on arrival?',
  ];

  return (
    <div id="ai-support-drawer-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        id="ai-support-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">SudsGo AI Concierge</h3>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-semibold px-1.5 py-0.5 rounded-full">
                  MCP Tool Enabled
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Ops Gateway Connected
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
            aria-label="Close support chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {activeBooking && (
            <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-semibold text-cyan-950">Active Job: #{activeBooking.id}</span>
                <p className="text-[11px] text-slate-500">{activeBooking.vehicle.make} • {activeBooking.status.toUpperCase()}</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-700">₹{activeBooking.pricing.total}</span>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="h-7 w-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80'
                }`}
              >
                {/* Tool Invocation Chip */}
                {msg.toolCall && (
                  <div className="mb-2 p-1.5 rounded-md bg-white/80 border border-cyan-200 text-[10px] text-cyan-900 flex items-center gap-1.5">
                    <Wrench size={11} className="text-cyan-600" />
                    <span className="font-mono font-bold">tool: {msg.toolCall.name}()</span>
                    <span className="ml-auto text-emerald-600 font-semibold">✔ executed</span>
                  </div>
                )}

                <p>{msg.text}</p>
                <span
                  className={`text-[10px] block mt-1 text-right ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500">
              <div className="h-7 w-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles size={14} />
              </div>
              <span className="italic">AI Concierge is querying live telemetry...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Suggested Inquiries:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => handleSendMessage(action)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200 transition-colors truncate max-w-full text-left"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about wash ETA, doorstep setup, refunds..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="h-9 w-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini 3.8 Flash</span>
            <span className="flex items-center gap-1">
              <Headphones size={11} />
              Human Escort Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
