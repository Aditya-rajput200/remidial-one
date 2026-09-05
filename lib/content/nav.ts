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
  Landmark,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const moreNav: NavLink[] = [
  { label: "About Us", href: "/about", icon: Info },
  { label: "Blog", href: "/blog", icon: Newspaper },
  { label: "Contact", href: "/contact", icon: Mail },
];

// --- Mega menu -------------------------------------------------------------
// Rich header dropdowns for the two areas with real breadth: the Programs
// hub (board / class / subject / skill pages) and the free Resources cluster.

export type MegaItem = {
  label: string;
  href: string;
  /** Small supporting line under the label (list variant only). */
  sub?: string;
  /** Optional pill, e.g. "Popular" — rendered in brand lime. */
  tag?: string;
  /** Logo image (public path), used by the "logos" column variant. */
  image?: string;
};

export type MegaColumn = {
  heading: string;
  icon: LucideIcon;
  /**
   * "list"  = label + sub text
   * "chips" = compact bordered grid (Class 5–12)
   * "logos" = logo tile grid (exam boards)
   */
  variant?: "list" | "chips" | "logos";
  items: MegaItem[];
  seeAll?: { label: string; href: string };
};

export type MegaPanel = {
  columns: MegaColumn[];
  footer: { text: string; ctaLabel: string; ctaHref: string };
};

export type MegaNavItem = { key: string; label: string; panel: MegaPanel };

const classNumbers = [5, 6, 7, 8, 9, 10, 11, 12] as const;

export const megaNav: MegaNavItem[] = [
  {
    key: "programs",
    label: "Programs",
    panel: {
      columns: [
        {
          heading: "Boards",
          icon: Landmark,
          variant: "logos",
          items: [
            { label: "CBSE", href: "/online-tuition/cbse", sub: "NCERT-aligned", image: "/images/CBSE.png", tag: "Popular" },
            { label: "ICSE", href: "/online-tuition/icse", sub: "Depth & long answers", image: "/images/ICSE.png" },
            { label: "State Board", href: "/online-tuition/state-board", sub: "Your State syllabus", image: "/images/State.png" },
          ],
          seeAll: { label: "How online tuition works", href: "/online-tuition" },
        },
        {
          heading: "Classes",
          icon: Layers,
          variant: "chips",
          items: classNumbers.map((n) => ({
            label: `Class ${n}`,
            href: `/online-tuition/class-${n}`,
          })),
          seeAll: { label: "All classes", href: "/classes" },
        },
        {
          heading: "Subjects",
          icon: BookOpen,
          items: [
            { label: "Maths", href: "/online-tuition/maths", tag: "Popular" },
            { label: "Physics", href: "/online-tuition/physics" },
            { label: "Chemistry", href: "/online-tuition/chemistry" },
            { label: "Biology", href: "/online-tuition/biology" },
            { label: "English", href: "/online-tuition/english" },
            { label: "Computer Science", href: "/online-tuition/computer-science" },
            { label: "Social Science", href: "/online-tuition/social-science" },
          ],
          seeAll: { label: "All subjects", href: "/subjects" },
        },
        {
          heading: "Skills",
          icon: Sparkles,
          items: [
            { label: "Public Speaking", href: "/skills/public-speaking" },
            { label: "Confidence Building", href: "/skills/confidence-building" },
            { label: "Personality Development", href: "/skills/personality-development" },
            { label: "Critical Thinking", href: "/skills/critical-thinking" },
            { label: "Leadership", href: "/skills/leadership" },
            { label: "Life Skills", href: "/skills/life-skills" },
          ],
          seeAll: { label: "All skills", href: "/skills" },
        },
      ],
      footer: {
        text: "Not sure where a student stands?",
        ctaLabel: "Book Free Counselling",
        ctaHref: "/book-counselling",
      },
    },
  },
  {
    key: "resources",
    label: "Resources",
    panel: {
      columns: [
        {
          heading: "Free Learn Library",
          icon: BookOpen,
          items: [
            { label: "Maths", href: "/learn/maths" },
            { label: "Physics", href: "/learn/physics" },
            { label: "Chemistry", href: "/learn/chemistry" },
            { label: "English", href: "/learn/english" },
            { label: "Conversions & Units", href: "/learn/conversions" },
          ],
          seeAll: { label: "Browse the library", href: "/learn" },
        },
        {
          heading: "Read & Explore",
          icon: Newspaper,
          items: [
            { label: "Blog", href: "/blog", sub: "Guides for students & parents" },
            { label: "Knowledge & Values", href: "/knowledge", sub: "Beyond the syllabus" },
            { label: "FAQ", href: "/faq", sub: "Common questions, answered" },
            { label: "About Remedial One", href: "/about" },
          ],
        },
        {
          heading: "How It Works",
          icon: ListChecks,
          items: [
            { label: "The Remedial One Method", href: "/one-to-one-tuition#how-it-works" },
            { label: "Learning Gap Assessment", href: "/learning-gap-assessment" },
            { label: "Meet the Mentors", href: "/mentors" },
            { label: "Session Resources", href: "/one-to-one-tuition#resources" },
          ],
        },
      ],
      footer: {
        text: "Prefer to see a session first?",
        ctaLabel: "Book Free Counselling",
        ctaHref: "/book-counselling",
      },
    },
  },
];

// The desktop header renders this ordered mix of plain links and mega menus.
export type HeaderNavEntry =
  | ({ type: "link"; highlight?: boolean } & NavLink)
  | ({ type: "mega" } & MegaNavItem);

export const headerNav: HeaderNavEntry[] = [
  { type: "mega", ...megaNav[0] },
  { type: "link", label: "Mentors", href: "/mentors", icon: UsersRound },
  { type: "mega", ...megaNav[1] },
  { type: "link", label: "Book Counselling", href: "/book-counselling", icon: CalendarCheck, highlight: true },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Learn",
    links: [
      { label: "1-to-1 Tuition", href: "/one-to-one-tuition", icon: GraduationCap },
      { label: "Personalized Learning", href: "/personalized-learning", icon: Target },
      { label: "Remedial Classes", href: "/remedial-classes", icon: BookOpen },
      { label: "Learning Gap Assessment", href: "/learning-gap-assessment", icon: ClipboardCheck },
      { label: "Subjects", href: "/subjects", icon: BookOpen },
      { label: "Classes", href: "/classes", icon: Layers },
      { label: "Skills", href: "/skills", icon: Sparkles },
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
