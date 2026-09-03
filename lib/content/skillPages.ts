// Detailed, SEO-oriented pages for each "skill beyond academics". Mirrors the
// shape of lib/content/onlineTuition.ts (ServicePage): one clear primary
// keyword, an answer-first intro, and a soft path into the booking flow.
// The base name / slug / icon come from lib/content/skills.ts so the homepage
// SkillCard grid and these pages never drift apart — new fields are added here.

import { skills, type Skill } from "@/lib/content/skills";

export type SkillPage = Skill & {
  /** <h1> / primary on-page heading */
  h1: string;
  /** <title> — leads with the primary keyword */
  title: string;
  metaDescription: string;
  /** Primary keyword this URL targets (internal reference) */
  primaryKeyword: string;
  /** Answer-first lead paragraph shown above the fold */
  intro: string;
  /** Short USP line under the H1 */
  usp: string;
  /** What a student actually works on in sessions */
  whatYouLearn: string[];
  /** What tends to change for the student */
  outcomes: string[];
  /** How the 1-to-1 sessions are structured */
  howItWorks: string[];
  faqs: { question: string; answer: string }[];
  /** Related skill slugs to interlink */
  related: string[];
};

type SkillDetail = Omit<SkillPage, keyof Skill>;

const DETAILS: Record<string, SkillDetail> = {
  "public-speaking": {
    h1: "Public Speaking Classes for Students, 1-to-1",
    title: "Public Speaking Classes for Students — 1-to-1 Online",
    metaDescription:
      "One-to-one online public speaking classes for students. A mentor works on structure, delivery, and nerves using the student's own talks. Book a free counselling call.",
    primaryKeyword: "public speaking classes for students",
    usp: "A mentor coaches your child's real talks — not a generic script.",
    intro:
      "Public speaking is a skill that improves with feedback, not just practice. In 1-to-1 sessions a mentor works on the parts that actually hold a student back — a shaky opening, a rushed pace, filler words, or the fear of a blank moment — using talks the student has to give for school, competitions, or interviews.",
    whatYouLearn: [
      "Structuring a talk so it has a clear opening, middle, and close",
      "Controlling pace, pauses, and volume for emphasis",
      "Managing nerves before and during a talk with practical techniques",
      "Handling questions and recovering when something goes wrong",
    ],
    outcomes: [
      "Less anxiety walking up to speak, in class or on stage",
      "Clearer, better-organised talks that hold attention",
      "A repeatable method the student can use for any future presentation",
    ],
    howItWorks: [
      "The first session is a baseline — the student gives a short talk and the mentor identifies two or three specific things to work on",
      "Each session mixes short technique drills with rehearsal of a real, upcoming talk",
      "The mentor records progress notes so improvement in delivery is visible session over session",
    ],
    faqs: [
      {
        question: "What age or class are public speaking sessions for?",
        answer:
          "They work from around Class 5 upward. The content is matched to the student — a Class 6 student might work on reading aloud with expression, while a Class 11 student prepares for interviews or debates.",
      },
      {
        question: "Does my child need an upcoming talk to start?",
        answer:
          "No. If there's a school presentation, elocution, or interview coming up, sessions are built around it. If not, the mentor uses short prepared topics so there's always something concrete to practise.",
      },
      {
        question: "How many sessions before there's a difference?",
        answer:
          "Most students notice they feel steadier within three to four sessions. Lasting change in structure and delivery usually builds over a term of regular practice.",
      },
    ],
    related: ["confidence-building", "personality-development", "leadership"],
  },
  "personality-development": {
    h1: "Personality Development Classes for Students, 1-to-1",
    title: "Personality Development Classes for Students — 1-to-1",
    metaDescription:
      "One-to-one personality development sessions for students — communication, self-awareness, presence, and habits, guided by a mentor. Book a free counselling call.",
    primaryKeyword: "personality development classes for students",
    usp: "Built around one student's goals — not a fixed personality course.",
    intro:
      "Personality development, done well, is not a checklist of manners. In 1-to-1 sessions a mentor helps a student build self-awareness, communication, and everyday presence — how they introduce themselves, hold a conversation, take feedback, and carry themselves — worked on gradually through real situations rather than lectures.",
    whatYouLearn: [
      "Introducing yourself clearly and comfortably in different settings",
      "Holding a two-way conversation — listening, asking, responding",
      "Body language, eye contact, and presence without over-thinking it",
      "Receiving feedback and disagreement without shutting down",
    ],
    outcomes: [
      "More ease in unfamiliar social and academic situations",
      "A clearer sense of the student's own strengths and goals",
      "Small, sustainable habit changes rather than a forced persona",
    ],
    howItWorks: [
      "Sessions start with a short conversation about where the student feels held back — group settings, new people, speaking up, or something else",
      "The mentor picks one focus area at a time and practises it through role-play and reflection",
      "Between sessions the student tries one small thing in real life and reports back",
    ],
    faqs: [
      {
        question: "Isn't personality something you're born with?",
        answer:
          "Temperament is fairly stable, but the skills people mean by 'personality development' — communication, confidence, presence, handling feedback — are learnable. Sessions focus on those, not on changing who a student is.",
      },
      {
        question: "How is this different from a public speaking class?",
        answer:
          "Public speaking is one slice of it — delivering a prepared talk. Personality development is broader: conversation, first impressions, self-awareness, and habits across everyday situations.",
      },
      {
        question: "Will the sessions feel like therapy?",
        answer:
          "No. Mentors are not counsellors and don't work on clinical concerns. Sessions are practical skill-building. If something comes up that needs a professional, the mentor will say so.",
      },
    ],
    related: ["confidence-building", "public-speaking", "life-skills"],
  },
  "confidence-building": {
    h1: "Confidence Building Sessions for Students, 1-to-1",
    title: "Confidence Building for Students — 1-to-1 Mentoring",
    metaDescription:
      "One-to-one confidence building sessions for students. A mentor uses small, structured wins to work through hesitation in class, exams, and social settings. Book a free call.",
    primaryKeyword: "confidence building for students",
    usp: "Confidence built on evidence — small wins the student can see.",
    intro:
      "Confidence is not a pep talk. It builds when a student attempts something slightly hard, sees it go better than they feared, and repeats that. In 1-to-1 sessions a mentor sets up that loop deliberately — around speaking in class, showing work, asking questions, or handling exam pressure — so confidence grows from real experience.",
    whatYouLearn: [
      "Breaking a task the student avoids into steps small enough to attempt",
      "Preparing for high-pressure moments — presentations, vivas, interviews",
      "Reframing mistakes as information instead of proof of inability",
      "Noticing and recording progress so it isn't forgotten",
    ],
    outcomes: [
      "More willingness to raise a hand, ask, or volunteer",
      "Calmer approach to exams and being put on the spot",
      "A sense that effort changes outcomes, backed by examples",
    ],
    howItWorks: [
      "The mentor and student name one or two situations where hesitation shows up most",
      "Each session sets a small, specific challenge to try before the next one",
      "Progress notes track what was attempted and how it went, so gains are visible",
    ],
    faqs: [
      {
        question: "My child is shy — will these sessions push too hard?",
        answer:
          "No. The whole method is about steps small enough to feel doable. The mentor moves at the student's pace and never forces a situation the student isn't ready for.",
      },
      {
        question: "Is low confidence an academic problem or a personal one?",
        answer:
          "Often both — a student who's fallen behind in a subject may go quiet across the board. Confidence sessions can run alongside subject tuition or a learning-gap assessment so both sides are addressed.",
      },
      {
        question: "How do you measure something like confidence?",
        answer:
          "Not with a score. The mentor keeps notes on concrete behaviours — asked a question in class, presented without reading off the slide — so change is described in specifics, not vibes.",
      },
    ],
    related: ["public-speaking", "personality-development", "critical-thinking"],
  },
  "critical-thinking": {
    h1: "Critical Thinking Skills for Students, 1-to-1",
    title: "Critical Thinking Skills for Students — 1-to-1 Mentoring",
    metaDescription:
      "One-to-one critical thinking sessions for students — questioning claims, weighing evidence, spotting weak arguments, and reasoning through problems. Book a free call.",
    primaryKeyword: "critical thinking skills for students",
    usp: "Reasoning practised on real questions, not worksheet puzzles.",
    intro:
      "Critical thinking is the habit of asking 'how do we know that?' before accepting a claim. In 1-to-1 sessions a mentor works through real material — a news story, an advertisement, a science claim, an argument in an essay — and coaches the student to separate fact from opinion, test evidence, and build a reasoned position of their own.",
    whatYouLearn: [
      "Telling the difference between a claim, evidence, and an assumption",
      "Spotting common weak moves — cherry-picking, false choices, appeals to popularity",
      "Weighing sources for reliability and bias",
      "Building an argument that survives a counter-argument",
    ],
    outcomes: [
      "Stronger, better-supported answers in essays and discussions",
      "More resistance to misinformation and manipulative messaging",
      "A habit of pausing to reason instead of reacting",
    ],
    howItWorks: [
      "Each session starts from a short real-world text or claim chosen for the student's interests",
      "The mentor asks structured questions rather than giving conclusions",
      "The student practises writing or arguing a position, then defending it against pushback",
    ],
    faqs: [
      {
        question: "What subjects does critical thinking help with?",
        answer:
          "All of them, but the effect shows most in essay subjects — English, history, civics — and in the application-based questions science and maths papers now include.",
      },
      {
        question: "Is this the same as debate coaching?",
        answer:
          "Related but broader. Debate trains you to argue a side under time pressure. Critical thinking includes changing your mind when the evidence points the other way.",
      },
      {
        question: "What age is it suitable for?",
        answer:
          "From around Class 7. Younger students work with simpler material — advertisements, short claims — while senior students analyse sources and structured arguments.",
      },
    ],
    related: ["creativity", "confidence-building", "leadership"],
  },
  creativity: {
    h1: "Creativity Sessions for Students, 1-to-1",
    title: "Creativity Skills for Students — 1-to-1 Guided Practice",
    metaDescription:
      "One-to-one creativity sessions for students — idea generation, original thinking, and finishing creative work, guided by a mentor. Book a free counselling call.",
    primaryKeyword: "creativity for students",
    usp: "Guided practice in having ideas and finishing them.",
    intro:
      "Creativity is a working process, not a gift some students have and others don't. In 1-to-1 sessions a mentor helps a student generate more ideas, push past the obvious first answer, combine ideas from different areas, and — the part that's usually missing — actually finish and share a piece of creative work.",
    whatYouLearn: [
      "Idea-generation methods that produce quantity before judging quality",
      "Techniques for getting unstuck when the first idea isn't working",
      "Borrowing structures and ideas across subjects and mediums",
      "Taking a rough idea through drafts to a finished piece",
    ],
    outcomes: [
      "More original responses in projects, writing, and open-ended questions",
      "Less fear of the blank page or the 'wrong' idea",
      "A process the student can repeat for any creative task",
    ],
    howItWorks: [
      "Sessions are built around a real creative task — a story, a project, a design, a presentation",
      "The mentor separates the 'make ideas' phase from the 'judge ideas' phase so the student doesn't self-censor too early",
      "Each session ends with a concrete next step so work moves toward finished, not perfect",
    ],
    faqs: [
      {
        question: "Is this an art class?",
        answer:
          "No. Creativity here is a thinking skill applied to whatever the student is working on — writing, science projects, design, problem-solving. It isn't tied to one medium.",
      },
      {
        question: "Can creativity actually be taught?",
        answer:
          "The habits behind it can — generating many ideas, delaying judgement, remixing, and iterating. Sessions train those habits with real tasks.",
      },
      {
        question: "How does this help with school?",
        answer:
          "Open-ended questions, projects, and creative writing all reward original, well-developed responses. The finishing process also helps students submit complete work on time.",
      },
    ],
    related: ["critical-thinking", "life-skills", "leadership"],
  },
  leadership: {
    h1: "Leadership Skills for Students, 1-to-1",
    title: "Leadership Skills for Students — 1-to-1 Mentoring",
    metaDescription:
      "One-to-one leadership sessions for students — initiative, responsibility, running a group, and handling disagreement, guided by a mentor. Book a free counselling call.",
    primaryKeyword: "leadership skills for students",
    usp: "Leadership practised through real responsibilities, then reviewed.",
    intro:
      "Leadership for students isn't about a title — it's initiative, following through on a commitment, and helping a group get something done. In 1-to-1 sessions a mentor works with the student on a real responsibility they hold — a project team, a club, an event, a study group — and reviews what worked and what didn't after each round.",
    whatYouLearn: [
      "Taking initiative without waiting to be asked",
      "Planning a small project and delegating parts of it",
      "Running a discussion so quieter people are heard",
      "Handling disagreement and holding people to commitments kindly",
    ],
    outcomes: [
      "More willingness to step up in group work and activities",
      "Better follow-through on things the student takes on",
      "A calmer, fairer way of handling group friction",
    ],
    howItWorks: [
      "Sessions attach to a real thing the student is responsible for, however small",
      "The mentor helps plan the next step, then debriefs how it actually went",
      "Recurring patterns — avoiding conflict, doing everything alone — are named and worked on",
    ],
    faqs: [
      {
        question: "My child isn't a 'natural leader' — is this still useful?",
        answer:
          "Yes. Quiet, steady students often make excellent leaders once they have a method. Sessions build the skill; they don't require an outgoing personality.",
      },
      {
        question: "Does the student need an official leadership role?",
        answer:
          "No. A group project, a family responsibility, or organising friends for an activity is enough to practise on.",
      },
      {
        question: "How is this different from personality development?",
        answer:
          "Personality development is broad self-presentation and communication. Leadership focuses specifically on initiative, planning, and getting a group to a shared goal.",
      },
    ],
    related: ["confidence-building", "critical-thinking", "life-skills"],
  },
  "life-skills": {
    h1: "Life Skills Classes for Students, 1-to-1",
    title: "Life Skills Classes for Students — 1-to-1 Mentoring",
    metaDescription:
      "One-to-one life skills sessions for students — time management, decision-making, organisation, and independence, guided by a mentor. Book a free counselling call.",
    primaryKeyword: "life skills classes for students",
    usp: "Practical routines the student sets up and keeps using.",
    intro:
      "Life skills are the everyday systems that make school and home run smoother — planning a week, breaking big tasks down, making decisions without spiralling, and staying organised. In 1-to-1 sessions a mentor helps the student build these routines around their actual schedule and then adjusts them until they stick.",
    whatYouLearn: [
      "Planning a realistic week and protecting time for study and rest",
      "Breaking large assignments into scheduled, bite-sized steps",
      "A simple method for making decisions when stuck",
      "Keeping notes, materials, and deadlines organised in one place",
    ],
    outcomes: [
      "Fewer last-minute rushes and missed deadlines",
      "More independence in managing schoolwork day to day",
      "Less overwhelm when a big task or busy week lands",
    ],
    howItWorks: [
      "The first session maps the student's current week and where time actually goes",
      "The mentor and student set up one system at a time and test it for a week",
      "Sessions review what held up and what didn't, and adjust — routines that don't fit get changed, not forced",
    ],
    faqs: [
      {
        question: "Is this a study-skills or a time-management class?",
        answer:
          "It covers both, plus decision-making and organisation. Study technique for a specific subject is better handled in subject tuition; life skills sessions build the surrounding routines.",
      },
      {
        question: "Will my child actually stick with the systems?",
        answer:
          "That's the point of doing it over several sessions rather than one workshop — the mentor keeps adjusting the routine to the student's real life until it's light enough to maintain.",
      },
      {
        question: "What age is this for?",
        answer:
          "From around Class 6, with the systems getting more independent as the student gets older. Senior students often focus on managing board-exam preparation without burning out.",
      },
    ],
    related: ["confidence-building", "leadership", "digital-skills"],
  },
  "digital-skills": {
    h1: "Digital Skills for Students, 1-to-1",
    title: "Digital Skills for Students — 1-to-1 Online Sessions",
    metaDescription:
      "One-to-one digital skills sessions for students — researching well, using documents and slides, online safety, and using AI tools responsibly. Book a free call.",
    primaryKeyword: "digital skills for students",
    usp: "Using technology to learn — safely, and without shortcuts that backfire.",
    intro:
      "Digital skills for students go beyond typing. In 1-to-1 sessions a mentor covers researching a topic properly, building clean documents and presentations, staying safe and private online, and using AI tools as a study aid without outsourcing the thinking — matched to the tools the student's school actually uses.",
    whatYouLearn: [
      "Researching a topic: search technique, judging a source, taking notes without copying",
      "Producing clear documents, slides, and spreadsheets",
      "Online safety — privacy, passwords, scams, and a sensible digital footprint",
      "Using AI tools to check understanding and get unstuck, not to hand in work",
    ],
    outcomes: [
      "Better-researched, better-presented projects",
      "Safer, more deliberate habits online",
      "A clear line between using a tool to learn and using it to cheat",
    ],
    howItWorks: [
      "Sessions use a real assignment the student has due, so skills are practised in context",
      "The mentor demonstrates, then the student does it while the mentor watches and corrects",
      "Online-safety topics are covered in short, concrete scenarios rather than abstract warnings",
    ],
    faqs: [
      {
        question: "Does my child need their own laptop?",
        answer:
          "A computer or laptop helps, since a lot of the work is producing documents and slides. Some of it — research technique, online safety — can be done on a tablet.",
      },
      {
        question: "Do you teach coding in these sessions?",
        answer:
          "No. Programming is covered under Computer Science tuition. Digital skills sessions are about researching, producing work, staying safe, and using everyday tools well.",
      },
      {
        question: "What's your stance on students using AI?",
        answer:
          "As a study aid — to explain a concept, quiz themselves, or review a draft — it's useful and sessions show how to do that. Submitting AI-written work as their own is cheating, and the mentor is clear about that line.",
      },
    ],
    related: ["life-skills", "critical-thinking", "creativity"],
  },
};

export const skillPages: SkillPage[] = skills.map((skill) => ({
  ...skill,
  ...DETAILS[skill.slug],
}));

export function getSkillPage(slug: string): SkillPage | undefined {
  return skillPages.find((page) => page.slug === slug);
}
