import {
  GraduationCap,
  UsersRound,
  CalendarCheck,
  Info,
  Newspaper,
  Mail,
  BookOpen,
  Sparkles,
  Layers,
  Compass,
  Search,
  UserPlus,
  ShieldCheck,
  FolderOpen,
  ListChecks,
  HelpCircle,
  Target,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNav: NavLink[] = [
  { label: "1-to-1 Tuition", href: "/one-to-one-tuition", icon: GraduationCap },
  { label: "Mentors", href: "/mentors", icon: UsersRound },
  { label: "Book Counselling", href: "/book-counselling", icon: CalendarCheck },
];

export const moreNav: NavLink[] = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Blog", href: "/blog", icon: Newspaper },
  { label: "Contact", href: "/contact", icon: Mail },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Learn",
    links: [
      { label: "1-to-1 Tuition", href: "/one-to-one-tuition", icon: GraduationCap },
      { label: "Personalized Learning", href: "/personalized-learning", icon: Target },
      { label: "Remedial Classes", href: "/remedial-classes", icon: BookOpen },
      { label: "Learning Gap Assessment", href: "/learning-gap-assessment", icon: ClipboardCheck },
      { label: "Skills", href: "/one-to-one-tuition#skills", icon: Sparkles },
      { label: "Classes", href: "/classes", icon: Layers },
      { label: "Knowledge & Values", href: "/knowledge", icon: Compass },
    ],
  },
  {
    heading: "Mentors",
    links: [
      { label: "Find a Mentor", href: "/mentors", icon: Search },
      { label: "Become a Mentor", href: "/become-a-mentor", icon: UserPlus },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about", icon: Info },
      { label: "Blog", href: "/blog", icon: Newspaper },
      { label: "Contact", href: "/contact", icon: Mail },
      { label: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Resources", href: "/one-to-one-tuition#resources", icon: FolderOpen },
      { label: "How It Works", href: "/one-to-one-tuition#how-it-works", icon: ListChecks },
      { label: "FAQ", href: "/faq", icon: HelpCircle },
    ],
  },
];
