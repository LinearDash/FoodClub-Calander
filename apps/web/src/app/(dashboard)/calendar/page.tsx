"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Event, EventStatus, EventPriority } from "@foodclub/types";
import { getPriorityLabel, formatDate } from "@foodclub/utils";
import DateRangePicker from "@/components/DateRangePicker";

const getStatusColour = (status: EventStatus): string => {
  switch (status) {
    case "not_applied": return "bg-slate-200 text-slate-700";
    case "eoi_sent": return "!bg-amber-400 text-amber-900";
    case "form_filled": return "!bg-blue-500 text-white";
    case "unsuccessful": return "!bg-red-500 text-white";
    case "confirmed": return "!bg-emerald-500 text-white";
    default: return "bg-slate-200 text-slate-700";
  }
};

// Dummy Data
const initialEvents: Event[] = [
  {
    id: "1",
    name: "Royal Show Activation",
    date: "2026-04-18",
    location: "Claremont Showgrounds",
    contactName: "John Smith",
    contactDetails: "john@example.com",
    priority: "high",
    status: "confirmed",
    followUpDate: "2026-04-20",
    notes: "",
    isTBA: false,
    assignedTo: "Sarah",
    documents: [],
    tasks: [],
  },
  {
    id: "2",
    name: "Fremantle Food Fest",
    date: "2026-04-20",
    location: "Esplanade",
    contactName: "Jane Doe",
    contactDetails: "jane@example.com",
    priority: "medium",
    status: "eoi_sent",
    followUpDate: "2026-04-18",
    notes: "",
    isTBA: false,
    assignedTo: "Mike",
    documents: [],
    tasks: [],
  },
  {
    id: "3",
    name: "TBA: City Night Market",
    date: "2026-04",
    location: "Perth City",
    contactName: "Emma",
    contactDetails: "",
    priority: "low",
    status: "not_applied",
    followUpDate: "2026-04-25",
    notes: "Awaiting confirmed dates from council",
    isTBA: true,
    assignedTo: "Sarah",
    documents: [],
    tasks: [],
  },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});

  // SSR-safe guaranteed initialization
  const [currentDate, setCurrentDate] = useState(
    new Date("2026-04-18T12:00:00Z"),
  );

  useEffect(() => {
    // Client-side correction to true local time post-hydration
    setCurrentDate(new Date());
  }, []);

  // Generate calendar days
  const today = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();

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

  const totalCells = 42; // standard 6-week calendar grid
  const remainingCells = totalCells - (blanksCount + daysInMonth);
  const nextMonthBlanks = Array.from(
    { length: remainingCells },
    (_, i) => i + 1,
  );

  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  // Handlers
  const handleDayClick = (dayStr: string) => {
    setModalDate(dayStr);
    setEditingEvent({
      date: dayStr,
      status: "not_applied",
      priority: "medium",
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setEditingEvent(event);
    setModalDate(event.date);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingEvent.id) {
      // update
      setEvents(
        events.map((ev) =>
          ev.id === editingEvent.id
            ? ({ ...ev, ...editingEvent } as Event)
            : ev,
        ),
      );
    } else {
      // create
      const newEvent: Event = {
        ...editingEvent,
        id: Math.random().toString(),
        name: editingEvent.name || "New Event",
        isTBA: editingEvent.isTBA || false,
        documents: [],
        tasks: [],
      } as Event;
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
  };

  // Force tailwind to generate these classes by mentioning them here
  // bg-slate-200 text-slate-700 bg-amber-400 text-amber-900 bg-blue-500 text-white bg-red-500 text-white bg-emerald-500 text-white


  // User requested all events for the month to appear in the table, not just TBA
  const tableEvents = useMemo(
    () => events.filter((e) => e.date?.startsWith(currentMonthStr)),
    [events, currentMonthStr],
  );

  const getDayEvents = (dayStr: string) =>
    events.filter((e) => e.date === dayStr && !e.isTBA);

  return (
    <div className="space-y-12 pb-12">
      {/* Calendar Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-4xl font-bold text-on-surface min-w-[220px]">
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
                  setCurrentDate(new Date(Number(y), Number(m) - 1, 1));
                }
              }}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-base font-semibold hover:border-outline-variant text-on-surface shadow-sm cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Select Date"
            />
            <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 border border-surface-container shadow-sm ml-2">
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-on-surface-variant hover:text-on-surface font-semibold"
                aria-label="Previous month"
              >
                &larr;
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-sm font-semibold text-on-surface"
              >
                Today
              </button>
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
                }
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition text-on-surface-variant hover:text-on-surface font-semibold"
                aria-label="Next month"
              >
                &rarr;
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingEvent({
                status: "not_applied",
                priority: "medium",
                isTBA: true,
                date: currentMonthStr,
              });
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
          >
            + New Event
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.06)] overflow-hidden border border-surface-container">
          <div className="grid grid-cols-7 border-b border-surface-container bg-surface-container-low">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="px-4 py-3 text-sm font-semibold uppercase text-on-surface-variant text-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-surface">
            {prevMonthBlanks.map((day) => (
              <div
                key={`prev-${day}`}
                className="border-r border-b border-surface-container-low/50 p-2 flex flex-col min-h-[120px] select-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(220,38,38,0.02), rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.05) 10px, rgba(220,38,38,0.05) 20px)",
                }}
              >
                <span className="text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-1 text-red-600/40 bg-red-500/5">
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
                  onClick={() => handleDayClick(dayStr)}
                  className="border-r border-b border-surface-container-low p-2 hover:bg-surface-container-low cursor-pointer transition flex flex-col group min-h-[120px]"
                >
                  <span
                    className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-1
                    ${day === today.getDate() && currentMonth === today.getMonth() ? "bg-primary text-white" : "text-on-surface-variant group-hover:text-primary"}`}
                  >
                    {day}
                  </span>
                  <div className="space-y-1 overflow-y-auto flex-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => handleEventClick(e, ev)}
                        className={`text-xs px-2 py-1 rounded shadow-sm border border-black/5 flex items-center gap-1 ${getStatusColour(ev.status)}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0
                          ${
                            ev.priority === "high"
                              ? "bg-[#DC2626]"
                              : ev.priority === "medium"
                                ? "border border-[#F97316]"
                                : "bg-[#10B981]"
                          }`}
                        />
                        <span className="truncate">{ev.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {nextMonthBlanks.map((day) => (
              <div
                key={`next-${day}`}
                className="border-r border-b border-surface-container-low/50 p-2 flex flex-col min-h-[120px] select-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(220,38,38,0.02), rgba(220,38,38,0.02) 10px, rgba(220,38,38,0.05) 10px, rgba(220,38,38,0.05) 20px)",
                }}
              >
                <span className="text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full mb-1 text-red-600/40 bg-red-500/5">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TBA Events Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-on-surface flex items-center gap-3">
            TBA Events
            <span className="text-sm font-bold bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-lg border border-outline-variant/30">
              {tableEvents.length}
            </span>
          </h2>
          <button
            onClick={() => {
              setEditingEvent({
                status: "not_applied",
                priority: "medium",
                isTBA: true,
                date: currentMonthStr,
              });
              setIsModalOpen(true);
            }}
            className="text-primary hover:text-primary-container font-medium text-sm"
          >
            + Add TBA Event
          </button>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-sm border-b border-surface-container">
              <tr>
                <th className="font-medium px-6 py-4">Event Name</th>
                <th className="font-medium px-6 py-4">Date</th>
                <th className="font-medium px-6 py-4">Status</th>
                <th className="font-medium px-6 py-4">Priority</th>
                <th className="font-medium px-6 py-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {tableEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-on-surface-variant"
                  >
                    No events at the moment.
                  </td>
                </tr>
              )}
              {tableEvents.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={(e) => handleEventClick(e, ev)}
                  className="hover:bg-primary-fixed/30 cursor-pointer transition-colors text-on-surface"
                >
                  <td className="px-6 py-4 font-medium">{ev.name}</td>
                  <td className="px-6 py-4">
                    {ev.isTBA ? (
                      <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded text-xs font-semibold uppercase">
                        TBA
                      </span>
                    ) : (
                      <span className="text-on-surface-variant whitespace-nowrap">
                        {formatDate(ev.date) || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColour(ev.status)}`}
                    >
                      {ev.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant whitespace-nowrap">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0
                        ${
                          ev.priority === "high"
                            ? "bg-[#DC2626]"
                            : ev.priority === "medium"
                              ? "border border-[#F97316]"
                              : "bg-[#10B981]"
                        }`}
                      />
                      {getPriorityLabel(ev.priority)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {ev.contactName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-lg z-10 p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-bold text-on-surface">
              {editingEvent.id ? "Edit Event" : "New Event"}{" "}
              {editingEvent.isTBA ? "(TBA)" : ""}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editingEvent.name || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  placeholder="e.g., Summer Food Festival"
                />
              </div>

              {editingEvent.isTBA ? (
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Target Month
                  </label>
                  <input
                    type="month"
                    value={
                      editingEvent.date ? editingEvent.date.substring(0, 7) : ""
                    }
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingEvent.date || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Status
                  </label>
                  <select
                    value={editingEvent.status || "not_applied"}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        status: e.target.value as EventStatus,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="not_applied">Not Applied</option>
                    <option value="form_filled">Form Filled</option>
                    <option value="eoi_sent">EOI Sent</option>
                    <option value="unsuccessful">Unsuccessful</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Priority
                  </label>
                  <select
                    value={editingEvent.priority || "medium"}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        priority: e.target.value as EventPriority,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editingEvent.location || ""}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-sm"
                  placeholder="e.g., Fremantle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editingEvent.contactName || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={editingEvent.followUpDate || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        followUpDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-2">
                    Application Form Release
                  </label>
                  {/* Mode toggle */}
                  <div className="flex rounded-xl border border-outline-variant/30 overflow-hidden mb-3 w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingEvent({
                          ...editingEvent,
                          applicationFormReleaseDateType: "month",
                          applicationFormReleaseDateEnd: undefined,
                        })
                      }
                      className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                        !editingEvent.applicationFormReleaseDateType ||
                        editingEvent.applicationFormReleaseDateType === "month"
                          ? "bg-primary text-white"
                          : "bg-surface text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      Entire Month
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingEvent({
                          ...editingEvent,
                          applicationFormReleaseDateType: "range",
                        })
                      }
                      className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                        editingEvent.applicationFormReleaseDateType === "range"
                          ? "bg-primary text-white"
                          : "bg-surface text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      Date Range
                    </button>
                  </div>
                  {/* Month picker */}
                  {(!editingEvent.applicationFormReleaseDateType ||
                    editingEvent.applicationFormReleaseDateType ===
                      "month") && (
                    <input
                      type="month"
                      value={editingEvent.applicationFormReleaseDate || ""}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          applicationFormReleaseDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-sm"
                    />
                  )}
                  {/* Date range picker */}
                  {editingEvent.applicationFormReleaseDateType === "range" && (
                    <DateRangePicker
                      startDate={editingEvent.applicationFormReleaseDate || ""}
                      endDate={editingEvent.applicationFormReleaseDateEnd || ""}
                      onChange={(start, end) =>
                        setEditingEvent({
                          ...editingEvent,
                          applicationFormReleaseDate: start,
                          applicationFormReleaseDateEnd: end,
                        })
                      }
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                  Notes
                </label>
                <textarea
                  value={editingEvent.notes || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface resize-none shadow-sm"
                  placeholder="Additional context..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editingEvent.isTBA}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      isTBA: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded border-outline-variant/30 focus:ring-primary"
                />
                <span className="text-sm font-medium text-on-surface">
                  Mark as TBA Event (No fixed date)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/15">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:opacity-90 transition-all"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
