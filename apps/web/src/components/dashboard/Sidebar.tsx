"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { navItems } from "@/components/dashboard/navItems";
import { createClient } from "@/utils/supabase/client";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Fetch from profiles table where the real name lives
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const name =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User";
        setUserName(name);
        setInitials(getInitials(name));
      }
    };
    fetchUser();
  }, []);

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant/15 flex flex-col md:flex h-screen sticky top-0">
      <div className="p-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Food Club
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              pathname.startsWith(item.href)
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                : "hover:bg-surface-container text-on-surface"
            }`}
          >
            <item.icon
              size={20}
              strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold shadow-sm">
            {initials || ".."}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">
              {userName || "Loading..."}
            </p>
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
  );
}
