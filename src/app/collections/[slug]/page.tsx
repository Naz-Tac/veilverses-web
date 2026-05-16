import Link from "next/link";
import { notFound } from "next/navigation";
import { VAULT_COLLECTIONS } from "@/lib/vault";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = VAULT_COLLECTIONS.find((item) => item.key === slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2a241b_0%,#090808_50%,#050404_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-black/20 p-8 backdrop-blur-md md:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-[#e2c56a]">The Vault</p>
          <h1 className="mt-4 font-serif text-5xl text-[#fff8df] md:text-6xl">{collection.label}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">{collection.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <article key={index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="h-52 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(201,168,76,0.08))]" />
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/55">
                <span>{collection.description}</span>
                <span>{index + 1}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="rounded-full border border-[#e2c66b]/50 px-6 py-3 text-xs uppercase tracking-[0.38em] text-[#f8eabf] transition hover:bg-[#e2c66b]/10">
            Return to The Vault
          </Link>
          <span className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white/60">
            Accent {collection.accent}
          </span>
        </div>
      </div>
    </main>
  );
}
