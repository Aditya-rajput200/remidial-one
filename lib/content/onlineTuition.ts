// Track A of the SEO strategy — the commercial "service" pages that capture
// buying-intent demand and convert it into free-assessment / counselling leads.
// Slugs and target keywords come straight from the Keyword Universe tab of
// RemedialOne_SEO_KeywordMap.xlsx so the URL a page lives at is the exact URL
// the keyword was mapped to. Each entry is intentionally lean: one clear primary
// keyword, an answer-first intro, and a soft path into the /learn engine and the
// booking flow. New subject×grade combos (P2) slot in here later without a new
// route — just add data.

export type ServiceKind = "core" | "subject" | "grade" | "board";

export type ServicePage = {
  slug: string; // path is /online-tuition/{slug}
  kind: ServiceKind;
  /** <h1> / primary on-page heading */
  h1: string;
  /** Short label for nav / homepage explorer chips, e.g. "Maths", "Class 10", "CBSE" */
  navLabel: string;
  /** <title> — leads with the primary keyword, ~55-60 chars once suffixed */
  title: string;
  metaDescription: string;
  /** Primary keyword this URL targets (for internal reference / reporting) */
  primaryKeyword: string;
  /** Answer-first lead paragraph shown above the fold */
  intro: string;
  /** Short USP line under the H1 */
  usp: string;
  /** Bullet list: what these sessions cover */
  covers: string[];
  /** Bullet list: why 1-to-1 wins for this segment */
  whyOneToOne: string[];
  faqs: { question: string; answer: string }[];
  /** Related /learn subject hubs to interlink into the content engine */
  learnSubjects?: string[];
  /** Related service slugs to interlink (sibling pages) */
  related?: string[];
};

const CORE: ServicePage = {
  slug: "", // the /online-tuition index itself
  kind: "core",
  navLabel: "Online Tuition",
  h1: "Online Tuition, One Student at a Time",
  title: "Online Tuition — Personalised 1-to-1 Classes",
  metaDescription:
    "Personalised online tuition for Classes 5–12. Every session is one mentor, one student, paced to a real learning-gap assessment. Book a free assessment today.",
  primaryKeyword: "online tuition",
  intro:
    "Online tuition at Remedial One is one mentor teaching one student — never a batch. Before teaching begins, a topic-level assessment finds the exact gaps a student has, and every session is paced around them. It is the difference between re-teaching a whole subject and fixing the parts that are actually broken.",
  usp: "Assessment-led, 1-to-1, and paced to the student — for Classes 5 to 12, across every core subject and board.",
  covers: [
    "Maths, Physics, Chemistry, Biology, English, Science, Computer Science and Social Science",
    "CBSE, ICSE, IGCSE, IB and State-board syllabi",
    "Classes 5 to 12 — from foundation years to board-exam preparation",
    "A learning-gap assessment before the first session, so time is spent where it counts",
  ],
  whyOneToOne: [
    "No shared pace — the mentor never moves on before the student is ready",
    "The plan is built from an assessment of what the student actually knows, not a fixed syllabus march",
    "Progress is tracked at chapter and topic level, session over session",
    "Sessions are scheduled around the student, and mentors are matched to the subject",
  ],
  faqs: [
    {
      question: "What is online tuition and how does it work at Remedial One?",
      answer:
        "Online tuition is teaching delivered over the internet in live sessions. At Remedial One it is strictly one-to-one: a student is matched with a mentor for a subject, takes a short learning-gap assessment, and then works through a plan built around their specific gaps — one mentor, one student, every session.",
    },
    {
      question: "Which classes and subjects does online tuition cover?",
      answer:
        "Classes 5 to 12, across Maths, Physics, Chemistry, Biology, English, Science, Computer Science and Social Science, for CBSE, ICSE, IGCSE, IB and State boards.",
    },
    {
      question: "How is 1-to-1 online tuition different from group classes?",
      answer:
        "In a group class, one teacher paces the room; a student who is behind stays behind and a student who is ahead is held back. In 1-to-1 tuition the entire session is the student's — the pace, the examples, and the plan all follow them.",
    },
    {
      question: "Is this home tuition or online tuition?",
      answer:
        "It is home tuition delivered online — a personal tutor teaching your child one-to-one from home, over live video, without a tutor having to travel to you. You get the focus of a home tutor with the reach to match your child with the right mentor anywhere.",
    },
    {
      question: "How do I start?",
      answer:
        "Book a free counselling call or start with the learning-gap assessment. Both are free, and neither commits you to anything — they simply tell us (and you) exactly where a student stands.",
    },
  ],
  learnSubjects: ["maths", "physics", "chemistry", "english"],
  related: ["one-to-one", "maths", "class-10", "cbse"],
};

