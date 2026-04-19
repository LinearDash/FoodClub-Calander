"use client";
import React, { useState, useEffect } from "react";
import { Event, EventStatus, EventPriority } from "@foodclub/types";
import { formatDate, getStatusColour } from "@foodclub/utils";
import DateRangePicker from "@/components/DateRangePicker";
import {
  getEvents,
  addEvent,
  updateEvent,
  saveDocumentRecord,
  getProfiles,
  updateEventTasks,
} from "./actions";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "edit">("edit");
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});
  const [expandedTaskIndexes, setExpandedTaskIndexes] = useState<Record<number, boolean>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const data = await getProfiles();
    setProfiles(data);
  };

  useEffect(() => {
    loadData();
    fetchProfiles();
  }, []);

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSaveEvent = async () => {
    if (!editingEvent.name?.trim()) {
      alert("Please enter an event name.");
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingEvent.id) {
        res = await updateEvent(editingEvent.id, editingEvent);
      } else {
        res = await addEvent(editingEvent);
      }

      if (res?.error) {
        alert(`Failed to save event: ${res.error}`);
        setSaving(false);
        return;
      }

      if (res?.data) {
        // Sync tasks
        if (editingEvent.tasks) {
          await updateEventTasks(res.data.id, editingEvent.tasks);
        }
        setEditingEvent({});
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`An unexpected error occurred: ${err.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent.id) return;

    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${editingEvent.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      setIsUploading(false);
      return;
    }

    await saveDocumentRecord(editingEvent.id, filePath, file.name, file.type);

    // Refresh event data to show new document
    const updatedEvents = await getEvents();
    const currentEvent = updatedEvents.find((ev) => ev.id === editingEvent.id);
    if (currentEvent) setEditingEvent(currentEvent);

    setEvents(updatedEvents);
    setIsUploading(false);
  };

  const addTask = () => {
    const newTasks = [
      ...(editingEvent.tasks || []),
      {
        id: Math.random().toString(),
        eventId: editingEvent.id || "",
        title: "",
        description: "",
        assignedTo: "",
        completed: false,
      },
    ];
    setEditingEvent({ ...editingEvent, tasks: newTasks });
    setExpandedTaskIndexes((prev) => ({ ...prev, [newTasks.length - 1]: true }));
  };

  const updateTask = (idx: number, updates: any) => {
    const newTasks = [...(editingEvent.tasks || [])];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    setEditingEvent({ ...editingEvent, tasks: newTasks });
  };

  const removeTask = (idx: number) => {
    const newTasks = (editingEvent.tasks || []).filter((_, i) => i !== idx);
    setEditingEvent({ ...editingEvent, tasks: newTasks });
    setExpandedTaskIndexes({});
  };

  const toggleTaskExpansion = (idx: number) => {
    setExpandedTaskIndexes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const parseISODate = (value?: string) => {
    if (!value) return null;
    const iso = value.split("T")[0];
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const renderMiniEventCalendar = () => {
    const start = parseISODate(editingEvent.date);
    if (!start) return null;
    const end = parseISODate(editingEvent.endDate) || start;
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const lead = (monthStart.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      cells.push(new Date(start.getFullYear(), start.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="rounded-xl border border-outline-variant/20 p-3 bg-surface">
        <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">
          {monthStart.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-on-surface-variant mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => <div key={`${d}-${idx}`} className="text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={idx} className="h-6" />;
            const inRange = cell >= start && cell <= end;
            const isStart = cell.toDateString() === start.toDateString();
            const isEnd = cell.toDateString() === end.toDateString();
            return (
              <div
                key={idx}
                className={`h-6 text-[11px] rounded text-center leading-6 ${inRange ? "bg-primary/20 text-on-surface font-semibold" : "text-on-surface-variant"} ${isStart || isEnd ? "ring-1 ring-primary" : ""}`}
              >
                {cell.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            All Events
          </h1>
          <span className="text-xs md:text-sm font-black bg-primary/10 text-primary px-3 py-1 rounded-xl shadow-sm border border-primary/10">
            {filteredEvents.length}
          </span>
        </div>
        <button
          onClick={() => {
            setModalMode("edit");
            setExpandedTaskIndexes({});
            setEditingEvent({
              status: "not_applied",
              priority: "medium",
              isTBA: false,
            });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md shadow-primary/20 w-full md:w-auto active:scale-95"
        >
          + New Event
        </button>
      </div>

      <div className="bg-surface-container-low p-2 md:p-4 rounded-2xl border border-surface-container flex items-center gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-surface border border-outline-variant/30 text-on-surface rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-primary outline-none shadow-sm text-sm"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-on-surface-variant text-sm border-b border-surface-container">
            <tr>
              <th className="font-medium px-6 py-4">Event Name</th>
              <th className="font-medium px-6 py-4">Date</th>
              <th className="font-medium px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-on-surface-variant font-medium"
                >
                  Loading events...
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-primary-fixed/30 cursor-pointer transition-colors text-on-surface"
                  onClick={() => {
                    setEditingEvent(ev);
                    setModalMode("preview");
                    setExpandedTaskIndexes({});
                    setIsModalOpen(true);
                  }}
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
                </tr>
              ))
            )}
            {!loading && filteredEvents.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-black uppercase tracking-widest opacity-20">
            Loading...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant italic font-medium opacity-40">
            No events found.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                setEditingEvent(ev);
                setModalMode("preview");
                setExpandedTaskIndexes({});
                setIsModalOpen(true);
              }}
              className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h3 className="font-black text-on-surface text-lg leading-tight">{ev.name}</h3>
                  <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">
                    {ev.location || "No location"}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  ev.priority === "high" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                  ev.priority === "medium" ? "bg-orange-400" : "bg-emerald-400"
                }`} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-0.5">Date</span>
                  <span className="text-sm font-bold text-on-surface">
                    {ev.isTBA ? "TBA" : formatDate(ev.date)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Status</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColour(ev.status)}`}>
                    {ev.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-surface-container-lowest sm:rounded-3xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-lg z-10 p-6 flex flex-col gap-6 h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] animate-in slide-in-from-bottom duration-300">
            {modalMode === "preview" ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColour((editingEvent.status || "not_applied") as EventStatus)}`}>
                        {(editingEvent.status || "not_applied").replace("_", " ")}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        editingEvent.priority === "high"
                          ? "bg-[#DC2626]"
                          : editingEvent.priority === "medium"
                            ? "border border-[#F97316]"
                            : "bg-[#10B981]"
                      }`} />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-on-surface">{editingEvent.name || "Untitled event"}</h3>
                    <p className="text-on-surface-variant mt-1">{editingEvent.location || "No location added"}</p>
                  </div>
                  <button
                    onClick={() => setModalMode("edit")}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {renderMiniEventCalendar()}
                  <div className="rounded-xl bg-surface-container-low p-3">
                    <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">Date</p>
                    <p className="font-medium text-on-surface">
                      {editingEvent.isTBA ? (editingEvent.date?.substring(0, 7) || "TBA") : (formatDate(editingEvent.date || "") || "-")}
                    </p>
                  </div>
                  {editingEvent.followUpDate && (
                    <div className="rounded-xl bg-surface-container-low p-3 text-sm">
                      <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">Follow-up</p>
                      <p className="font-medium text-on-surface">{formatDate(editingEvent.followUpDate)}</p>
                    </div>
                  )}
                  {(editingEvent.contactName || editingEvent.contactDetails) && (
                    <div className="rounded-xl bg-surface-container-low p-3 text-sm">
                      <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">Contact</p>
                      <p className="font-medium text-on-surface">
                        {editingEvent.contactName || editingEvent.contactDetails}
                        {editingEvent.contactName && editingEvent.contactDetails ? ` (${editingEvent.contactDetails})` : ""}
                      </p>
                    </div>
                  )}
                  {editingEvent.notes && (
                    <div>
                      <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">Notes</p>
                      <div className="rounded-xl bg-surface-container-low p-3 text-sm text-on-surface">
                        {editingEvent.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">Attachments</p>
                  {(editingEvent.documents || []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No attachments.</p>
                  ) : (
                    <div className="space-y-1">
                      {(editingEvent.documents || []).map((doc, idx) => (
                        <div key={idx} className="text-sm text-primary font-medium">- {doc.split("/").pop()}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">Tasks</p>
                  {(editingEvent.tasks || []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No tasks added.</p>
                  ) : (
                    <div className="space-y-2">
                      {(editingEvent.tasks || []).map((task, idx) => (
                        <div key={idx} className="rounded-xl bg-surface-container-low p-3 flex items-center gap-3">
                          <input type="checkbox" checked={task.completed} readOnly className="w-4 h-4 rounded border-outline-variant/30" />
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{task.title || "Untitled task"}</p>
                            {task.description && <p className="text-xs text-on-surface-variant">{task.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end border-t border-outline-variant/15 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Start Date
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
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingEvent.endDate || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
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
            </div>

            <div className="border-t border-outline-variant/15 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold uppercase text-on-surface-variant">
                  Tasks & Checklists
                </label>
                <button
                  type="button"
                  onClick={addTask}
                  className="text-xs font-bold text-primary hover:text-primary-container"
                >
                  + Add Task
                </button>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {(editingEvent.tasks || []).length === 0 && (
                  <div className="text-sm text-on-surface-variant/50 italic py-2">
                    No tasks added yet.
                  </div>
                )}
                {(editingEvent.tasks || []).map((task, idx) => (
                  <div
                    key={idx}
                    className="group bg-surface-container-low rounded-xl p-3 border border-outline-variant/10"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) =>
                          updateTask(idx, { completed: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 text-primary rounded border-outline-variant/30 focus:ring-primary"
                      />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Task title..."
                          value={task.title}
                          onChange={(e) =>
                            updateTask(idx, { title: e.target.value })
                          }
                          className="w-full bg-transparent text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTaskExpansion(idx)}
                            className="text-[10px] font-bold uppercase text-primary hover:text-primary-container"
                          >
                            {expandedTaskIndexes[idx] ? "Hide Comments" : "Add Comments"}
                          </button>
                          <select
                            value={task.assignedTo || ""}
                            onChange={(e) =>
                              updateTask(idx, { assignedTo: e.target.value })
                            }
                            className="text-[10px] font-bold uppercase bg-surface border border-outline-variant/20 rounded-lg px-2 py-1 text-on-surface-variant"
                          >
                            <option value="">Unassigned</option>
                            {profiles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.full_name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeTask(idx)}
                            className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                        {expandedTaskIndexes[idx] && (
                          <textarea
                            placeholder="Comments..."
                            value={task.description || ""}
                            onChange={(e) =>
                              updateTask(idx, { description: e.target.value })
                            }
                            className="w-full bg-surface text-xs text-on-surface rounded-lg border border-outline-variant/20 p-2 placeholder:text-on-surface-variant/40 focus:outline-none"
                            rows={3}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                Attachment{" "}
                {isUploading && (
                  <span className="text-primary animate-pulse ml-2 font-bold">
                    (Uploading...)
                  </span>
                )}
              </label>
              {!editingEvent.id ? (
                <p className="text-[10px] text-on-surface-variant italic mb-2">
                  Save the event first to upload attachments.
                </p>
              ) : (
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                />
              )}
              {editingEvent.documents && editingEvent.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {editingEvent.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-primary font-medium flex items-center gap-1"
                    >
                      <span>📄</span> {doc.split("/").pop()}
                    </div>
                  ))}
                </div>
              )}
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/15">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvent}
              disabled={saving}
              className={`bg-primary text-white px-6 py-2 rounded-xl font-medium shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:opacity-90 transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saving ? "Saving..." : (editingEvent.id ? "Save Changes" : "Add Event")}
            </button>
          </div>
              </>
            )}
        </div>
        </div>
      )}
    </div>
  );
}
