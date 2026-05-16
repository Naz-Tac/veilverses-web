import { BUSINESS_INFO } from "@/lib/constants";

export function VisitSection() {
  return (
    <section id="visit" className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-10">
      <div className="grid gap-6 rounded-3xl border border-[#cfb066] bg-[radial-gradient(circle_at_top_right,#fdf4dd_0%,#fffdfa_45%,#ffffff_100%)] p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[#8a6f2e]">Visit the Boutique</p>
          <h2 className="mt-3 font-serif text-4xl text-[#191919]">Personal Styling Appointments</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#454545]">
            Meet with our bridal stylists for one-on-one fittings, curated recommendations, and custom alteration guidance.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d7bc79] bg-white/80 p-6 text-sm leading-7 text-[#303030]">
          <p className="font-semibold text-[#1a1a1a]">{BUSINESS_INFO.name}</p>
          <p className="mt-2">{BUSINESS_INFO.address}</p>
          <p className="mt-2">{BUSINESS_INFO.website}</p>
          <a
            href="https://maps.google.com/?q=3890+Lake+Arrowhead+Blvd+Fremont+CA+94555"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-[#c9a84c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d5413]"
          >
            Open in Maps
          </a>
        </div>
      </div>
    </section>
  );
}