// --- Subject service pages (/online-tuition/{subject}) -----------------------
const SUBJECT_NAV_LABELS: Record<string, string> = {
  maths: "Maths",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  english: "English",
  science: "Science",
  "computer-science": "Computer Science",
  "social-science": "Social Science",
};

const SUBJECT_SEEDS: Omit<ServicePage, "navLabel">[] = [
  {
    slug: "maths",
    kind: "subject",
    h1: "Online Maths Tuition, 1-to-1",
    title: "Online Maths Tuition — 1-to-1 Maths Tutor",
    metaDescription:
      "Online maths tuition with a personal 1-to-1 maths tutor for Classes 5–12. Assessment-led sessions that fix the exact topics a student is stuck on. Book a free assessment.",
    primaryKeyword: "online tuition for maths",
    intro:
      "Online maths tuition works best one-to-one, because maths gaps are specific: a student rarely struggles with 'maths', they struggle with fractions, or quadratics, or coordinate geometry. Our assessment finds the exact topics, and a dedicated maths mentor works through them at the student's pace.",
    usp: "A personal maths tutor who teaches the topics you're stuck on — not the whole syllabus again.",
    covers: [
      "Arithmetic, fractions, ratios and foundational number sense (Classes 5–8)",
      "Algebra, geometry, trigonometry and coordinate geometry (Classes 9–10)",
      "Calculus, functions and exam-focused problem solving (Classes 11–12)",
      "Board and competitive-exam practice with step-by-step reasoning",
    ],
    whyOneToOne: [
      "Maths builds on itself — a mentor can go back and fix the foundation a class would skip",
      "Every worked example is chosen for the topic the student is actually stuck on",
      "No moving on until the method genuinely clicks",
    ],
    faqs: [
      {
        question: "Do you offer online maths tuition for all classes?",
        answer:
          "Yes — Classes 5 through 12, from foundational arithmetic to senior-secondary calculus, across CBSE, ICSE, IGCSE, IB and State boards.",
      },
      {
        question: "Can a maths tutor help with a specific weak topic?",
        answer:
          "That is exactly the model. The learning-gap assessment pinpoints weak topics — say, quadratic equations or trigonometry — and sessions target them directly instead of re-teaching the whole subject.",
      },
      {
        question: "Is it a fixed maths tutor or a different one each time?",
        answer:
          "A student is matched with a mentor and stays with them, so the mentor builds a real picture of how the student learns maths over time.",
      },
    ],
    learnSubjects: ["maths", "conversions"],
    related: ["", "class-10", "physics", "cbse"],
  },
  {
    slug: "physics",
    kind: "subject",
    h1: "Online Physics Tuition, 1-to-1",
    title: "Online Physics Tuition — 1-to-1 Physics Tutor",
    metaDescription:
      "Online physics tuition with a 1-to-1 physics tutor for Classes 9–12. Build real intuition for mechanics, electricity and modern physics. Book a free assessment.",
    primaryKeyword: "online physics tuition",
    intro:
      "Physics rewards intuition over memorised formulas. Online physics tuition at Remedial One is one-to-one, so a mentor can find where the intuition broke — whether that's free-body diagrams, circuits, or the maths underneath — and rebuild it.",
    usp: "A physics mentor who fixes the concept, not just the answer.",
    covers: [
      "Mechanics, motion, forces and energy",
      "Electricity, magnetism and circuits",
      "Waves, optics and modern physics",
      "Numerical problem-solving for board and competitive exams",
    ],
    whyOneToOne: [
      "Physics numericals expose exactly one broken idea at a time — a mentor can chase it down",
      "Concepts are re-derived, not re-stated, until they hold",
      "Pace follows the student's understanding, not a syllabus clock",
    ],
    faqs: [
      {
        question: "Which topics does online physics tuition cover?",
        answer:
          "Mechanics, electricity and magnetism, waves and optics, and modern physics — with a strong focus on numerical problem-solving for boards and entrance exams.",
      },
      {
        question: "Can it help with JEE / NEET physics preparation?",
        answer:
          "Yes. Sessions can be tuned toward competitive-exam problem-solving once board-level concepts are solid.",
      },
    ],
    learnSubjects: ["physics"],
    related: ["", "chemistry", "maths", "class-11"],
  },
  {
    slug: "chemistry",
    kind: "subject",
    h1: "Online Chemistry Tuition, 1-to-1",
    title: "Online Chemistry Tuition — 1-to-1 Chemistry Tutor",
    metaDescription:
      "Online chemistry tuition with a 1-to-1 chemistry tutor for Classes 9–12. Understand reactions, formulas and organic chemistry instead of memorising them. Book a free assessment.",
    primaryKeyword: "online chemistry tuition",
    intro:
      "Chemistry falls apart when it becomes memorisation. Online chemistry tuition here is one-to-one, so a mentor can connect the logic — why a reaction happens, where a formula comes from — instead of asking a student to memorise a list.",
    usp: "A chemistry mentor who makes reactions make sense.",
    covers: [
      "Atomic structure and periodic trends",
      "Chemical bonding and reaction types",
      "Organic chemistry fundamentals",
      "Formula, equation and numerical practice",
    ],
    whyOneToOne: [
      "Reactions are taught as logic, not lists to memorise",
      "A mentor can trace a wrong answer back to the missing concept",
      "Organic chemistry is built up mechanism by mechanism at the student's pace",
    ],
    faqs: [
      {
        question: "Does online chemistry tuition cover organic chemistry?",
        answer:
          "Yes — organic chemistry is one of the areas students most often need 1-to-1 help with, and sessions build it up mechanism by mechanism.",
      },
      {
        question: "Can I get help with chemistry formulas and equations?",
        answer:
          "Absolutely. Sessions can focus on formulas, balancing equations and numericals, and our /learn library covers common ones like the acetone formula in detail.",
      },
    ],
    learnSubjects: ["chemistry"],
    related: ["", "physics", "biology", "class-11"],
  },
  {
    slug: "biology",
    kind: "subject",
    h1: "Online Biology Tuition, 1-to-1",
    title: "Online Biology Tuition — 1-to-1 Biology Tutor",
    metaDescription:
      "Online biology tuition with a 1-to-1 biology tutor for Classes 9–12. Understand living systems, genetics and physiology through structured, visual learning. Book a free assessment.",
    primaryKeyword: "online biology tuition",
    intro:
      "Biology is understood, not just labelled. Online biology tuition at Remedial One is one-to-one, so a mentor can turn diagrams into processes a student can actually explain — from cell biology to human physiology.",
    usp: "A biology mentor who teaches the process behind the diagram.",
    covers: [
      "Cell biology and human physiology",
      "Genetics and evolution",
      "Plant biology and ecology",
      "Diagram- and application-based exam practice",
    ],
    whyOneToOne: [
      "Processes are explained until a student can narrate them, not just label them",
      "Revision is structured around the student's weak chapters",
      "Feedback is specific to the gaps the assessment found",
    ],
    faqs: [
      {
        question: "Which classes does online biology tuition cover?",
        answer:
          "Classes 9 to 12, spanning cell biology, physiology, genetics, evolution, plant biology and ecology.",
      },
      {
        question: "Can it support NEET biology preparation?",
        answer:
          "Yes — once board concepts are secure, sessions can shift toward the application- and recall-heavy style NEET biology demands.",
      },
    ],
    learnSubjects: ["biology"],
    related: ["", "chemistry", "science", "class-11"],
  },
  {
    slug: "english",
    kind: "subject",
    h1: "Online English Tuition, 1-to-1",
    title: "Online English Tuition — 1-to-1 English Tutor",
    metaDescription:
      "Online English tuition with a 1-to-1 English tutor for Classes 5–12. Strengthen grammar, reading, writing and expression with focused, personal practice. Book a free assessment.",
    primaryKeyword: "online english tuition",
    intro:
      "English improves with feedback on a student's own writing and speaking — which a group class can't give. Online English tuition here is one-to-one, so grammar, comprehension and expression are all worked on with the student's actual work in front of the mentor.",
    usp: "An English mentor who reads your writing and coaches your voice.",
    covers: [
      "Grammar fundamentals and usage",
      "Reading comprehension and analysis",
      "Essay, letter and creative writing",
      "Vocabulary and spoken expression",
    ],
    whyOneToOne: [
      "Writing is coached on the student's own drafts, not generic examples",
      "Speaking and confidence get real one-to-one practice",
      "Comprehension is taught with texts pitched at the student's level",
    ],
    faqs: [
      {
        question: "Does online English tuition cover grammar and writing?",
        answer:
          "Yes — grammar, comprehension, essay and creative writing, and spoken expression, all coached on the student's own work.",
      },
      {
        question: "Is English tuition available for younger classes?",
        answer:
          "Yes, from Class 5 upward. Our /learn library also covers foundational topics like action words and naming words for early learners.",
      },
    ],
    learnSubjects: ["english"],
    related: ["", "social-science", "class-8", "cbse"],
  },
  {
    slug: "science",
    kind: "subject",
    h1: "Online Science Tuition, 1-to-1",
    title: "Online Science Tuition — 1-to-1 Science Tutor",
    metaDescription:
      "Online science tuition with a 1-to-1 science tutor for Classes 5–10. Physics, chemistry and biology fundamentals taught around a student's real gaps. Book a free assessment.",
    primaryKeyword: "online science tuition",
    intro:
      "For Classes 5 to 10, science is taught as one subject — and gaps in it are best closed one-to-one. Our assessment finds whether the trouble is in physics, chemistry or biology, and a mentor targets it directly.",
    usp: "A science mentor who finds which part is the problem, and fixes it.",
    covers: [
      "Physics, chemistry and biology fundamentals (Classes 5–10)",
      "Diagram-, formula- and experiment-based learning",
      "Board-style answer writing and application questions",
      "A bridge into specialised Physics / Chemistry / Biology tuition for Classes 11–12",
    ],
    whyOneToOne: [
      "The assessment separates a physics gap from a chemistry gap from a biology gap",
      "Experiments and diagrams are explained interactively, not just shown",
      "Pace and depth follow the student",
    ],
    faqs: [
      {
        question: "Which classes is online science tuition for?",
        answer:
          "Primarily Classes 5 to 10, where science is a combined subject. For Classes 11–12 we offer dedicated Physics, Chemistry and Biology tuition.",
      },
    ],
    learnSubjects: ["physics", "chemistry", "biology"],
    related: ["", "physics", "chemistry", "class-10"],
  },
  {
    slug: "computer-science",
    kind: "subject",
    h1: "Online Computer Science Tuition, 1-to-1",
    title: "Online Computer Science Tuition — 1-to-1 Tutor",
    metaDescription:
      "Online computer science tuition with a 1-to-1 tutor for Classes 9–12. Programming fundamentals, data structures and exam-aligned theory, taught step by step. Book a free assessment.",
    primaryKeyword: "online computer science tuition",
    intro:
      "Programming clicks when someone watches you write it and catches the misconception in real time. Online computer science tuition here is one-to-one — a mentor works alongside the student on real code and exam theory alike.",
    usp: "A computer-science mentor who codes alongside you.",
    covers: [
      "Programming fundamentals and logic building",
      "Data structures and algorithmic thinking",
      "Applied coding practice and projects",
      "Exam-aligned theory and practicals",
    ],
    whyOneToOne: [
      "Bugs and misconceptions are caught live, as the student writes code",
      "Projects are pitched at the student's level and interest",
      "Theory and practical work reinforce each other",
    ],
    faqs: [
      {
        question: "Which languages and topics are covered?",
        answer:
          "Sessions follow the student's syllabus and goals — commonly Python, Java, and the data-structures and logic-building topics that boards and early programming rely on.",
      },
    ],
    learnSubjects: [],
    related: ["", "maths", "class-11", "class-12"],
  },
  {
    slug: "social-science",
    kind: "subject",
    h1: "Online Social Science Tuition, 1-to-1",
    title: "Online Social Science Tuition — 1-to-1 Tutor",
    metaDescription:
      "Online social science tuition with a 1-to-1 tutor for Classes 5–10. History, civics, geography and economics taught with context and structured answer writing. Book a free assessment.",
    primaryKeyword: "online social science tuition",
    intro:
      "Social science is remembered through context, not rote dates. Online social science tuition here is one-to-one, so a mentor can connect history, civics, geography and economics into a story the student can actually recall and write about.",
    usp: "A mentor who turns dates and definitions into understanding.",
    covers: [
      "History and civics fundamentals",
      "Geography and map-based learning",
      "Economics basics",
      "Structured, board-style answer writing",
    ],
    whyOneToOne: [
      "Concepts are connected across chapters, not memorised in isolation",
      "Answer-writing is coached on the student's own attempts",
      "Weak areas from the assessment are targeted first",
    ],
    faqs: [
      {
        question: "Which classes does social science tuition cover?",
        answer: "Classes 5 to 10, across history, civics, geography and economics.",
      },
    ],
    learnSubjects: ["english"],
    related: ["", "english", "class-8", "class-10"],
  },
];

