"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Users, ClipboardCheck, CalendarClock, XCircle, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { SkeletonStatCards } from "@/components/dashboard/DashboardSkeletons";

type DashboardStats = {
  totalStudents: number;
  totalMentors: number;
  pendingApplications: number;
  activeMentors: number;
  upcomingBookings: number;
  totalBookings: number;
  cancelledBookings: number;
  recentSignups: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Overview"
        description="A snapshot of what's happening across the platform right now."
        action={
          stats && stats.pendingApplications > 0 ? (
            <Button href="/admin/mentor-applications" variant="primary-lime" size="sm">
              Review {stats.pendingApplications} pending application{stats.pendingApplications === 1 ? "" : "s"}
            </Button>
          ) : null
        }
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} value={stats.totalStudents} label="Total students" />
          <StatCard icon={GraduationCap} value={stats.totalMentors} label="Total mentors" hint={`${stats.activeMentors} active`} />
          <StatCard icon={ClipboardCheck} value={stats.pendingApplications} label="Pending mentor applications" />
          <StatCard icon={UserPlus} value={stats.recentSignups} label="New signups (7d)" />
          <StatCard icon={CalendarClock} value={stats.upcomingBookings} label="Upcoming sessions (7d)" />
          <StatCard icon={CalendarClock} value={stats.totalBookings} label="Total bookings" />
          <StatCard icon={XCircle} value={stats.cancelledBookings} label="Cancelled bookings" />
        </div>
      ) : (
        <SkeletonStatCards count={7} />
      )}
    </div>
  );
}
