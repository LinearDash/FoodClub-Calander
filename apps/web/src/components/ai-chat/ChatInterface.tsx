/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  User,
  Plus,
  Calendar,
  AlertCircle,
  Search,
  Settings2,
} from "lucide-react";
import { addEvent } from "@/app/(dashboard)/events/actions";
import { searchEventsWithAI } from "@/app/(dashboard)/ai-search/actions";

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
  onToggleMobileControls?: () => void;
}

export default function ChatInterface({
  selectedDates,
  searchParams,
  onToggleMobileControls,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello. I am your AI Event Assistant. I can help you discover upcoming festivals and markets in the Perth area based on your selected criteria. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    setIsTyping(true);

    try {
      const res = await searchEventsWithAI(
        userMessage,
        selectedDates,
        searchParams,
      );

      if (res.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: res.error,
            error: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              res.message ||
              (res.data && res.data.length > 0
                ? "I have identified the following events matching your search criteria:"
                : "I could not find any events matching those criteria at this time."),
            events: res.data,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "An error occurred while processing your request. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        notes: `Identified by AI Event Assistant. ${event.description || ""}`,
      });
      if (res?.error) {
        alert("Failed to add event: " + res.error);
      } else {
        alert("Event successfully added to your calendar.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full tracking-tight">
      <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/20 shrink-0">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-on-surface uppercase tracking-widest truncate">
              AI Event Assistant
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-tighter truncate">
                Service Active • Perth
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={onToggleMobileControls}
          className="lg:hidden p-2.5 bg-surface rounded-xl border border-outline-variant/20 shadow-sm text-on-surface-variant hover:text-primary active:scale-95 transition-all flex items-center gap-2"
        >
          <Settings2 size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
            Settings
          </span>
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth no-scrollbar"
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm ${
                  m.role === "user"
                    ? "bg-surface text-on-surface-variant border-outline-variant/20"
                    : m.error
                      ? "bg-red-500 text-white border-red-600"
                      : "bg-primary text-white border-primary/20"
                }`}
              >
                {m.role === "user" ? (
                  <User size={14} />
                ) : m.error ? (
                  <AlertCircle size={14} />
                ) : (
                  <Sparkles size={14} strokeWidth={2} />
                )}
              </div>
              <div className="space-y-4">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary-fixed text-primary-container font-medium rounded-tr-none shadow-sm"
                      : m.error
                        ? "bg-red-50 text-red-900 rounded-tl-none border border-red-200"
                        : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/10 shadow-sm font-medium"
                  }`}
                >
                  {m.content}
                </div>

                {/* Event Cards if available */}
                {m.events && m.events.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {m.events.map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        className="bg-surface p-4 rounded-3xl border border-outline-variant/20 shadow-sm group hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                              ev.type === "festival"
                                ? "bg-primary/10 text-primary"
                                : ev.type === "competition"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant/40 flex items-center gap-1">
                            <Calendar size={10} /> {ev.dateLabel}
                          </span>
                        </div>
                        <h4 className="font-bold text-on-surface text-sm mb-1 leading-tight">
                          {ev.name}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-2 truncate opacity-60">
                          {ev.location}
                        </p>

                        {ev.sourceUrl && (
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[9px] text-primary font-bold hover:underline mb-4 truncate"
                          >
                            🔗 View Event Details
                          </a>
                        )}

                        <button
                          onClick={() => handleAddEvent(ev)}
                          className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-sm"
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
                <Sparkles size={14} strokeWidth={2.5} />
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
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={
              isTyping
                ? "Searching database..."
                : "Describe the events you are looking for..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="w-full bg-surface border-2 border-outline-variant/40 text-on-surface rounded-[1.5rem] pl-6 pr-14 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-md placeholder:text-on-surface-variant/40 resize-none max-h-48 overflow-y-auto mt-1 no-scrollbar"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-3 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[10px] text-center mt-4 text-on-surface-variant/40 font-bold uppercase tracking-widest">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
