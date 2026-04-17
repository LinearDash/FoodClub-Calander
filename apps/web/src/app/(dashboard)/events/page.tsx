"use client";
import React, { useState } from "react";
import { Event, EventStatus } from "@foodclub/types";
import { getPriorityLabel, formatDate } from "@foodclub/utils";
import DateRangePicker from "@/components/DateRangePicker";

const getStatusColour = (status: EventStatus): string => {
  switch (status) {
    case "not_applied": return "bg-slate-200 text-slate-700";
    case "eoi_sent": return "bg-amber-400 text-amber-900";
    case "form_filled": return "bg-blue-500 text-white";
    case "unsuccessful": return "bg-red-500 text-white";
    case "confirmed": return "bg-emerald-500 text-white";
    default: return "bg-slate-200 text-slate-700";
  }
};

// Dummy events spanning the year
const initialEvents: Event[] = [
  {
    id: "1",
    name: "Perth Royal Show Activation",
    date: "2026-09-26",
    location: "Claremont Showgrounds",
    contactName: "John Smith",
    contactDetails: "john@example.com",
    priority: "high",
    status: "form_filled",
    followUpDate: "2026-05-01",
    notes: "",
    isTBA: false,
    assignedTo: "Sarah",
    documents: [],
    tasks: [],
  },
  {
    id: "2",
    name: "Fremantle Seafood Festival",
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
    notes: "",
    isTBA: true,
    assignedTo: "Sarah",
    documents: [],
    tasks: [],
  },
  {
    id: "4",
    name: "Winter Food Fest",
    date: "2026-07-15",
    location: "Northbridge",
    contactName: "Alice",
    contactDetails: "",
    priority: "high",
    status: "eoi_sent",
    followUpDate: "2026-06-01",
    notes: "",
    isTBA: false,
    assignedTo: "Mike",
    documents: [],
    tasks: [],
  },
  {
    id: "5",
    name: "TBA: Spring Carnival",
    date: "2026-10",
    location: "Victoria Park",
    contactName: "Bob",
    contactDetails: "",
    priority: "medium",
    status: "not_applied",
    followUpDate: "2026-08-10",
    notes: "",
    isTBA: true,
    assignedTo: "Sarah",
    documents: [],
    tasks: [],
  },
  {
    id: "6",
    name: "End of Year Gala",
    date: "2026-12-10",
    location: "Crown Perth",
    contactName: "Claire",
    contactDetails: "",
    priority: "high",
    status: "form_filled",
    followUpDate: "2026-11-01",
    notes: "",
    isTBA: false,
    assignedTo: "John",
    documents: [],
    tasks: [],
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddEvent = () => {
    if (!editingEvent.name?.trim()) return;
    const newEvent: Event = {
      ...editingEvent,
      id: Date.now().toString(),
      name: editingEvent.name,
      date: editingEvent.date || new Date().toISOString().split("T")[0],
      priority: editingEvent.priority || "medium",
      status: editingEvent.status || "not_applied",
      isTBA: editingEvent.isTBA || false,
      documents: [],
      tasks: [],
      location: editingEvent.location || "",
      notes: editingEvent.notes || "",
    } as Event;
    setEvents([newEvent, ...events]);
    setEditingEvent({});
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl font-bold text-on-surface">
            All Events
          </h1>
          <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-xl shadow-sm">
            {filteredEvents.length} Total
          </span>
        </div>
        <button
          onClick={() => {
            setEditingEvent({
              status: "not_applied",
              priority: "medium",
              isTBA: false,
            });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
        >
          + New Event
        </button>
      </div>

      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex items-center gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-surface border border-outline-variant/30 text-on-surface rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant text-sm border-b border-surface-container">
            <tr>
              <th className="font-medium px-6 py-4">Event Name</th>
              <th className="font-medium px-6 py-4">Date</th>
              <th className="font-medium px-6 py-4">Status</th>
              <th className="font-medium px-6 py-4">Priority</th>
              <th className="font-medium px-6 py-4">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-sm">
            {filteredEvents.map((ev) => (
              <tr
                key={ev.id}
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
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.priority === "high" ? "bg-[#DC2626]" : ev.priority === "medium" ? "border border-[#F97316]" : "bg-[#10B981]"}`}
                    />
                    {getPriorityLabel(ev.priority)}
                  </div>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {ev.location || "-"}
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-on-surface">
              New Event {editingEvent.isTBA ? "(TBA)" : ""}
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
                  autoFocus
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
                        status: e.target.value as any,
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
                        priority: e.target.value as any,
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
                onClick={handleAddEvent}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
