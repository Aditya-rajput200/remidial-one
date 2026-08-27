import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function FloatingContactButton() {
  return (
    <Link
      href="/contact"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-lift transition-transform duration-200 hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline">Need Help?</span>
    </Link>
  );
}
