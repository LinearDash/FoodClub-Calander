/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Event, EventStatus, EventPriority } from "@foodclub/types";
import { getStatusColour, formatDate } from "@foodclub/utils";
import { X } from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";
import { createClient } from "@/utils/supabase/client";
import { saveDocumentRecord } from "@/app/(dashboard)/events/actions";

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "preview" | "edit";
  setMode: (mode: "preview" | "edit") => void;
  event: Partial<Event>;
  setEvent: (event: Partial<Event>) => void;
  profiles: Profile[];
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  onRefresh: () => Promise<void>;
}

export default function EventModal({
  isOpen,
  onClose,
  mode,
  setMode,
  event,
  setEvent,
  profiles,
  onSave,
  onDelete,
  isSaving,
  onRefresh,
}: EventModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [expandedTaskIndexes, setExpandedTaskIndexes] = useState<
    Record<number, boolean>
  >({});

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event.id) return;

    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${event.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      setIsUploading(false);
      return;
    }

    await saveDocumentRecord(event.id, filePath, file.name, file.type);

    await onRefresh();
    setIsUploading(false);
  };

  const addTask = () => {
    const newTasks = [
      ...(event.tasks || []),
      {
        id: Math.random().toString(),
        eventId: event.id || "",
        title: "",
        description: "",
        assignedTo: "",
        completed: false,
      },
    ];
    setEvent({ ...event, tasks: newTasks });
    setExpandedTaskIndexes((prev) => ({
      ...prev,
      [newTasks.length - 1]: true,
    }));
  };

  const updateTask = (idx: number, updates: any) => {
    const newTasks = [...(event.tasks || [])];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    setEvent({ ...event, tasks: newTasks });
  };

  const removeTask = (idx: number) => {
    const newTasks = (event.tasks || []).filter((_, i) => i !== idx);
    setEvent({ ...event, tasks: newTasks });
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
    const start = parseISODate(event.date);
    if (!start) return null;
    const end = parseISODate(event.endDate) || start;
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
          {monthStart.toLocaleDateString("en-AU", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-on-surface-variant mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
            <div key={`${d}-${idx}`} className="text-center">
              {d}
            </div>
          ))}
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
                className={`h-6 text-[11px] rounded text-center leading-6 ${
                  inRange
                    ? "bg-primary/20 text-on-surface font-semibold"
                    : "text-on-surface-variant"
                } ${isStart || isEnd ? "ring-1 ring-primary" : ""}`}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-lg z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 relative">
        <div className="h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar sm:p-8 p-5 flex flex-col sm:gap-6 gap-4">
          {/* Mobile Indicator Handle */}
          <div className="w-12 h-1.5 bg-on-surface-variant/10 rounded-full mx-auto mb-2 sm:hidden shrink-0" />

          {/* Top Close Button (Desktop & Mobile) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface z-20"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {mode === "preview" ? (
            <div className="space-y-6">
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold uppercase ${getStatusColour(
                      (event.status || "not_applied") as EventStatus,
                    )}`}
                  >
                    {(event.status || "not_applied").replace("_", " ")}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      event.priority === "high"
                        ? "bg-[#DC2626]"
                        : event.priority === "medium"
                          ? "border border-primary"
                          : "bg-[#10B981]"
                    }`}
                  />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
                  {event.name || "Untitled event"}
                </h3>
                <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
                  {event.location || "No location added"}
                </p>
              </div>
              <button
                onClick={() => setMode("edit")}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md w-full sm:w-auto"
              >
                Edit
              </button>

              <div className="space-y-4">
                {renderMiniEventCalendar()}
                <div className="rounded-xl bg-surface-container-low p-3">
                  <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">
                    Date
                  </p>
                  <p className="font-medium text-on-surface">
                    {event.isTBA
                      ? event.date?.substring(0, 7) || "TBA"
                      : formatDate(event.date || "") || "-"}
                  </p>
                </div>
                {event.followUpDate && (
                  <div className="rounded-xl bg-surface-container-low p-3 text-sm">
                    <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">
                      Follow-up
                    </p>
                    <p className="font-medium text-on-surface">
                      {formatDate(event.followUpDate)}
                    </p>
                  </div>
                )}
                {(event.contactName || event.contactDetails) && (
                  <div className="rounded-xl bg-surface-container-low p-3 text-sm">
                    <p className="text-xs uppercase font-semibold text-on-surface-variant mb-1">
                      Contact
                    </p>
                    <p className="font-medium text-on-surface">
                      {event.contactName || event.contactDetails}
                      {event.contactName && event.contactDetails
                        ? ` (${event.contactDetails})`
                        : ""}
                    </p>
                  </div>
                )}
                {event.notes && (
                  <div>
                    <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">
                      Notes
                    </p>
                    <div className="rounded-xl bg-surface-container-low p-3 text-sm text-on-surface">
                      {event.notes}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">
                  Attachments
                </p>
                {(event.documents || []).length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    No attachments.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {(event.documents || []).map((doc, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-primary font-medium"
                      >
                        - {doc.split("/").pop()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-on-surface-variant mb-2">
                  Tasks
                </p>
                {(event.tasks || []).length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    No tasks added.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(event.tasks || []).map((task, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-surface-container-low p-3 flex items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="w-4 h-4 rounded border-outline-variant/30"
                        />
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {task.title || "Untitled task"}
                          </p>
                          {task.description && (
                            <p className="text-xs text-on-surface-variant">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl font-bold text-on-surface">
                {event.id ? "Edit Event" : "New Event"}{" "}
                {event.isTBA ? "(TBA)" : ""}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={event.name || ""}
                    onChange={(e) =>
                      setEvent({ ...event, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    placeholder="e.g., Summer Food Festival"
                  />
                </div>

                {event.isTBA ? (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                      Target Month
                    </label>
                    <input
                      type="month"
                      value={event.date ? event.date.substring(0, 7) : ""}
                      onChange={(e) =>
                        setEvent({ ...event, date: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={event.date || ""}
                        onChange={(e) =>
                          setEvent({ ...event, date: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={event.endDate || ""}
                        onChange={(e) =>
                          setEvent({ ...event, endDate: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                      Status
                    </label>
                    <select
                      value={event.status || "not_applied"}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          status: e.target.value as EventStatus,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    >
                      <option value="not_applied">Not Applied</option>
                      <option value="form_filled">Form Filled</option>
                      <option value="eoi_sent">EOI Sent</option>
                      <option value="unsuccessful">Unsuccessful</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                      Priority
                    </label>
                    <select
                      value={event.priority || "medium"}
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          priority: e.target.value as EventPriority,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={event.location || ""}
                    onChange={(e) =>
                      setEvent({ ...event, location: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    placeholder="e.g., Fremantle"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={event.contactName || ""}
                      onChange={(e) =>
                        setEvent({ ...event, contactName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={event.followUpDate || ""}
                      onChange={(e) =>
                        setEvent({ ...event, followUpDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                      Application Form Release
                    </label>
                    <div className="flex rounded-xl border border-outline-variant/30 overflow-hidden mb-3 w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          setEvent({
                            ...event,
                            applicationFormReleaseDateType: "month",
                            applicationFormReleaseDateEnd: undefined,
                          })
                        }
                        className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                          !event.applicationFormReleaseDateType ||
                          event.applicationFormReleaseDateType === "month"
                            ? "bg-primary text-white"
                            : "bg-surface text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        Entire Month
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEvent({
                            ...event,
                            applicationFormReleaseDateType: "range",
                          })
                        }
                        className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                          event.applicationFormReleaseDateType === "range"
                            ? "bg-primary text-white"
                            : "bg-surface text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        Date Range
                      </button>
                    </div>
                    {(!event.applicationFormReleaseDateType ||
                      event.applicationFormReleaseDateType === "month") && (
                      <input
                        type="month"
                        value={event.applicationFormReleaseDate || ""}
                        onChange={(e) =>
                          setEvent({
                            ...event,
                            applicationFormReleaseDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-sm"
                      />
                    )}
                    {event.applicationFormReleaseDateType === "range" && (
                      <DateRangePicker
                        startDate={event.applicationFormReleaseDate || ""}
                        endDate={event.applicationFormReleaseDateEnd || ""}
                        onChange={(start, end) =>
                          setEvent({
                            ...event,
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
                    value={event.notes || ""}
                    onChange={(e) =>
                      setEvent({ ...event, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface resize-none shadow-sm h-20"
                    placeholder="Additional context..."
                  />
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
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                    {(event.tasks || []).length === 0 && (
                      <div className="text-sm text-on-surface-variant/50 italic py-2">
                        No tasks added yet.
                      </div>
                    )}
                    {(event.tasks || []).map((task, idx) => (
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
                                {expandedTaskIndexes[idx]
                                  ? "Hide Comments"
                                  : "Add Comments"}
                              </button>
                              <select
                                value={task.assignedTo || ""}
                                onChange={(e) =>
                                  updateTask(idx, {
                                    assignedTo: e.target.value,
                                  })
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
                                  updateTask(idx, {
                                    description: e.target.value,
                                  })
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
                  {!event.id ? (
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
                  {event.documents &&
                    (event.documents as string[]).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {(event.documents as string[]).map((doc, idx) => (
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
                    checked={!!event.isTBA}
                    onChange={(e) =>
                      setEvent({ ...event, isTBA: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded border-outline-variant/30 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">
                    Mark as TBA Event (No fixed date)
                  </span>
                </label>
              </div>

              <div
                className={`flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-outline-variant/15 ${
                  event.id ? "justify-between" : "justify-end"
                }`}
              >
                {event.id && (
                  <button
                    onClick={onDelete}
                    className="w-full sm:w-auto px-4 py-2.5 font-bold text-sm text-red-500 hover:bg-red-50 transition rounded-xl order-last sm:order-first"
                  >
                    Delete Event
                  </button>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 font-bold text-sm text-on-surface-variant hover:text-on-surface transition rounded-xl bg-surface-container sm:bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:opacity-90 transition-all ${
                      isSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save Event"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
