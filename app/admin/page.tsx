"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Users, CalendarClock, XCircle, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SkeletonStatCards } from "@/components/dashboard/DashboardSkeletons";

type DashboardStats = {
  totalStudents: number;
  totalMentors: number;
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
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} value={stats.totalStudents} label="Total students" />
          <StatCard icon={GraduationCap} value={stats.totalMentors} label="Total mentors" hint={`${stats.activeMentors} active`} />
          <StatCard icon={UserPlus} value={stats.recentSignups} label="New signups (7d)" />
          <StatCard icon={CalendarClock} value={stats.upcomingBookings} label="Upcoming sessions (7d)" />
          <StatCard icon={CalendarClock} value={stats.totalBookings} label="Total bookings" />
          <StatCard icon={XCircle} value={stats.cancelledBookings} label="Cancelled bookings" />
        </div>
      ) : (
        <SkeletonStatCards count={6} />
      )}
    </div>
  );
}
