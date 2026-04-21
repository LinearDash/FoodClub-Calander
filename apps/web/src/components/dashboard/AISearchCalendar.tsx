"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AISearchCalendarProps {
  selectedDates: Date[];
  onChange: (dates: Date[]) => void;
}

export default function AISearchCalendar({ selectedDates, onChange }: AISearchCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // week starts Monday
  const blanksCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);

  const isSelected = (day: number) => {
    return selectedDates.some(d => 
      d.getDate() === day && 
      d.getMonth() === currentMonth && 
      d.getFullYear() === currentYear
    );
  };

  const toggleDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (isSelected(day)) {
      onChange(selectedDates.filter(d => 
        !(d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear)
      ));
    } else {
      onChange([...selectedDates, date]);
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-on-surface capitalize">
          {new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" }).format(viewDate)}
        </span>
        <div className="flex gap-1">
          <button 
            onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
            className="p-1.5 hover:bg-surface-container rounded-lg transition text-on-surface-variant"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
            className="p-1.5 hover:bg-surface-container rounded-lg transition text-on-surface-variant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-black text-on-surface-variant/40 uppercase">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(day => {
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