const SUBJECTS: ServicePage[] = SUBJECT_SEEDS.map((s) => ({
  ...s,
  navLabel: SUBJECT_NAV_LABELS[s.slug] ?? s.slug,
}));

// --- Grade service pages (/online-tuition/class-{5..12}) ---------------------
type GradeSeed = {
  n: number;
  band: "5-8" | "9-10" | "11-12";
  keyword: string;
  emphasis: string;
};

const GRADE_SEEDS: GradeSeed[] = [
  { n: 5, band: "5-8", keyword: "online tuition for class 5", emphasis: "building strong fundamentals and a genuine comfort with learning" },
  { n: 6, band: "5-8", keyword: "online tuition for class 6", emphasis: "strengthening fundamentals as subjects begin to branch out" },
  { n: 7, band: "5-8", keyword: "online tuition for class 7", emphasis: "deepening concepts and study habits before the senior years" },
  { n: 8, band: "5-8", keyword: "online tuition for class 8", emphasis: "closing foundation gaps before the board-track classes begin" },
  { n: 9, band: "9-10", keyword: "online tuition for class 9", emphasis: "building the concept base that Class 10 boards depend on" },
  { n: 10, band: "9-10", keyword: "online tuition for class 10", emphasis: "board-focused concept clarity and exam preparation" },
  { n: 11, band: "11-12", keyword: "online tuition for class 11", emphasis: "advanced subject mastery and the jump in difficulty from Class 10" },
  { n: 12, band: "11-12", keyword: "online tuition for class 12", emphasis: "board and competitive-exam preparation under real time pressure" },
];

