export type EventStatus = 
  | "not_applied"
  | "form_filled"
  | "unsuccessful"
  | "eoi_sent"
  | "confirmed";

export type EventPriority = "high" | "medium" | "low";

export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  location: string;
  contactName: string;
  contactDetails: string;
  priority: EventPriority;
  status: EventStatus;
  followUpDate: string; // ISO date string or empty string
  applicationFormReleaseDateType?: "month" | "range"; // selection mode
  applicationFormReleaseDate?: string;    // YYYY-MM when type is "month"
  applicationFormReleaseDateEnd?: string; // YYYY-MM-DD end date when type is "range"
  notes: string;
  isTBA: boolean;
  assignedTo: string;
  documents: string[]; // URLs or file names
  tasks: Task[];
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
