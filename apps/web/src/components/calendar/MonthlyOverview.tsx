"use client";

import React, { useMemo } from "react";
import { Event } from "@foodclub/types";
import { formatDate, getStatusColour, getPriorityLabel } from "@foodclub/utils";

interface MonthlyOverviewProps {
  events: Event[];
  currentMonthStr: string;
  onEventClick: (event: Event, e: React.MouseEvent) => void;
}

export default function MonthlyOverview({
  events,
  currentMonthStr,
  onEventClick,
}: MonthlyOverviewProps) {
  const tableEvents = useMemo(
    () =>
      events
        .filter((e) => e.date?.startsWith(currentMonthStr))
        .sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [events, currentMonthStr],
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface flex items-center gap-3">
          Monthly Overview
          <span className="text-xs font-black bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-lg border border-outline-variant/30">
            {tableEvents.length}
          </span>
        </h2>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-[10px] md:text-sm border-b border-surface-container">
              <tr>
                <th className="font-black uppercase tracking-widest px-4 md:px-6 py-4">Event Name</th>
                <th className="font-black uppercase tracking-widest px-4 md:px-6 py-4 whitespace-nowrap">Date</th>
                <th className="font-black uppercase tracking-widest px-4 md:px-6 py-4">Status</th>
                <th className="font-black uppercase tracking-widest px-4 md:px-6 py-4 hidden sm:table-cell">Priority</th>
                <th className="font-black uppercase tracking-widest px-4 md:px-6 py-4 hidden lg:table-cell">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs md:text-sm">
              {tableEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-on-surface-variant italic font-medium opacity-50"
                  >
                    No events found for this month.
                  </td>
                </tr>
              )}
              {tableEvents.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={(e) => onEventClick(ev, e)}
                  className="hover:bg-primary/5 cursor-pointer transition-colors text-on-surface group"
                >
                  <td className="px-4 md:px-6 py-4 font-bold md:font-semibold group-hover:text-primary transition-colors">
                    {ev.name}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {ev.isTBA ? (
                      <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-md text-[10px] font-black uppercase tracking-widest">
                        TBA
                      </span>
                    ) : (
                      <span className="text-on-surface-variant font-medium whitespace-nowrap">
                        {formatDate(ev.date) || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColour(
                        ev.status,
                      )}`}
                    >
                      {ev.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-on-surface-variant whitespace-nowrap">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0
                        ${
                          ev.priority === "high"
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                            : ev.priority === "medium"
                              ? "bg-orange-400"
                              : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-bold text-[10px] uppercase tracking-wider">
                        {getPriorityLabel(ev.priority)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell font-medium text-on-surface-variant">
                    {ev.contactName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
