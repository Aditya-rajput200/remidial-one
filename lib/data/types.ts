export type SessionStatus = "upcoming" | "completed" | "cancelled";

export type DashboardSession = {
  id: string;
  counterpartId: string;
  counterpartName: string;
  subjectSlug: string;
  subjectName: string;
  classBandName: string;
  date: string; // ISO date string
  durationMinutes: number;
  status: SessionStatus;
  notes: string;
  isDemo?: true;
};

export type Message = {
  id: string;
  threadId: string;
  counterpartName: string;
  senderRole: "student" | "mentor" | "self";
  text: string;
  timestamp: string; // ISO
};

export type Resource = {
  id: string;
  title: string;
  type: "video" | "note" | "assignment";
  subjectName: string;
  addedAt: string;
};

export type ProgressEntry = {
  subjectSlug: string;
  subjectName: string;
  sessionsCompleted: number;
  lastFeedback: string;
};

export type AvailabilitySlot = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startHour: number; // 24h
  endHour: number;
};

export type StudentProfile = {
  name: string;
  email: string;
  grade: string;
  subjectsOfInterest: string[];
  learningGoals: string;
  preferredTime: string;
};

export type MentorProfile = {
  name: string;
  email: string;
  bio: string;
  qualifications: string;
  subjects: { slug: string; name: string }[];
  grades: { slug: string; name: string }[];
  languages: string;
  teachingStyle: string;
};

export type StudentData = {
  profile: StudentProfile;
  sessions: DashboardSession[];
  messages: Message[];
  resources: Resource[];
  progress: ProgressEntry[];
};

export type MentorData = {
  profile: MentorProfile;
  sessions: DashboardSession[];
  messages: Message[];
  resources: Resource[];
  availability: AvailabilitySlot[];
};

export const DEMO_MENTOR = {
  id: "demo-mentor-1",
  name: "Demo Mentor",
  role: "Mathematics Mentor",
};

export const DEMO_STUDENT = {
  id: "demo-student-1",
  name: "Demo Student",
  grade: "Class 10",
};
