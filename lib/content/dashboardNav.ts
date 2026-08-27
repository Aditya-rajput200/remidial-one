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
  ClipboardCheck,
  ShieldCheck,
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
  { label: "Sessions", href: "/mentor/sessions", icon: CalendarClock },
  { label: "Calendar", href: "/mentor/calendar", icon: Calendar },
  { label: "Resources", href: "/mentor/resources", icon: FolderOpen },
  { label: "Messages", href: "/mentor/messages", icon: MessageSquare },
  { label: "Earnings", href: "/mentor/earnings", icon: Wallet },
  { label: "Settings", href: "/mentor/settings", icon: Settings },
];

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Mentor Applications", href: "/admin/mentor-applications", icon: ClipboardCheck },
  { label: "Mentors", href: "/admin/mentors", icon: GraduationCap },
  { label: "Students", href: "/admin/students", icon: UsersRound },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { label: "Audit Log", href: "/admin/audit", icon: ShieldCheck },
];

export const adminBottomNav: DashboardNavItem[] = [
  adminNav[0],
  adminNav[1],
  adminNav[2],
  adminNav[4],
];

// Mobile bottom nav shows a compact subset; the rest live in the drawer.
export const studentBottomNav: DashboardNavItem[] = [
  studentNav[0],
  studentNav[3],
  studentNav[4],
  studentNav[7],
];

export const mentorBottomNav: DashboardNavItem[] = [
  mentorNav[0],
  mentorNav[3],
  mentorNav[6],
  mentorNav[4],
];
