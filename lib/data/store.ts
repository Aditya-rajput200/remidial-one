import type { MentorData, StudentData } from "@/lib/data/types";

const STUDENT_KEY = "r1_data_student";
const MENTOR_KEY = "r1_data_mentor";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadStudentData(): StudentData | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_KEY);
    return raw ? (JSON.parse(raw) as StudentData) : null;
  } catch {
    return null;
  }
}

export function saveStudentData(data: StudentData) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STUDENT_KEY, JSON.stringify(data));
}

export function loadMentorData(): MentorData | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(MENTOR_KEY);
    return raw ? (JSON.parse(raw) as MentorData) : null;
  } catch {
    return null;
  }
}

export function saveMentorData(data: MentorData) {
  if (!isBrowser()) return;
  window.localStorage.setItem(MENTOR_KEY, JSON.stringify(data));
}
