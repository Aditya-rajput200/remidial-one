import type { Metadata } from "next";

export const SITE_NAME = "Remedial One";
export const SITE_URL = "https://www.remedial-one.in";
export const SITE_TAGLINE = "One Student. One Mentor. One Learning Journey.";
export const SITE_EMAIL = "support@remedial-one.in";
export const SITE_PHONE = "+919334857780";
export const SITE_PHONE_DISPLAY = "+91 93348 57780";
// Support WhatsApp line — deliberately separate from SITE_PHONE above, which
// is the general contact number used for tel: links and JSON-LD.
export const SITE_WHATSAPP = "919470448026";

/** Builds a wa.me deep link that opens a chat with SITE_WHATSAPP, optionally pre-filled. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${SITE_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Branded 1200x630 social card, generated at app/opengraph-image.tsx. Referenced
// explicitly here (not left to the file convention) because every page's
// openGraph/twitter object below shallow-overrides the root layout's inherited
// metadata — so the image has to be re-attached at this single chokepoint.
const OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  // OpenGraph object type. Use "article" for /blog posts and /learn concept
  // pages so social and AI parsers treat them as standalone articles rather
  // than the site itself; everything else stays "website".
  ogType?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path,
  noIndex,
  ogType = "website",
}: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_IN",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Remedial One is a global 1-to-1 personalized learning and mentorship platform that helps students close learning gaps through assessment-led, remedial education with qualified mentors.",
    slogan: SITE_TAGLINE,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE_EMAIL,
      telephone: SITE_PHONE,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
    },
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Worldwide",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    image: input.imageUrl ?? undefined,
    author: { "@type": "Person", name: input.authorName },
    publisher: { "@type": "EducationalOrganization", name: SITE_NAME },
  };
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
  };
}

// Concept / "answer" pages in /learn are educational articles. Publisher-owned,
// mentor-reviewed content — the author defaults to the organisation so we never
// assert a named person we can't stand behind (E-E-A-T without fabrication).
export function learnArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    mainEntityOfPage: `${SITE_URL}${input.path}`,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: { "@type": "EducationalAudience", educationalRole: "student" },
    isAccessibleForFree: true,
  };
}

// Step-by-step "how to convert…" pages get HowTo markup so the numbered method
// is eligible for rich results.
export function howToJsonLd(input: {
  name: string;
  description: string;
  path: string;
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}

// A single self-contained Q&A (the concept page's direct answer). Kept distinct
// from FAQPage, which is reserved for the multi-question FAQ block.
export function qaPageJsonLd(input: { question: string; answer: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: input.question,
      url: `${SITE_URL}${input.path}`,
      acceptedAnswer: { "@type": "Answer", text: input.answer },
    },
  };
}

// Hub / listing pages (a /learn subject index, the service index) expose their
// child links as an ordered ItemList so crawlers see the cluster structure.
export function itemListJsonLd(input: {
  name: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}
