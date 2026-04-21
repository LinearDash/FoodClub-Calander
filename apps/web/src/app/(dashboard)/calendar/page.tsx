"use client";

import React, { useState, useEffect } from "react";
import { Event } from "@foodclub/types";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getProfiles,
  updateEventTasks,
} from "@/app/(dashboard)/events/actions";

// Modular Components
import Calendar from "@/components/calendar/Calendar";
import MonthlyOverview from "@/components/calendar/MonthlyOverview";
import EventModal from "@/components/calendar/EventModal";

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "edit">("preview");
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});

  const [currentDate, setCurrentDate] = useState(new Date());
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchProfiles = async () => {
    const data = await getProfiles();
    setProfiles(data);
  };

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
    fetchProfiles();
  }, []);

  const currentMonthStr = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  // Handlers
  const handleNewEvent = (dayStr?: string) => {
    setModalMode("edit");
    setEditingEvent({
      date: dayStr || currentMonthStr,
      status: "not_applied",
      priority: "medium",
      isTBA: !dayStr,
      tasks: [],
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("preview");
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
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
        setIsModalOpen(false);
        loadEvents();
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
      loadEvents();
    }
  };

  return (
    <div className="space-y-6 md:space-y-12 pb-24 md:pb-12">
      {/* 1. Main Calendar Section (Header + Grid) */}
      <Calendar
        currentDate={currentDate}
        onNavigate={setCurrentDate}
        onNewEvent={handleNewEvent}
        events={events}
        loading={loading}
        onEventClick={handleEventClick}
      />

      {/* 2. Monthly Overview Table */}
      <MonthlyOverview
        events={events}
        currentMonthStr={currentMonthStr}
        onEventClick={handleEventClick}
      />

      {/* 3. Event Management Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        setMode={setModalMode}
        event={editingEvent}
        setEvent={setEditingEvent}
        profiles={profiles}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={saving}
        onRefresh={loadEvents}
      />
    </div>
  );
}
