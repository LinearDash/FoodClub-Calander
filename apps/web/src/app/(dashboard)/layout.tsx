"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileHeader from "@/components/dashboard/MobileHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-surface relative">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0 min-w-0">
        <MobileHeader />

        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>

        <MobileBottomNav />
      </main>
    </div>
  );
}
