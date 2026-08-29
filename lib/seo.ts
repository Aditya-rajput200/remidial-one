import type { Metadata } from "next";

export const SITE_NAME = "Remedial One";
export const SITE_URL = "https://www.remedialone.com";
export const SITE_TAGLINE = "One Student. One Mentor. One Learning Journey.";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  noIndex,
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
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
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
