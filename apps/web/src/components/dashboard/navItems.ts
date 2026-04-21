import {
  Calendar as CalendarIcon,
  Briefcase as BriefcaseIcon,
  ClipboardList as ClipboardListIcon,
  FileText as FileTextIcon,
  Info as InfoIcon,
} from "lucide-react";

export const navItems = [
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/events", label: "Events", icon: BriefcaseIcon },
  { href: "/tasks", label: "Tasks", icon: ClipboardListIcon },
  { href: "/documents", label: "Docs", icon: FileTextIcon },
  { href: "/form-info", label: "Info", icon: InfoIcon },
];
