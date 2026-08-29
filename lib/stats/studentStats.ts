export type CompletedSessionInput = {
  id: string;
  date: string; // ISO
  subjectSlug: string;
  subjectName: string;
  mentorRating: number | null; // 1-10
};

export type SubjectScore = {
  subjectSlug: string;
  subjectName: string;
  average: number;
  count: number;
};

export type StudentStats = {
  totalSessions: number;
  ratedSessions: number;
  averageScore: number | null;
  trend: { date: string; rating: number }[];
  bySubject: SubjectScore[];
  distribution: { score: number; count: number }[];
  /** avg of the most recent (up to 3) rated sessions minus avg of the rest — null if not enough data to compare. */
  recentTrendDelta: number | null;
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function computeStudentStats(sessions: CompletedSessionInput[]): StudentStats {
  const rated = sessions
    .filter((s): s is CompletedSessionInput & { mentorRating: number } => s.mentorRating != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const averageScore = rated.length > 0 ? round1(rated.reduce((sum, s) => sum + s.mentorRating, 0) / rated.length) : null;

  const trend = rated.map((s) => ({ date: s.date, rating: s.mentorRating }));

  const bySubjectMap = new Map<string, { subjectName: string; total: number; count: number }>();
  for (const s of rated) {
    const entry = bySubjectMap.get(s.subjectSlug) ?? { subjectName: s.subjectName, total: 0, count: 0 };
    entry.total += s.mentorRating;
    entry.count += 1;
    bySubjectMap.set(s.subjectSlug, entry);
  }
  const bySubject: SubjectScore[] = [...bySubjectMap.entries()]
    .map(([subjectSlug, { subjectName, total, count }]) => ({
      subjectSlug,
      subjectName,
      average: round1(total / count),
      count,
    }))
    .sort((a, b) => b.average - a.average);

  const distribution = Array.from({ length: 10 }, (_, i) => {
    const score = i + 1;
    return { score, count: rated.filter((s) => Math.round(s.mentorRating) === score).length };
  });

  let recentTrendDelta: number | null = null;
  if (rated.length >= 4) {
    const recentCount = Math.min(3, Math.floor(rated.length / 2));
    const recent = rated.slice(-recentCount);
    const earlier = rated.slice(0, rated.length - recentCount);
    const recentAvg = recent.reduce((sum, s) => sum + s.mentorRating, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, s) => sum + s.mentorRating, 0) / earlier.length;
    recentTrendDelta = round1(recentAvg - earlierAvg);
  }

  return {
    totalSessions: sessions.length,
    ratedSessions: rated.length,
    averageScore,
    trend,
    bySubject,
    distribution,
    recentTrendDelta,
  };
}
