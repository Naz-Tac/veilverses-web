import { notFound } from "next/navigation";
import { VAULT_COLLECTIONS } from "@/lib/vault";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CollectionBackButton } from "@/components/site/CollectionBackButton";

function getPlaceholderKey(slug: string) {
  if (slug === "shoes-bags") {
    return "accessories";
  }
  return slug;
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = VAULT_COLLECTIONS.find((item) => item.key === slug);

  if (!collection) {
    notFound();
  }

  const supabase = getSupabaseServerClient(true) ?? getSupabaseServerClient(false);
  const imageKey = getPlaceholderKey(collection.key);
  const placeholderUrls = supabase
    ? Array.from({ length: 6 }, (_, i) =>
        supabase.storage.from("placeholders").getPublicUrl(`${imageKey}-${i + 1}.png`).data.publicUrl,
      )
    : Array(6).fill(null);

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,#2a241b_0%,#090808_50%,#050404_100%)] px-6 py-10 text-white">
      <CollectionBackButton />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-black/20 p-8 pt-16 backdrop-blur-md md:p-12 md:pt-16">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-[#e2c56a]">The Vault</p>
          <h1 className="mt-4 font-serif text-5xl text-[#fff8df] md:text-6xl">{collection.label}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">{collection.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <article key={index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div
                className="relative h-52 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#12100f] bg-cover bg-center"
                style={placeholderUrls[index] ? { backgroundImage: `url(${placeholderUrls[index]})` } : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/22 to-black/58" />
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/55">
                Style {String(index + 1).padStart(3, "0")}
              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  );
}
