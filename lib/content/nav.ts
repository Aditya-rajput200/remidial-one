export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "1-to-1 Tuition", href: "/one-to-one-tuition" },
  { label: "Subjects", href: "/subjects" },
  { label: "Skills", href: "/skills" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Mentors", href: "/mentors" },
  { label: "Resources", href: "/resources" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Learn",
    links: [
      { label: "Subjects", href: "/subjects" },
      { label: "Classes", href: "/classes" },
      { label: "1-to-1 Tuition", href: "/one-to-one-tuition" },
      { label: "Skills", href: "/skills" },
      { label: "Knowledge & Values", href: "/knowledge" },
    ],
  },
  {
    heading: "Mentors",
    links: [
      { label: "Find a Mentor", href: "/mentors" },
      { label: "Become a Mentor", href: "/become-a-mentor" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Resources", href: "/resources" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];
