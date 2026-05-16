import Link from "next/link";
import { notFound } from "next/navigation";
import { VAULT_COLLECTIONS } from "@/lib/vault";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function DressSilhouette({ index }: { index: number }) {
  const hue = index % 2 === 0 ? "#f4e3bb" : "#d9b878";

  return (
    <svg viewBox="0 0 260 300" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`silk-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hue} stopOpacity="0.95" />
          <stop offset="70%" stopColor="#b58f42" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7b5a23" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`glow-${index}`} cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor="#fff5da" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="260" height="300" fill={`url(#glow-${index})`} />
      <path
        d="M130 28 C115 30, 110 45, 111 56 C112 72, 104 83, 90 93 C74 104, 56 130, 52 173 C48 220, 72 255, 130 275 C188 255, 212 220, 208 173 C204 130, 186 104, 170 93 C156 83, 148 72, 149 56 C150 45, 145 30, 130 28 Z"
        fill={`url(#silk-${index})`}
        opacity="0.92"
      />
      <path d="M130 50 L130 272" stroke="#fff1c8" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M95 103 C116 112, 144 112, 165 103" stroke="#f7e7bd" strokeOpacity="0.45" strokeWidth="2" fill="none" />
      <path d="M84 145 C113 158, 147 158, 176 145" stroke="#f7e7bd" strokeOpacity="0.28" strokeWidth="2" fill="none" />
      <circle cx="130" cy="26" r="6" fill="#d7b56e" opacity="0.95" />
    </svg>
  );
}

function getPlaceholderKey(slug: string) {
  if (slug === "prom-formal") {
    return "prom";
  }
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
  const placeholderUrl = supabase
    ? supabase.storage.from("placeholders").getPublicUrl(`${imageKey}.png`).data.publicUrl
    : null;

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
              <div
                className="relative h-52 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(201,168,76,0.08))] bg-cover bg-center"
                style={placeholderUrl ? { backgroundImage: `url(${placeholderUrl})` } : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/55" />
                <div className="absolute inset-0 opacity-35">
                  <DressSilhouette index={index} />
                </div>
              </div>
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
