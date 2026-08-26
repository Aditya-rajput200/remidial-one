export type IconKey =
  | "atom"
  | "flask-conical"
  | "sigma"
  | "dna"
  | "book-open"
  | "code-2"
  | "globe-2"
  | "message-circle";

export type Subject = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: IconKey;
  classesCovered: string[];
  whatYouLearn: string[];
  outcomes: string[];
};

export const subjects: Subject[] = [
  {
    slug: "physics",
    name: "Physics",
    shortDescription:
      "Build intuition for how the physical world works, from mechanics to modern physics.",
    icon: "atom",
    classesCovered: ["Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Core mechanics, motion, and forces",
      "Electricity, magnetism, and circuits",
      "Waves, optics, and modern physics",
      "Problem-solving for board and competitive exams",
    ],
    outcomes: [
      "Stronger conceptual clarity, not just formula memorization",
      "Confidence tackling numerical and application-based problems",
      "A mentor who adapts pace to how you actually learn physics",
    ],
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    shortDescription:
      "Connect the logic of atoms, reactions, and formulas to real understanding.",
    icon: "flask-conical",
    classesCovered: ["Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Atomic structure and periodic trends",
      "Chemical bonding and reactions",
      "Organic chemistry fundamentals",
      "Lab-style reasoning and problem-solving",
    ],
    outcomes: [
      "Clear mental models for reactions instead of rote learning",
      "Better accuracy on numericals and structure-based questions",
      "Steady progress tracked session over session",
    ],
  },
  {
    slug: "mathematics",
    name: "Mathematics",
    shortDescription:
      "Move from memorized steps to genuine number sense and problem-solving.",
    icon: "sigma",
    classesCovered: ["Classes 5–8", "Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Foundational arithmetic and algebra",
      "Geometry, trigonometry, and coordinate systems",
      "Calculus fundamentals for senior secondary",
      "Exam-focused practice with step-by-step reasoning",
    ],
    outcomes: [
      "Comfort with multi-step problems, not just formula recall",
      "A pace matched to where you're genuinely stuck",
      "Visible progress across topics over time",
    ],
  },
  {
    slug: "biology",
    name: "Biology",
    shortDescription:
      "Understand living systems through structured, visual, and applied learning.",
    icon: "dna",
    classesCovered: ["Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Cell biology and human physiology",
      "Genetics and evolution",
      "Plant biology and ecology",
      "Diagram-based and application-based exam practice",
    ],
    outcomes: [
      "Clear understanding of processes, not just labeled diagrams",
      "Better retention through structured revision",
      "Mentor feedback tailored to your specific gaps",
    ],
  },
  {
    slug: "english",
    name: "English",
    shortDescription:
      "Strengthen reading, writing, grammar, and expression with focused practice.",
    icon: "book-open",
    classesCovered: ["Classes 5–8", "Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Grammar fundamentals and usage",
      "Reading comprehension and analysis",
      "Essay and creative writing",
      "Communication and vocabulary building",
    ],
    outcomes: [
      "More confident, structured writing",
      "Stronger comprehension and analytical reading",
      "Improved verbal expression, in and out of the classroom",
    ],
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    shortDescription:
      "Learn programming fundamentals and computational thinking, step by step.",
    icon: "code-2",
    classesCovered: ["Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Programming fundamentals and logic building",
      "Data structures and algorithmic thinking",
      "Applied coding practice and projects",
      "Exam-aligned theory and practicals",
    ],
    outcomes: [
      "A genuine grasp of how and why code works",
      "Confidence building and debugging programs independently",
      "A foundation useful well beyond the syllabus",
    ],
  },
  {
    slug: "social-science",
    name: "Social Science",
    shortDescription:
      "Make sense of history, civics, geography, and economics with context.",
    icon: "globe-2",
    classesCovered: ["Classes 5–8", "Classes 9–10"],
    whatYouLearn: [
      "History and civics fundamentals",
      "Geography and map-based learning",
      "Economics basics",
      "Structured answer-writing practice",
    ],
    outcomes: [
      "Better recall through context and storytelling, not rote dates",
      "Clarity connecting concepts across chapters",
      "Confident, structured exam answers",
    ],
  },
  {
    slug: "communication-skills",
    name: "Communication Skills",
    shortDescription:
      "Build the confidence and clarity to express yourself well in any setting.",
    icon: "message-circle",
    classesCovered: ["Classes 5–8", "Classes 9–10", "Classes 11–12"],
    whatYouLearn: [
      "Verbal and non-verbal communication",
      "Public speaking and presentation skills",
      "Active listening and clarity of expression",
      "Interview and conversation confidence",
    ],
    outcomes: [
      "More comfort speaking in group and one-on-one settings",
      "Clearer, more structured expression of ideas",
      "Skills that carry beyond academics",
    ],
  },
];

export function getSubjectBySlug(slug: string) {
  return subjects.find((subject) => subject.slug === slug);
}
