"use client";

import React, { useState } from "react";
import AISearchCalendar from "@/components/dashboard/AISearchCalendar";
import SearchFilters from "./components/SearchFilters";
import ChatInterface from "./components/ChatInterface";

export default function AISearchPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [searchParams, setSearchParams] = useState({
    radius: 10,
    type: "festival",
    location: "Perth, WA"
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] mt-4">
      {/* Left Sidebar: Controls */}
      <aside className="w-full lg:w-80 space-y-6 flex-shrink-0 overflow-y-auto pr-2 pb-6 no-scrollbar">
        <div className="space-y-1 mb-6">
          <h1 className="font-display text-3xl font-bold text-on-surface">AI Search</h1>
          <p className="text-sm text-on-surface-variant/60 font-medium italic">Powered by Gemini AI (Phase 1: UI)</p>
        </div>

        <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">1. Pick Dates</h2>
          <AISearchCalendar 
            selectedDates={selectedDates} 
            onChange={setSelectedDates} 
          />
        </section>

        <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">2. Search Parameters</h2>
          <SearchFilters 
            values={searchParams}
            onChange={setSearchParams}
          />
        </section>
      </aside>

      {/* Main Content: Chatbot */}
      <main className="flex-1 bg-surface-container-lowest rounded-[2.5rem] border border-surface-container shadow-sm overflow-hidden flex flex-col relative">
        <ChatInterface 
          selectedDates={selectedDates}
          searchParams={searchParams}
        />
      </main>
    </div>
  );
}
