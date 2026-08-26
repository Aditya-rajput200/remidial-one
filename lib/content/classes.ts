export type ClassBand = {
  slug: string;
  name: string;
  range: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  subjectSlugs: string[];
};

export const classBands: ClassBand[] = [
  {
    slug: "classes-5-8",
    name: "Classes 5–8",
    range: "5–8",
    tagline: "Foundation learning",
    description:
      "The years where curiosity and confidence get built. Sessions focus on strong fundamentals, clear concepts, and a genuine comfort with learning — the base everything later depends on.",
    focusAreas: [
      "Building strong fundamentals across core subjects",
      "Developing study habits and confidence",
      "Making concepts stick through explanation, not memorization",
    ],
    subjectSlugs: ["mathematics", "english", "social-science", "communication-skills"],
  },
  {
    slug: "classes-9-10",
    name: "Classes 9–10",
    range: "9–10",
    tagline: "Concept building + academic support",
    description:
      "Where academic pressure starts to rise. Mentors help close gaps early, build genuine subject clarity, and prepare students for board-level expectations without losing understanding to memorization.",
    focusAreas: [
      "Deeper concept building across science and math",
      "Structured board-exam preparation",
      "Consistent academic support through the year",
    ],
    subjectSlugs: [
      "physics",
      "chemistry",
      "mathematics",
      "biology",
      "english",
      "social-science",
      "computer-science",
    ],
  },
  {
    slug: "classes-11-12",
    name: "Classes 11–12",
    range: "11–12",
    tagline: "Advanced subject learning + exam preparation",
    description:
      "Higher stakes, harder concepts, and real decisions ahead. Sessions focus on advanced subject mastery, exam strategy, and the sustained mentorship needed to get through two of the most demanding academic years.",
    focusAreas: [
      "Advanced, exam-focused subject mastery",
      "Structured preparation for board and competitive exams",
      "Consistent mentorship through a high-pressure stretch",
    ],
    subjectSlugs: ["physics", "chemistry", "mathematics", "biology", "computer-science"],
  },
];

export function getClassBandBySlug(slug: string) {
  return classBands.find((band) => band.slug === slug);
}