const GRADES: ServicePage[] = GRADE_SEEDS.map((g) => ({
  slug: `class-${g.n}`,
  kind: "grade" as const,
  navLabel: `Class ${g.n}`,
  h1: `Online Tuition for Class ${g.n}, 1-to-1`,
  title: `Online Tuition for Class ${g.n} — 1-to-1 Classes`,
  metaDescription: `Personalised online tuition for Class ${g.n} — one mentor, one student, paced to a learning-gap assessment. Focused on ${g.emphasis}. Book a free assessment.`,
  primaryKeyword: g.keyword,
  intro: `Online tuition for Class ${g.n} at Remedial One is one-to-one and assessment-led. Before sessions begin, a topic-level assessment shows exactly where a Class ${g.n} student stands, and the mentor focuses on ${g.emphasis} — not on re-teaching a whole year the student has mostly already understood.`,
  usp: `Class ${g.n} tuition paced to one student, targeting ${g.emphasis}.`,
  covers: [
    `All core Class ${g.n} subjects, across CBSE, ICSE, IGCSE, IB and State boards`,
    "A learning-gap assessment before the first session",
    "Sessions built around the topics the assessment flags",
    "Chapter- and topic-level progress tracking through the year",
  ],
  whyOneToOne: [
    `A Class ${g.n} student never waits for a room to catch up, and is never left behind`,
    "The plan targets this student's gaps, not a generic class average",
    "Pace and revision follow the student through the year",
  ],
  faqs: [
    {
      question: `What does online tuition for Class ${g.n} include?`,
      answer: `One-to-one sessions across the core Class ${g.n} subjects for your board, starting from a learning-gap assessment and focused on ${g.emphasis}.`,
    },
    {
      question: `Which boards are supported for Class ${g.n}?`,
      answer: "CBSE, ICSE, IGCSE, IB and State boards — sessions follow the student's own syllabus.",
    },
  ],
  learnSubjects: g.band === "5-8" ? ["maths", "english"] : ["maths", "physics", "chemistry"],
  related: ["", g.n >= 9 ? "physics" : "english", "maths", g.n <= 8 ? "cbse" : "icse"],
}));

