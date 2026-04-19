"use client";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import React from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-surface relative">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6">
          <h1 className="font-display text-2xl font-bold text-primary">Food Club</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname.startsWith(item.href) ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'hover:bg-surface-container text-on-surface'}`}
            >
              <item.icon size={20} strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2} />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold shadow-sm">
              FC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">Coordinator</p>
              <button 
                onClick={async () => await signOut()}
                className="text-xs text-on-surface-variant hover:text-primary transition-colors text-left font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
          <h1 className="font-display text-xl font-bold text-primary">Food Club</h1>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/20">
            FC
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>

        {/* Bottom Navigation - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low border-t border-outline-variant/15 flex items-center justify-around px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] backdrop-blur-md bg-opacity-90">
          {navItems.map(item => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname.startsWith(item.href) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <item.icon size={22} strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2} className={pathname.startsWith(item.href) ? 'scale-110' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {pathname.startsWith(item.href) && <div className="w-1 h-1 rounded-full bg-primary absolute -bottom-0.5" />}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}

const navItems = [
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/events', label: 'Events', icon: BriefcaseIcon },
  { href: '/tasks', label: 'Tasks', icon: ClipboardListIcon },
  { href: '/documents', label: 'Docs', icon: FileTextIcon },
  { href: '/form-info', label: 'Info', icon: InfoIcon },
];

import { 
  Calendar as CalendarIcon, 
  Briefcase as BriefcaseIcon, 
  ClipboardList as ClipboardListIcon, 
  FileText as FileTextIcon, 
  Info as InfoIcon 
} from "lucide-react";
