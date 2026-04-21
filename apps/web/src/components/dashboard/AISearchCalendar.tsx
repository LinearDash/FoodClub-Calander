"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface AISearchCalendarProps {
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
}

export default function AISearchCalendar({
  selectedDates,
  onChange,
}: AISearchCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // week starts Monday
  const blanksCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);

  const isSelected = (day: number) => {
    return selectedDates.some(
      (d) =>
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear,
    );
  };

  const toggleDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (isSelected(day)) {
      onChange(
        selectedDates.filter(
          (d) =>
            !(
              d.getDate() === day &&
              d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear
            ),
        ),
      );
    } else {
      onChange([...selectedDates, date]);
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            className="flex items-center gap-1 group"
          >
            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors uppercase tracking-tight">
              {new Intl.DateTimeFormat("en-AU", { month: "long" }).format(
                viewDate,
              )}
            </span>
            <ChevronDown
              size={14}
              className={`text-on-surface/40 group-hover:text-primary transition-transform duration-300 ${isMonthPickerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isMonthPickerOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsMonthPickerOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-outline-variant/20 rounded-2xl shadow-xl shadow-on-surface/10 py-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 overflow-hidden">
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setViewDate(new Date(currentYear, i, 1));
                        setIsMonthPickerOpen(false);
                      }}
                      className={`px-4 py-2 text-left text-xs font-bold transition-colors ${
                        currentMonth === i
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      {new Intl.DateTimeFormat("en-AU", {
                        month: "long",
                      }).format(new Date(2000, i, 1))}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <span className="text-sm font-bold text-on-surface/40">
            {currentYear}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() =>
              setViewDate(new Date(currentYear, currentMonth - 1, 1))
            }
            className="p-1.5 hover:bg-surface-container rounded-lg transition text-on-surface-variant"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() =>
              setViewDate(new Date(currentYear, currentMonth + 1, 1))
            }
            className="p-1.5 hover:bg-surface-container rounded-lg transition text-on-surface-variant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={i}
            className="text-[10px] font-black text-on-surface-variant/40 uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`b-${b}`} />
        ))}
        {days.map((day) => {
          const selected = isSelected(day);
          return (
            <button
              key={day}
              onClick={() => toggleDate(day)}
              className={`h-8 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 active:scale-90 shadow-sm ${
                selected
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105 z-10"
                  : "bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:bg-surface hover:text-on-surface hover:border-primary/50"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          <div className="text-[10px] font-black uppercase text-on-surface-variant/40 w-full mb-1">
            Selected: {selectedDates.length} days
          </div>
          <button
            onClick={() => onChange([])}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
