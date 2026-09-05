import {
  LayoutDashboard,
  BookOpen,
  UsersRound,
  CalendarClock,
  Calendar,
  LineChart,
  FolderOpen,
  MessageSquare,
  UserRound,
  GraduationCap,
  Wallet,
  Settings,
  ShieldCheck,
  ListChecks,
  Newspaper,
  Inbox,
  UserCog,
  UserPlus,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const studentNav: DashboardNavItem[] = [
  { label: "Overview", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/student/learning", icon: BookOpen },
  { label: "Mentors", href: "/student/mentors", icon: UsersRound },
  { label: "Assessments", href: "/student/assessments", icon: ListChecks },
  { label: "Sessions", href: "/student/sessions", icon: CalendarClock },
  { label: "Calendar", href: "/student/calendar", icon: Calendar },
  { label: "Progress", href: "/student/progress", icon: LineChart },
  { label: "Resources", href: "/student/resources", icon: FolderOpen },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Profile", href: "/student/profile", icon: UserRound },
];

export const mentorNav: DashboardNavItem[] = [
  { label: "Overview", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/mentor/profile", icon: GraduationCap },
  { label: "Students", href: "/mentor/students", icon: UsersRound },
  { label: "Assessments", href: "/mentor/assessments", icon: ListChecks },
  { label: "Sessions", href: "/mentor/sessions", icon: CalendarClock },
  { label: "Calendar", href: "/mentor/calendar", icon: Calendar },
  { label: "Resources", href: "/mentor/resources", icon: FolderOpen },
  { label: "Messages", href: "/mentor/messages", icon: MessageSquare },
  { label: "Earnings", href: "/mentor/earnings", icon: Wallet },
  { label: "Settings", href: "/mentor/settings", icon: Settings },
];

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Mentors", href: "/admin/mentors", icon: GraduationCap },
  { label: "Students", href: "/admin/students", icon: UsersRound },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Audit Log", href: "/admin/audit", icon: ShieldCheck },
  { label: "Assessments", href: "/admin/assessments", icon: ListChecks },
  // Appended, not inserted — adminBottomNav below indexes into this array
  // directly, so new entries go at the end to avoid shifting those lookups.
  { label: "Users & Roles", href: "/admin/users", icon: UserCog },
  { label: "Teacher Leads", href: "/admin/teacher-leads", icon: UserPlus },
  { label: "Teacher Onboarding", href: "/admin/teacher-onboarding", icon: Workflow },
];

export const adminBottomNav: DashboardNavItem[] = [
  adminNav[0],
  adminNav[1],
  adminNav[2],
  adminNav[3],
];

// Mobile bottom nav shows a compact subset; the rest live in the drawer.
// Indices below are Overview / Sessions / Calendar / Resources — kept as
// direct index lookups (not label search) to match the rest of this file;
// re-check these whenever studentNav's order changes.
export const studentBottomNav: DashboardNavItem[] = [
  studentNav[0],
  studentNav[4],
  studentNav[5],
  studentNav[7],
];

// Indices below are Overview / Sessions / Resources / Calendar.
export const mentorBottomNav: DashboardNavItem[] = [
  mentorNav[0],
  mentorNav[4],
  mentorNav[6],
  mentorNav[5],
];