// --- Board service pages (/online-tuition/{board}) ---------------------------
type BoardSeed = { slug: string; name: string; keyword: string; blurb: string };

const BOARD_SEEDS: BoardSeed[] = [
  {
    slug: "cbse",
    name: "CBSE",
    keyword: "cbse online tuition",
    blurb: "Aligned to the NCERT-based CBSE curriculum, with attention to the competency- and application-based questions CBSE has moved toward.",
  },
  {
    slug: "icse",
    name: "ICSE",
    keyword: "icse online tuition",
    blurb: "Matched to the ICSE syllabus and its emphasis on depth, detail and long-form answer writing.",
  },
  {
    slug: "igcse",
    name: "IGCSE",
    keyword: "igcse online tuition",
    blurb: "Aligned to the Cambridge IGCSE syllabus, with its mark-scheme-driven answer style and international examples.",
  },
  {
    slug: "ib",
    name: "IB",
    keyword: "ib online tuition",
    blurb: "Suited to the IB's inquiry-led approach, internal assessments and criterion-based marking.",
  },
  {
    slug: "state-board",
    name: "State Board",
    keyword: "state board online tuition",
    blurb: "Matched to a student's own State-board syllabus and language of instruction where needed.",
  },
];

const BOARDS: ServicePage[] = BOARD_SEEDS.map((b) => ({
  navLabel: b.name,
  slug: b.slug,
  kind: "board" as const,
  h1: `${b.name} Online Tuition, 1-to-1`,
  title: `${b.name} Online Tuition — 1-to-1 Classes`,
  metaDescription: `${b.name} online tuition, one-to-one, for Classes 5–12. ${b.blurb} Book a free learning-gap assessment.`,
  primaryKeyword: b.keyword,
  intro: `${b.name} online tuition at Remedial One is one-to-one and built around the ${b.name} syllabus. ${b.blurb} A learning-gap assessment comes first, so every session targets the student's real gaps against the ${b.name} curriculum.`,
  usp: `1-to-1 tuition matched to the ${b.name} syllabus and exam style.`,
  covers: [
    `The full ${b.name} curriculum across core subjects, Classes 5–12`,
    `Answer writing tuned to the ${b.name} marking style`,
    "A learning-gap assessment before the first session",
    "Chapter- and topic-level progress tracking",
  ],
  whyOneToOne: [
    `The plan is matched to the ${b.name} syllabus and the student's gaps within it`,
    "Answer style is coached toward the board's own mark scheme",
    "Pace follows the student, not a batch",
  ],
  faqs: [
    {
      question: `Is online tuition available for all ${b.name} subjects?`,
      answer: `Yes — core subjects across Classes 5 to 12 on the ${b.name} syllabus, taught one-to-one.`,
    },
    {
      question: `How is ${b.name} tuition tailored to the board?`,
      answer: `${b.blurb} Sessions follow the student's ${b.name} syllabus directly, and answer writing is coached toward its marking style.`,
    },
  ],
  learnSubjects: ["maths", "physics", "chemistry"],
  related: ["", "class-10", "maths", b.slug === "cbse" ? "icse" : "cbse"],
}));

export const servicePages: ServicePage[] = [...SUBJECTS, ...GRADES, ...BOARDS];

/** All routable /online-tuition/{slug} pages (excludes the core index). */
export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((p) => p.slug === slug);
}

export const coreServicePage = CORE;

export const serviceSubjects = SUBJECTS;
export const serviceGrades = GRADES;
export const serviceBoards = BOARDS;
