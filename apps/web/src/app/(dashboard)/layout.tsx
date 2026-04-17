"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="font-display text-2xl font-bold text-primary">Food Club</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/calendar" className={`block px-4 py-2 rounded-xl font-medium transition-colors ${pathname.startsWith('/calendar') ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}>Calendar</Link>
          <Link href="/events" className={`block px-4 py-2 rounded-xl font-medium transition-colors ${pathname.startsWith('/events') ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}>Events</Link>
          <Link href="/tasks" className={`block px-4 py-2 rounded-xl font-medium transition-colors ${pathname.startsWith('/tasks') ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}>Tasks</Link>
          <Link href="/documents" className={`block px-4 py-2 rounded-xl font-medium transition-colors ${pathname.startsWith('/documents') ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}>Documents</Link>
          <Link href="/form-info" className={`block px-4 py-2 rounded-xl font-medium transition-colors ${pathname.startsWith('/form-info') ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container text-on-surface'}`}>Form Info</Link>
        </nav>
        
        <div className="p-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold">
              FC
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Coordinator</p>
              <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary">Logout</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/15">
          <h1 className="font-display text-xl font-bold text-primary">Food Club</h1>
          <Link href="/calendar" className="text-sm font-medium">Menu</Link>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
