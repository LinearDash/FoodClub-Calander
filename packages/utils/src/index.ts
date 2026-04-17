import type { EventStatus, EventPriority } from "@foodclub/types";

export function getStatusColour(status: EventStatus): string {
  switch (status) {
    case "not_applied":
      return "bg-slate-200 text-slate-700";
    case "eoi_sent":
      return "bg-amber-400 text-amber-900";
    case "form_filled":
      return "bg-blue-500 text-white";
    case "unsuccessful":
      return "bg-red-500 text-white";
    case "confirmed":
      return "bg-emerald-500 text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

export function getPriorityLabel(priority: EventPriority): string {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "";
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
