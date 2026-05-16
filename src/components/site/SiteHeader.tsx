import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#c9a84c]/20 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="font-serif text-2xl tracking-wide text-[#121212]">
          {BUSINESS_INFO.name}
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[#3a3a3a] md:flex">
          <a href="#collections" className="transition hover:text-[#c9a84c]">
            Collections
          </a>
          <a href="#experience" className="transition hover:text-[#c9a84c]">
            Experience
          </a>
          <a href="#visit" className="transition hover:text-[#c9a84c]">
            Visit
          </a>
          <Link href="/admin" className="rounded-full border border-[#c9a84c] px-4 py-2 text-[#1a1a1a]">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
