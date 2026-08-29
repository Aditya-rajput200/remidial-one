import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/SessionProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organizationJsonLd } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Remedial One is a global 1-to-1 personalized learning platform connecting students with qualified mentors for academics, exam preparation, and skills beyond the classroom.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <JsonLd data={organizationJsonLd()} />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
