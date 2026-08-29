import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/SessionProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Remedial One is a global 1-to-1 personalized learning platform that identifies learning gaps through assessment and connects students with qualified mentors for remedial education, exam preparation, and skills beyond the classroom.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rubik.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
