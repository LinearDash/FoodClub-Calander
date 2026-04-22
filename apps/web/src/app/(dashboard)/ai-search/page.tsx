"use client";

import { useState } from "react";
import AISearchCalendar from "@/components/dashboard/AISearchCalendar";
import SearchFilters from "@/components/ai-chat/SearchFilters";
import ChatInterface from "@/components/ai-chat/ChatInterface";
import { X } from "lucide-react";

export default function AISearchPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [searchParams, setSearchParams] = useState({
    radius: 10,
    type: "festival",
    location: "Perth, WA",
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] mt-4 relative overflow-hidden">
      {/* Mobile Overlay for Controls */}
      {showMobileControls && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setShowMobileControls(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-surface-container-lowest shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Search Settings
              </h2>
              <button
                onClick={() => setShowMobileControls(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">
                  1. Pick Dates
                </h2>
                <AISearchCalendar
                  selectedDates={selectedDates}
                  onChange={setSelectedDates}
                />
              </section>

              <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">
                  2. Search Parameters
                </h2>
                <SearchFilters
                  values={searchParams}
                  onChange={setSearchParams}
                />
              </section>

              <button
                onClick={() => setShowMobileControls(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Apply & Return to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar: Controls */}
      <aside className="hidden lg:flex flex-col w-80 space-y-6 shrink-0 overflow-y-auto pr-2 pb-6 no-scrollbar">
        <div className="space-y-1 mb-6">
          <h1 className="font-display text-3xl font-bold text-on-surface">
            AI Search
          </h1>
          <p className="text-sm text-on-surface-variant/60 font-medium italic">
            Powered by Gemini AI
          </p>
        </div>

        <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">
            1. Pick Dates
          </h2>
          <AISearchCalendar
            selectedDates={selectedDates}
            onChange={setSelectedDates}
          />
        </section>

        <section className="bg-surface-container-low p-5 rounded-3xl border border-surface-container shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 px-1">
            2. Search Parameters
          </h2>
          <SearchFilters values={searchParams} onChange={setSearchParams} />
        </section>
      </aside>

      {/* Main Content: Chatbot */}
      <main className="flex-1 bg-surface-container-lowest rounded-[2rem] sm:rounded-[2.5rem] border border-surface-container shadow-sm overflow-hidden flex flex-col relative h-full">
        <ChatInterface
          selectedDates={selectedDates}
          searchParams={searchParams}
          onToggleMobileControls={() => setShowMobileControls(true)}
        />
      </main>
    </div>
  );
}
