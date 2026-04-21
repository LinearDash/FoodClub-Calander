"use client";

import React from "react";
import { Event } from "@foodclub/types";
import { getStatusColour } from "@foodclub/utils";

interface CalendarProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onNewEvent: (dateStr?: string) => void;
  events: Event[];
  loading: boolean;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}

export default function Calendar({
  currentDate,
  onNavigate,
  onNewEvent,
  events,
  loading,
  onEventClick,
}: CalendarProps) {
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Australian calendar: week starts on Monday
  const blanksCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthBlanks = Array.from(
    { length: blanksCount },
    (_, i) => prevMonthDaysCount - blanksCount + i + 1,
  );

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = 42; 
  const remainingCells = totalCells - (blanksCount + daysInMonth);
  const nextMonthBlanks = Array.from(
    { length: remainingCells },
    (_, i) => i + 1,
  );

  const getDayEvents = (dayStr: string) =>
    events.filter((e) => {
      if (!e.date || e.isTBA) return false;
      const start = e.date.split("T")[0];
      const end = e.endDate ? e.endDate.split("T")[0] : start;
      return dayStr >= start && dayStr <= end;
    });

  return (
    <section>
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-on-surface">
            {new Intl.DateTimeFormat("en-AU", {
              month: "long",
              year: "numeric",
            }).format(new Date(currentYear, currentMonth))}
          </h1>
          <input
            type="month"
            value={currentMonthStr}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split("-");
                onNavigate(new Date(Number(y), Number(m) - 1, 1));
              }
            }}
            className="hidden md:block px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-base font-semibold hover:border-outline-variant text-on-surface shadow-sm cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Select Date"
          />
          <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 border border-surface-container shadow-sm">
            <button
              onClick={() => onNavigate(new Date(currentYear, currentMonth - 1, 1))}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-on-surface-variant hover:text-on-surface font-semibold"
              aria-label="Previous month"
            >
              &larr;
            </button>
            <button
              onClick={() => onNavigate(new Date())}
              className="px-3 md:px-4 h-8 md:h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-xs md:text-sm font-semibold text-on-surface"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate(new Date(currentYear, currentMonth + 1, 1))}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-on-surface-variant hover:text-on-surface font-semibold"
              aria-label="Next month"
            >
              &rarr;
            </button>
          </div>
        </div>
        <button
          onClick={() => onNewEvent()}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md shadow-primary/20 w-full md:w-auto active:scale-95"
        >
          + New Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.06)] overflow-hidden border border-surface-container">
        <div className="grid grid-cols-7 border-b border-surface-container bg-surface-container-low">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-1 py-3 text-[10px] md:text-sm font-black uppercase tracking-widest text-on-surface-variant text-center"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(80px,auto)] md:auto-rows-[minmax(120px,auto)] bg-surface relative">
          {loading && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center font-medium text-on-surface-variant">
              Loading...
            </div>
          )}
          {prevMonthBlanks.map((day) => (
            <div
              key={`prev-${day}`}
              className="border-r border-b border-surface-container-low/50 p-1 md:p-2 flex flex-col min-h-[80px] md:min-h-[120px] select-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(220,38,38,0.02), rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.05) 10px, rgba(220,38,38,0.05) 20px)",
              }}
            >
              <span className="text-[10px] md:text-sm font-medium w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full mb-1 text-red-600/40 bg-red-500/5">
                {day}
              </span>
            </div>
          ))}
          {days.map((day) => {
            const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = getDayEvents(dayStr);
            return (
              <div
                key={day}
                onClick={() => onNewEvent(dayStr)}
                className="border-r border-b border-surface-container-low p-1 md:p-2 hover:bg-surface-container-low cursor-pointer transition flex flex-col group min-h-[80px] md:min-h-[120px]"
              >
                <span
                  className={`text-[10px] md:text-sm font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full mb-1
                  ${
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear()
                      ? "bg-primary text-white"
                      : "text-on-surface-variant group-hover:text-primary"
                  }`}
                >
                  {day}
                </span>
                <div className="space-y-0.5 md:space-y-1 overflow-y-auto flex-1 no-scrollbar">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => onEventClick(ev, e)}
                      className={`text-[8px] md:text-[10px] leading-tight px-1 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg shadow-sm border border-black/5 flex items-center gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98] ${getStatusColour(
                        ev.status,
                      )}`}
                    >
                      <span
                        className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0
                        ${
                          ev.priority === "high"
                            ? "bg-white border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                            : ev.priority === "medium"
                              ? "bg-white/80 border border-white/10"
                              : "bg-white/40 border border-white/5"
                        }`}
                      />
                      <span className="truncate flex-1 font-bold md:font-semibold">{ev.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {nextMonthBlanks.map((day) => (
            <div
              key={`next-${day}`}
              className="border-r border-b border-surface-container-low/50 p-1 md:p-2 flex flex-col min-h-[80px] md:min-h-[120px] select-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(220,38,38,0.02), rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.05) 10px, rgba(220,38,38,0.05) 20px)",
              }}
            >
              <span className="text-[10px] md:text-sm font-medium w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full mb-1 text-red-600/40 bg-red-500/5">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
