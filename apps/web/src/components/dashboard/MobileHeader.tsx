"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MobileHeader() {
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        setInitials(getInitials(name));
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <h1 className="font-display text-xl font-bold text-primary">Food Club</h1>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/20">
        {initials || ".."}
      </div>
    </header>
  );
}
