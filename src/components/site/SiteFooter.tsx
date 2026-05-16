import { BUSINESS_INFO } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[#d8c490] bg-[#0f0f0f]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-[#e4d7b3] lg:px-10 md:flex-row md:items-center md:justify-between">
        <p className="font-serif text-xl text-[#f6e7bc]">{BUSINESS_INFO.name}</p>
        <p>{BUSINESS_INFO.address}</p>
        <p>Copyright {new Date().getFullYear()} {BUSINESS_INFO.website}</p>
      </div>
    </footer>
  );
}
