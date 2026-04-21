/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Event } from "@foodclub/types";
import { formatDate, getStatusColour } from "@foodclub/utils";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getProfiles,
  updateEventTasks,
} from "./actions";

import EventModal from "@/components/calendar/EventModal";

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
  const [profiles, setProfiles] = useState<Profile[]>([]);

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

  const handleDelete = async () => {
    if (editingEvent.id && window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(editingEvent.id);
      setIsModalOpen(false);
      loadData();
    }
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

      {/* Shared Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        setMode={setModalMode}
        event={editingEvent}
        setEvent={setEditingEvent}
        profiles={profiles}
        onSave={handleSaveEvent}
        onDelete={handleDelete}
        isSaving={saving}
        onRefresh={loadData}
      />
    </div>
  );
}
