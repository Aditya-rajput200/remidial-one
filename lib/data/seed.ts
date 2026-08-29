import { subjects } from "@/lib/content/subjects";
import type { Session as AuthSession } from "@/lib/auth/session";
import {
  DEMO_MENTOR,
  DEMO_STUDENT,
  type DashboardSession,
  type Message,
  type MentorData,
  type Resource,
  type StudentData,
} from "@/lib/data/types";

function daysFromNow(days: number, hour = 16) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function subjectByName(name: string) {
  return subjects.find((subject) => subject.name === name) ?? subjects[0];
}

export function seedStudentData(session: AuthSession): StudentData {
  const math = subjectByName("Mathematics");
  const physics = subjectByName("Physics");
  const comms = subjectByName("Communication Skills");

  const sessions: DashboardSession[] = [
    {
      id: "s-1",
      counterpartId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      subjectSlug: math.slug,
      subjectName: math.name,
      classBandName: "Classes 9–10",
      date: daysFromNow(2, 17),
      durationMinutes: 45,
      status: "upcoming",
      notes: "Continue quadratic equations — bring last week's practice sheet.",
      isDemo: true,
    },
    {
      id: "s-2",
      counterpartId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      subjectSlug: physics.slug,
      subjectName: physics.name,
      classBandName: "Classes 9–10",
      date: daysFromNow(-3, 17),
      durationMinutes: 45,
      status: "completed",
      notes: "Covered Newton's laws with worked examples. Good progress on numericals.",
      isDemo: true,
    },
    {
      id: "s-3",
      counterpartId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      subjectSlug: comms.slug,
      subjectName: comms.name,
      classBandName: "Classes 9–10",
      date: daysFromNow(-9, 16),
      durationMinutes: 30,
      status: "completed",
      notes: "Practiced structured self-introductions. Noticeably more confident.",
      isDemo: true,
    },
    {
      id: "s-4",
      counterpartId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      subjectSlug: math.slug,
      subjectName: math.name,
      classBandName: "Classes 9–10",
      date: daysFromNow(-1, 18),
      durationMinutes: 45,
      status: "cancelled",
      notes: "Rescheduled due to a timing conflict.",
      isDemo: true,
    },
  ];

  const messages: Message[] = [
    {
      id: "m-1",
      threadId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      senderRole: "mentor",
      text: "Hi! Looking forward to our session — please review chapter 4 before we meet.",
      timestamp: daysFromNow(-4, 10),
    },
    {
      id: "m-2",
      threadId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      senderRole: "self",
      text: "Sounds good, I'll go through it tonight.",
      timestamp: daysFromNow(-4, 10.5),
    },
    {
      id: "m-3",
      threadId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      senderRole: "mentor",
      text: "Great session today. I've added a couple of extra practice problems to your resources.",
      timestamp: daysFromNow(-3, 18),
    },
  ];

  const resources: Resource[] = [
    { id: "r-1", title: "Quadratic Equations — Practice Set", type: "assignment", subjectName: math.name, addedAt: daysFromNow(-3) },
    { id: "r-2", title: "Newton's Laws — Summary Notes", type: "note", subjectName: physics.name, addedAt: daysFromNow(-3) },
    { id: "r-3", title: "Self-Introduction Framework", type: "note", subjectName: comms.name, addedAt: daysFromNow(-9) },
  ];

  return {
    profile: {
      name: session.name,
      email: session.email,
      avatarUrl: null,
      grade: "Class 10",
      subjectsOfInterest: [math.slug, physics.slug, comms.slug],
      learningGoals: "Build stronger fundamentals in math and physics ahead of board exams.",
      preferredTime: "Weekday evenings",
    },
    sessions,
    messages,
    resources,
    progress: [
      { subjectSlug: math.slug, subjectName: math.name, sessionsCompleted: 6, lastFeedback: "Confident with algebra, working on geometry proofs." },
      { subjectSlug: physics.slug, subjectName: physics.name, sessionsCompleted: 4, lastFeedback: "Strong grasp of mechanics fundamentals." },
      { subjectSlug: comms.slug, subjectName: comms.name, sessionsCompleted: 3, lastFeedback: "Noticeably more confident in structured speaking." },
    ],
  };
}

export function seedMentorData(session: AuthSession): MentorData {
  const math = subjectByName("Mathematics");
  const physics = subjectByName("Physics");

  const sessions: DashboardSession[] = [
    {
      id: "ms-1",
      counterpartId: DEMO_STUDENT.id,
      counterpartName: DEMO_STUDENT.name,
      subjectSlug: math.slug,
      subjectName: math.name,
      classBandName: DEMO_STUDENT.grade,
      date: daysFromNow(1, 17),
      durationMinutes: 45,
      status: "upcoming",
      notes: "Focus on quadratic equations — student requested extra practice.",
      isDemo: true,
    },
    {
      id: "ms-2",
      counterpartId: DEMO_STUDENT.id,
      counterpartName: DEMO_STUDENT.name,
      subjectSlug: physics.slug,
      subjectName: physics.name,
      classBandName: DEMO_STUDENT.grade,
      date: daysFromNow(-2, 17),
      durationMinutes: 45,
      status: "completed",
      notes: "Covered Newton's laws. Student handled numericals well.",
      isDemo: true,
    },
    {
      id: "ms-3",
      counterpartId: DEMO_STUDENT.id,
      counterpartName: DEMO_STUDENT.name,
      subjectSlug: math.slug,
      subjectName: math.name,
      classBandName: DEMO_STUDENT.grade,
      date: daysFromNow(-8, 16),
      durationMinutes: 45,
      status: "completed",
      notes: "Introduced quadratic equations from first principles.",
      isDemo: true,
    },
  ];

  const messages: Message[] = [
    {
      id: "mm-1",
      threadId: DEMO_STUDENT.id,
      counterpartName: DEMO_STUDENT.name,
      senderRole: "student",
      text: "Hi! Could we go over quadratic equations again in the next session?",
      timestamp: daysFromNow(-1, 12),
    },
    {
      id: "mm-2",
      threadId: DEMO_STUDENT.id,
      counterpartName: DEMO_STUDENT.name,
      senderRole: "self",
      text: "Of course — I'll prepare a few extra practice problems for us.",
      timestamp: daysFromNow(-1, 12.5),
    },
  ];

  const resources: Resource[] = [
    { id: "mr-1", title: "Quadratic Equations — Practice Set", type: "assignment", subjectName: math.name, addedAt: daysFromNow(-2) },
    { id: "mr-2", title: "Newton's Laws — Summary Notes", type: "note", subjectName: physics.name, addedAt: daysFromNow(-2) },
  ];

  return {
    profile: {
      name: session.name,
      email: session.email,
      avatarUrl: null,
      bio: "Passionate about helping students build genuine understanding, not just exam scores.",
      qualifications: "M.Sc. Mathematics",
      subjects: [
        { slug: math.slug, name: math.name },
        { slug: physics.slug, name: physics.name },
      ],
      grades: [
        { slug: "classes-9-10", name: "Classes 9–10" },
        { slug: "classes-11-12", name: "Classes 11–12" },
      ],
      languages: "English, Hindi",
      teachingStyle: "Concept-first, example-driven, with regular practice checkpoints.",
    },
    sessions,
    messages,
    resources,
    availability: [
      { day: "Mon", startHour: 16, endHour: 19 },
      { day: "Wed", startHour: 16, endHour: 19 },
      { day: "Fri", startHour: 15, endHour: 18 },
    ],
  };
}
