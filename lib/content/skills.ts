export type IconKey =
  | "mic"
  | "users"
  | "sparkles"
  | "brain"
  | "lightbulb"
  | "compass"
  | "heart-handshake"
  | "monitor-smartphone";

export type Skill = {
  slug: string;
  name: string;
  description: string;
  icon: IconKey;
};

export const skills: Skill[] = [
  {
    slug: "public-speaking",
    name: "Public Speaking",
    description: "Build the composure and clarity to speak confidently in front of others.",
    icon: "mic",
  },
  {
    slug: "personality-development",
    name: "Personality Development",
    description: "Grow self-awareness, confidence, and a stronger sense of identity.",
    icon: "sparkles",
  },
  {
    slug: "confidence-building",
    name: "Confidence Building",
    description: "Work through hesitation with structured, supportive practice.",
    icon: "heart-handshake",
  },
  {
    slug: "critical-thinking",
    name: "Critical Thinking",
    description: "Learn to question, reason, and evaluate ideas independently.",
    icon: "brain",
  },
  {
    slug: "creativity",
    name: "Creativity",
    description: "Develop original thinking through open-ended, guided exploration.",
    icon: "lightbulb",
  },
  {
    slug: "leadership",
    name: "Leadership",
    description: "Practice responsibility, initiative, and working well with others.",
    icon: "users",
  },
  {
    slug: "life-skills",
    name: "Life Skills",
    description: "Build practical decision-making, time management, and independence.",
    icon: "compass",
  },
  {
    slug: "digital-skills",
    name: "Digital Skills",
    description: "Learn to use technology thoughtfully, safely, and productively.",
    icon: "monitor-smartphone",
  },
];
