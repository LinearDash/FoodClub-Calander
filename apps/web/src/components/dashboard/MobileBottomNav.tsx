"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/dashboard/navItems";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low border-t border-outline-variant/15 flex items-center justify-around px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] backdrop-blur-md bg-opacity-90">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            pathname.startsWith(item.href)
              ? "text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <item.icon
            size={22}
            strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2}
            className={pathname.startsWith(item.href) ? "scale-110" : ""}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {pathname.startsWith(item.href) && (
            <div className="w-1 h-1 rounded-full bg-primary absolute -bottom-0.5" />
          )}
        </Link>
      ))}
    </nav>
  );
}
