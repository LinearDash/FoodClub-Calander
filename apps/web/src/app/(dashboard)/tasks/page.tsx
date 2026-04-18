"use client";
import React, { useState, useEffect, useMemo } from "react";

import { getGlobalTasks, getProfiles, updateTaskStatus, addStandaloneTask } from "../events/actions";
import { Task } from "@foodclub/types";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "my_tasks" | "all">("my_tasks");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [tasksData, profilesData] = await Promise.all([
      getGlobalTasks(),
      getProfiles()
    ]);
    
    // Get current user to handle "My Tasks" filtering
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    setTasks(tasksData);
    setProfiles(profilesData);
    setCurrentUserId(user?.id || null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayTasks = useMemo(() => {
    if (!currentUserId) return [];
    if (activeTab === "all") return tasks;
    if (activeTab === "my_tasks") {
      return tasks.filter(t => t.assignedTo === currentUserId);
    } else {
      return tasks.filter(t => t.assignedTo !== currentUserId);
    }
  }, [tasks, activeTab, currentUserId]);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    
    try {
      await updateTaskStatus(id, !currentStatus);
      // Silently refresh in background without setting loading=true
      const tasksData = await getGlobalTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
    }
  };


  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await addStandaloneTask({
      title: newTaskTitle,
      description: newTaskDescription,
      assignedTo: newTaskAssignee || (currentUserId as string),
      dueDate: new Date().toISOString(),
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold text-on-surface">Tasks</h1>
        <button 
          onClick={() => {
            setNewTaskAssignee(currentUserId || "");
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
        >
          + New Task
        </button>
      </div>

      <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl w-max border border-surface-container">
        <button 
          onClick={() => setActiveTab("my_tasks")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "my_tasks" ? "bg-surface shadow text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          My Tasks
        </button>
        <button 
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "assigned" ? "bg-surface shadow text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Team Tasks
        </button>
        <button 
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "all" ? "bg-surface shadow text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          All Tasks
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden p-2">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant animate-pulse font-medium">Loading tasks...</div>
        ) : displayTasks.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-medium">No tasks found.</div>
        ) : (
          <ul className="divide-y divide-surface-container">
            {displayTasks.map(task => (
              <li key={task.id} className="p-4 hover:bg-surface-container-low rounded-xl transition flex items-center justify-between group cursor-pointer" onClick={() => toggleTask(task.id as string, !!task.completed)}>
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed ? "bg-primary border-primary text-white" : "border-outline-variant/60 bg-surface"}`}>
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-on-surface transition-all ${task.completed ? "line-through text-on-surface-variant" : ""}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-on-surface-variant mt-1 line-clamp-1 pr-4">{task.description}</p>}
                    <p className="text-xs text-on-surface-variant/70 mt-1 font-medium">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                {task.assignedTo && (
                  <div className="text-xs font-semibold px-3 py-1 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                    {profiles.find(p => p.id === task.assignedTo)?.full_name || 'Assigned'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6">
            <h3 className="font-display text-2xl font-bold text-on-surface">New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
                  placeholder="e.g., Call supplier"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Description</label>
                <textarea 
                  value={newTaskDescription} 
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm resize-none" 
                  placeholder="Task details..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Assign to Team Member</label>
                <select 
                  value={newTaskAssignee} 
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="">Select teammate...</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id === currentUserId ? `${p.full_name} (You)` : p.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/15">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTask}
                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
