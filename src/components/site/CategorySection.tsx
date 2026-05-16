import { CATEGORY_CONTENT } from "@/lib/constants";

export function CategorySection() {
  return (
    <section id="collections" className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-10">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2 className="font-serif text-4xl text-[#121212]">Featured Categories</h2>
        <span className="text-sm uppercase tracking-[0.2em] text-[#8a7340]">Curated in-house</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_CONTENT.map((category) => (
          <article
            key={category.slug}
            className="group rounded-2xl border border-[#d6be83] bg-[linear-gradient(145deg,#fffef9_5%,#fff4dc_70%)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#9d7f31]">{category.slug}</p>
            <h3 className="mt-3 font-serif text-2xl text-[#1b1b1b]">{category.category}</h3>
            <p className="mt-3 text-sm leading-7 text-[#4d4d4d]">{category.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
