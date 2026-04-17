"use client";
import React, { useState, useCallback } from "react";

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function isBetween(day: Date, a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  const [start, end] = a <= b ? [a, b] : [b, a];
  return day > start && day < end;
}

function isSame(day: Date, other: Date | null): boolean {
  if (!other) return false;
  return toDateStr(day) === toDateStr(other);
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [selecting, setSelecting] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const start = parseDate(startDate);
  const end   = parseDate(endDate);

  // Calendar grid: Mon–Sun
  const firstDay = new Date(viewYear, viewMonth, 1);
  // getDay(): 0=Sun, 1=Mon … convert so Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { date: Date; current: boolean }[] = [];
  // Leading days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrev - i), current: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), current: true });
  }
  // Trailing days to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(viewYear, viewMonth + 1, d), current: false });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleMouseDown = useCallback((date: Date) => {
    setSelecting(true);
    onChange(toDateStr(date), "");
    setHoverDate(date);
  }, [onChange]);

  const handleMouseEnter = useCallback((date: Date) => {
    if (selecting) setHoverDate(date);
  }, [selecting]);

  const handleMouseUp = useCallback((date: Date) => {
    if (!selecting) return;
    setSelecting(false);
    // Ensure start <= end
    const s = parseDate(startDate);
    const candidate = date;
    if (s && candidate < s) {
      onChange(toDateStr(candidate), toDateStr(s));
    } else {
      onChange(startDate, toDateStr(candidate));
    }
    setHoverDate(null);
  }, [selecting, startDate, onChange]);

  // Effective range while dragging
  const effectiveStart = start;
  const effectiveEnd   = selecting ? hoverDate : end;

  const rangeStart = effectiveStart && effectiveEnd
    ? (effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd)
    : effectiveStart;
  const rangeEnd = effectiveStart && effectiveEnd
    ? (effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart)
    : effectiveEnd;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <div
      className="select-none rounded-2xl border border-outline-variant/30 bg-surface shadow-md overflow-hidden"
      onMouseLeave={() => { if (selecting) setHoverDate(null); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant/20">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition text-on-surface-variant"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="font-semibold text-sm text-on-surface">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition text-on-surface-variant"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 bg-surface-container-low border-b border-outline-variant/10">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-center text-[11px] font-semibold uppercase text-on-surface-variant py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 p-1 gap-y-0.5">
        {cells.map(({ date, current }, i) => {
          const isStart   = isSame(date, rangeStart);
          const isEnd     = isSame(date, rangeEnd);
          const inRange   = isBetween(date, rangeStart ?? null, rangeEnd ?? null);
          const isToday   = toDateStr(date) === toDateStr(new Date());
          const isEndpoint = isStart || isEnd;
          const hasBothEndpoints = rangeStart && rangeEnd;

          let cellBg = "";
          if (isEndpoint && hasBothEndpoints) {
            cellBg = "bg-primary text-white rounded-xl font-bold shadow-sm";
          } else if (isEndpoint) {
            cellBg = "bg-primary text-white rounded-xl font-bold shadow-sm";
          } else if (inRange) {
            cellBg = "bg-primary/15 text-primary font-medium";
          }

          // Range "bridge" styling: flat edges on interior side
          const isRangeStart = isStart && hasBothEndpoints && rangeStart! < rangeEnd!;
          const isRangeEnd   = isEnd && hasBothEndpoints && rangeStart! < rangeEnd!;
          let roundClass = "rounded-xl";
          if (isRangeStart) roundClass = "rounded-l-xl rounded-r-none";
          if (isRangeEnd)   roundClass = "rounded-l-none rounded-r-xl";
          if (inRange)      roundClass = "rounded-none";

          return (
            <div
              key={i}
              className={`relative flex items-center justify-center cursor-pointer h-9 transition-colors ${!isEndpoint && !inRange ? "hover:bg-surface-container-high rounded-xl" : ""} ${isEndpoint ? roundClass : inRange ? roundClass : "rounded-xl"} ${cellBg}`}
              onMouseDown={() => handleMouseDown(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseUp={() => handleMouseUp(date)}
            >
              <span className={`text-sm z-10 ${!current ? "opacity-30" : ""} ${isEndpoint ? "text-white" : inRange ? "text-primary" : isToday ? "text-primary font-bold" : "text-on-surface"}`}>
                {date.getDate()}
              </span>
              {isToday && !isEndpoint && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected range display */}
      <div className="px-4 py-3 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-low gap-2">
        <span className="text-sm text-on-surface-variant">
          {startDate && endDate
            ? <><span className="font-semibold text-on-surface">{new Date(startDate + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span> → <span className="font-semibold text-on-surface">{new Date(endDate + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span></>
            : startDate
            ? <><span className="font-semibold text-on-surface">{new Date(startDate + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span> <span className="text-on-surface-variant/60">→ pick end date</span></>
            : <span className="text-on-surface-variant/60 italic">Click &amp; drag to select range</span>
          }
        </span>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { onChange("", ""); setHoverDate(null); }}
            className="text-xs text-on-surface-variant hover:text-error transition px-2 py-1 rounded-lg hover:bg-error/10"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
