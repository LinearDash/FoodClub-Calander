"use client";
import React, { useState, useEffect, useMemo } from "react";

import { 
  getGlobalTasks, 
  getProfiles, 
  updateTaskStatus, 
  addStandaloneTask, 
  getTaskComments, 
  addTaskComment, 
  deleteTask,
  syncUserProfile
} from "../events/actions";
import { Task, TaskComment } from "@foodclub/types";
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
  const [showCompleted, setShowCompleted] = useState(false);
  
  // New Task Modal State
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    // Move sync to background or do it once
    syncUserProfile(); 
    
    const [tasksData, profilesData] = await Promise.all([
      getGlobalTasks(),
      getProfiles()
    ]);
    
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

  const { activeTasks, completedTasks } = useMemo(() => {
    if (!currentUserId) return { activeTasks: [], completedTasks: [] };
    
    let filtered = tasks;
    if (activeTab === "my_tasks") {
      filtered = tasks.filter(t => t.assignedTo === currentUserId);
    } else if (activeTab === "assigned") {
      filtered = tasks.filter(t => t.assignedTo !== currentUserId);
    }
    
    return {
      activeTasks: filtered.filter(t => !t.completed),
      completedTasks: filtered.filter(t => t.completed)
    };
  }, [tasks, activeTab, currentUserId]);

  const toggleTask = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent opening modal when clicking checkbox
    
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    
    try {
      await updateTaskStatus(id, !currentStatus);
      // Soft refresh in background
      const tasksData = await getGlobalTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to update task:', error);
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
    setIsNewTaskModalOpen(false);
    loadData();
  };

  const handleOpenTask = async (task: Task) => {
    setSelectedTask(task);
    setIsCommentsLoading(true);
    const taskComments = await getTaskComments(task.id);
    setComments(taskComments);
    setIsCommentsLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    
    const res = await addTaskComment(selectedTask.id, newComment);
    if (res.data) {
      setComments(prev => [...prev, res.data as TaskComment]);
      setNewComment("");
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask || !window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(selectedTask.id);
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-32 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">Tasks</h1>
        <button 
          onClick={() => {
            setNewTaskAssignee(currentUserId || "");
            setIsNewTaskModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md shadow-primary/20 w-full md:w-auto active:scale-95"
        >
          + New Task
        </button>
      </div>

      <div className="flex items-center gap-2 bg-surface-container-low p-1.5 md:p-1 rounded-2xl w-full md:w-max border border-surface-container overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab("my_tasks")}
          className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition flex-1 md:flex-none whitespace-nowrap ${activeTab === "my_tasks" ? "bg-surface shadow-sm text-on-surface border border-outline-variant/10" : "text-on-surface-variant/60 hover:text-on-surface"}`}
        >
          My Tasks
        </button>
        <button 
          onClick={() => setActiveTab("assigned")}
          className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition flex-1 md:flex-none whitespace-nowrap ${activeTab === "assigned" ? "bg-surface shadow-sm text-on-surface border border-outline-variant/10" : "text-on-surface-variant/60 hover:text-on-surface"}`}
        >
          Team Tasks
        </button>
        <button 
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition flex-1 md:flex-none whitespace-nowrap ${activeTab === "all" ? "bg-surface shadow-sm text-on-surface border border-outline-variant/10" : "text-on-surface-variant/60 hover:text-on-surface"}`}
        >
          All Tasks
        </button>
      </div>

      <div className="space-y-6">
        {/* Active Tasks */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden p-1.5 md:p-2">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant animate-pulse font-black uppercase tracking-[0.2em] opacity-20">Loading...</div>
          ) : activeTasks.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant/40 font-medium italic">No active tasks found.</div>
          ) : (
            <ul className="divide-y divide-surface-container">
              {activeTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  profiles={profiles} 
                  onToggle={toggleTask} 
                  onClick={() => handleOpenTask(task)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Completed Tasks Toggle */}
        {!loading && completedTasks.length > 0 && (
          <div className="space-y-4">
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 hover:text-on-surface transition px-4 py-2 bg-surface-container-low rounded-xl"
            >
              <svg 
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${showCompleted ? "rotate-90" : ""}`}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              {showCompleted ? "Hide" : "Show"} Completed ({completedTasks.length})
            </button>

            {showCompleted && (
              <div className="bg-surface-container-lowest/50 rounded-3xl shadow-sm border border-surface-container/30 overflow-hidden p-1.5 md:p-2 opacity-70">
                <ul className="divide-y divide-surface-container/50">
                  {completedTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      profiles={profiles} 
                      onToggle={toggleTask} 
                      onClick={() => handleOpenTask(task)}
                      dimmed
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity" onClick={() => setIsNewTaskModalOpen(false)} />
          <div className="bg-surface-container-lowest sm:rounded-3xl shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-md z-10 p-6 flex flex-col gap-6 h-[70vh] sm:h-auto overflow-y-auto rounded-t-[2.5rem] animate-in slide-in-from-bottom duration-300">
            <h3 className="font-display text-2xl font-black text-on-surface">New Task</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-2 px-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-outline-variant/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-sm" 
                  placeholder="e.g., Call supplier"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-2 px-1">Description</label>
                <textarea 
                  value={newTaskDescription} 
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-outline-variant/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-none text-sm" 
                  placeholder="Task details..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-2 px-1">Assign to Team Member</label>
                <select 
                  value={newTaskAssignee} 
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface border border-outline-variant/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-bold text-sm"
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
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/5">
              <button 
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTask}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:opacity-90 transition shadow-lg shadow-primary/30"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTask(null)} />
          <div className="bg-surface-container-lowest sm:rounded-[2.5rem] shadow-[0_20px_40px_rgba(29,28,24,0.12)] w-full max-w-2xl z-10 flex flex-col h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-hidden rounded-t-[3rem] animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-outline-variant/5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div 
                    onClick={(e) => toggleTask(selectedTask.id, selectedTask.completed, e)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm ${selectedTask.completed ? "bg-primary border-primary text-white" : "border-outline-variant bg-surface hover:border-primary"}`}
                  >
                    {selectedTask.completed && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <h3 className={`font-display text-2xl md:text-3xl font-black text-on-surface leading-tight ${selectedTask.completed ? "line-through text-on-surface-variant/40" : ""}`}>
                    {selectedTask.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ml-11">
                  <p className="text-xs font-bold text-on-surface-variant/60">
                    Assigned to <span className="text-on-surface font-black uppercase tracking-wider">{profiles.find(p => p.id === selectedTask.assignedTo)?.full_name || "Unknown"}</span>
                  </p>
                  {selectedTask.dueDate && (
                    <p className="text-xs font-bold text-on-surface-variant/60 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      Due {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDeleteTask}
                  className="p-2.5 text-on-surface-variant/40 hover:text-red-500 transition rounded-2xl hover:bg-red-50 flex-shrink-0"
                  title="Delete Task"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <button onClick={() => setSelectedTask(null)} className="p-2.5 text-on-surface-variant/40 hover:text-on-surface transition rounded-2xl hover:bg-surface-container flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 px-1">Description</h4>
                <div className="bg-surface-container-low/50 rounded-[1.5rem] p-5 md:p-6 border border-outline-variant/10">
                  <p className="text-on-surface leading-relaxed whitespace-pre-wrap text-[15px] selection:bg-primary/20">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Comments</h4>
                  <span className="text-[10px] font-black bg-surface-container-high px-2 py-0.5 rounded-lg text-on-surface-variant/60">{comments.length}</span>
                </div>
                
                <div className="space-y-6">
                  {isCommentsLoading ? (
                    <div className="py-12 text-center text-on-surface-variant/30 animate-pulse font-black uppercase tracking-widest text-[10px]">Loading...</div>
                  ) : comments.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant/40 font-medium italic bg-surface-container-low/30 rounded-[1.5rem] border-2 border-dashed border-outline-variant/10">
                      No comments yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                            {profiles.find(p => p.id === comment.userId)?.full_name?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-on-surface">
                                {profiles.find(p => p.id === comment.userId)?.full_name || "Unknown"}
                              </span>
                              <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none text-sm text-on-surface leading-relaxed border border-outline-variant/5">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="pt-6 border-t border-outline-variant/5 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-primary/20">
                    {profiles.find(p => p.id === currentUserId)?.full_name?.charAt(0) || "Y"}
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full pl-5 pr-14 py-4 rounded-[1.5rem] bg-surface-container border border-outline-variant/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-none text-[15px] transition-all"
                    />
                    <button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="absolute right-3 top-3 w-10 h-10 bg-primary text-white rounded-[1rem] hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale active:scale-90 flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ 
  task, 
  profiles, 
  onToggle, 
  onClick,
  dimmed = false
}: { 
  task: Task, 
  profiles: Profile[], 
  onToggle: (id: string, current: boolean, e: React.MouseEvent) => void,
  onClick: () => void,
  dimmed?: boolean
}) {
  return (
    <li 
      onClick={onClick}
      className={`p-4 hover:bg-surface-container-low rounded-xl transition flex items-center justify-between group cursor-pointer ${dimmed ? "opacity-60 grayscale-[0.5]" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div 
          onClick={(e) => onToggle(task.id as string, !!task.completed, e)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${task.completed ? "bg-primary border-primary text-white" : "border-outline-variant/60 bg-surface group-hover:border-primary/50"}`}
        >
          {task.completed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          )}
        </div>
        <div>
          <p className={`font-semibold text-on-surface transition-all ${task.completed ? "line-through text-on-surface-variant font-medium" : ""}`}>{task.title}</p>
          {task.description && <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1 pr-4">{task.description}</p>}
          <p className="text-[10px] text-on-surface-variant/70 mt-1 font-bold uppercase tracking-wider">
            Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {task.assignedTo && (
          <div className="text-[10px] font-bold px-3 py-1 bg-primary-container text-on-primary-container rounded-lg uppercase tracking-tight">
            {profiles.find(p => p.id === task.assignedTo)?.full_name || 'Assigned'}
          </div>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/40 p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </li>
  );
}
