"use client";
import React, { useState, useEffect } from "react";
import { Event, EventStatus } from "@foodclub/types";
import { getPriorityLabel, formatDate, getStatusColour } from "@foodclub/utils";
import DateRangePicker from "@/components/DateRangePicker";
import {
  getEvents,
  addEvent,
  deleteEvent,
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});
  const [isEditing, setIsEditing] = useState(false);
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
    if (!editingEvent.name?.trim()) return;

    let res;
    if (isEditing && editingEvent.id) {
      res = await updateEvent(editingEvent.id, editingEvent);
    } else {
      res = await addEvent(editingEvent);
    }

    if (res?.data) {
      // Sync tasks
      if (editingEvent.tasks) {
        await updateEventTasks(res.data.id, editingEvent.tasks);
      }
      setEditingEvent({});
      setIsModalOpen(false);
      setIsEditing(false);
      loadData();
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
  };

  const updateTask = (idx: number, updates: any) => {
    const newTasks = [...(editingEvent.tasks || [])];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    setEditingEvent({ ...editingEvent, tasks: newTasks });
  };

  const removeTask = (idx: number) => {
    const newTasks = (editingEvent.tasks || []).filter((_, i) => i !== idx);
    setEditingEvent({ ...editingEvent, tasks: newTasks });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteEvent(id);
      loadData();
    }
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
            setIsEditing(false);
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
              <th className="font-medium px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
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
                    setIsEditing(true);
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
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ev.id, ev.name);
                      }}
                      className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                      title="Delete Event"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!loading && filteredEvents.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-bold text-on-surface">
              {isEditing ? "Edit Event" : "New Event"}{" "}
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
                        <textarea
                          placeholder="Description..."
                          value={task.description}
                          onChange={(e) =>
                            updateTask(idx, { description: e.target.value })
                          }
                          className="w-full bg-transparent text-xs text-on-surface-variant placeholder:text-on-surface-variant/30 focus:outline-none resize-none"
                          rows={1}
                        />
                        <div className="flex items-center gap-3">
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
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/15">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvent}
              className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
            >
              {isEditing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
