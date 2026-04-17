"use client";
import React, { useState } from "react";

type Task = { id: number; title: string; description?: string; status: string; due: string; type: "my_tasks" | "assigned"; assignee?: string };

const initialTasks: Task[] = [
  { id: 1, title: "Review EOI for Fremantle Festival", description: "Read through the initial proposition sent via email.", status: "pending", due: "2026-04-10T00:00:00Z", type: "my_tasks" },
  { id: 2, title: "Finalize Perth Royal Show marquee size", description: "Need to measure the allocated spot and compare with 3x3m and 6x3m quotes.", status: "in_progress", due: "2026-04-15T00:00:00Z", type: "my_tasks" },
  { id: 3, title: "Update menu for Spring Carnival", description: "Remove hot soups.", status: "completed", due: "2026-03-20T00:00:00Z", type: "my_tasks" },
  { id: 4, title: "Send invoice to City Night Market", description: "", status: "pending", due: "2026-04-12T00:00:00Z", type: "assigned", assignee: "Sarah" },
  { id: 5, title: "Gather permit docs", description: "", status: "completed", due: "2026-04-01T00:00:00Z", type: "assigned", assignee: "Mike" },
  { id: 6, title: "Call supplier about napkins", description: "Ask for backorder ETA.", status: "pending", due: "2026-04-14T00:00:00Z", type: "assigned", assignee: "John" }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<"assigned" | "my_tasks">("my_tasks");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  const displayTasks = tasks.filter(t => t.type === activeTab);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: "pending",
      due: new Date().toISOString(),
      type: activeTab,
      assignee: newTaskAssignee || (activeTab === "assigned" ? "Unassigned" : "Self")
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold text-on-surface">Tasks</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
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
          Assigned Tasks
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden p-2">
        {displayTasks.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">No tasks found.</div>
        ) : (
          <ul className="divide-y divide-surface-container">
            {displayTasks.map(task => (
              <li key={task.id} className="p-4 hover:bg-surface-container-low rounded-xl transition flex items-center justify-between group cursor-pointer" onClick={() => toggleTask(task.id)}>
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === "completed" ? "bg-primary border-primary text-white" : "border-outline-variant/60 bg-surface"}`}>
                    {task.status === "completed" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-on-surface transition-all ${task.status === "completed" ? "line-through text-on-surface-variant" : ""}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-on-surface-variant mt-1 line-clamp-1 pr-4">{task.description}</p>}
                    <p className="text-xs text-on-surface-variant/70 mt-1 font-medium">Due: {new Date(task.due).toLocaleDateString()}</p>
                  </div>
                </div>
                {(task.assignee) && (
                  <div className="text-xs font-semibold px-3 py-1 bg-primary-container text-on-primary-container rounded-lg shrink-0">
                    {task.assignee}
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
                <label className="block text-xs font-semibold uppercase text-on-surface-variant mb-1">Assignee</label>
                <input 
                  type="text" 
                  value={newTaskAssignee} 
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" 
                  placeholder="e.g., Sarah (Optional)"
                />
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
