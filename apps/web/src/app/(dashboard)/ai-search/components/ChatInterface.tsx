"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Plus, Calendar, AlertCircle, Search } from "lucide-react";
import { addEvent } from "@/app/(dashboard)/events/actions";
import { searchEventsWithAI } from "../actions";

interface Message {
  role: "user" | "ai";
  content: string;
  events?: any[];
  error?: boolean;
}

interface ChatInterfaceProps {
  selectedDates: Date[];
  searchParams: {
    radius: number;
    type: string;
    location: string;
  };
}

export default function ChatInterface({ selectedDates, searchParams }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Ready for duty. I'm your Event Detective. Tell me what you're looking for, and I'll scour Perth for new vendor opportunities you haven't found yet!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    setIsTyping(true);

    try {
      const res = await searchEventsWithAI(userMessage, selectedDates, searchParams);
      
      if (res.error) {
        setMessages(prev => [...prev, { 
          role: "ai", 
          content: `Case hit a wall: ${res.error}`,
          error: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "ai", 
          content: res.data.length > 0 
            ? `I've finished my investigation. Found ${res.data.length} potential leads in Perth that aren't on your record yet:`
            : "I've searched every corner, but I couldn't find any new leads matching those criteria. Try expanding your search area or looking for a different event type.",
          events: res.data 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Detective work got interrupted by a technical glitch. Let's try that again.",
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddEvent = async (event: any) => {
    try {
      const res = await addEvent({
        name: event.name,
        date: event.date,
        location: event.location,
        status: "not_applied",
        priority: "medium",
        isTBA: false,
        notes: `Detected by AI Search. ${event.description || ''}`
      });
      if (res?.error) {
        alert("Failed to add event: " + res.error);
      } else {
        alert("Case closed! Event added to your calendar.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/20">
            <Search size={20} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-sm font-black text-on-surface uppercase tracking-widest">Event Detective</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">Perth Division • Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth no-scrollbar"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm ${
                m.role === "user" 
                ? "bg-surface text-on-surface-variant border-outline-variant/20" 
                : m.error ? "bg-red-500 text-white border-red-600" : "bg-primary text-white border-primary/20"
              }`}>
                {m.role === "user" ? <User size={14} /> : m.error ? <AlertCircle size={14} /> : <Search size={14} strokeWidth={3} />}
              </div>
              <div className="space-y-4">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                  ? "bg-primary-fixed text-primary-container font-medium rounded-tr-none"
                  : m.error 
                    ? "bg-red-50 text-red-900 rounded-tl-none border border-red-200"
                    : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/10 shadow-sm font-medium"
                }`}>
                  {m.content}
                </div>

                {/* Event Cards if available */}
                {m.events && m.events.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {m.events.map((ev, eIdx) => (
                      <div key={eIdx} className="bg-surface p-4 rounded-3xl border border-outline-variant/20 shadow-sm group hover:border-primary/40 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                            ev.type === "festival" ? "bg-orange-100 text-orange-700" :
                            ev.type === "competition" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant/40 flex items-center gap-1">
                            <Calendar size={10} /> {ev.dateLabel}
                          </span>
                        </div>
                        <h4 className="font-bold text-on-surface text-sm mb-1 leading-tight">{ev.name}</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-4 italic truncate opacity-60">{ev.location}</p>
                        <button 
                          onClick={() => handleAddEvent(ev)}
                          className="w-full py-2 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={12} strokeWidth={3} /> Add to Calendar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center animate-pulse">
                <Search size={14} strokeWidth={3} />
              </div>
              <div className="bg-surface-container px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 border border-outline-variant/10 shadow-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-outline-variant/15 bg-surface-container-low/30">
        <div className="max-w-4xl mx-auto relative group">
          <input 
            type="text" 
            placeholder={isTyping ? "The Detective is searching..." : "What are you looking for in Perth?"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full bg-surface border-2 border-outline-variant/15 text-on-surface rounded-[1.5rem] pl-6 pr-14 py-4 focus:outline-none focus:border-primary/50 transition-all shadow-sm placeholder:text-on-surface-variant/40"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-4 text-on-surface-variant/40 font-bold uppercase tracking-widest">
          Tip: Pick dates on the left first for a better search.
        </p>
      </div>
    </div>
  );
}
