"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DressMatch } from "@/types/domain";

type ApiResult = {
  styleAnalysis: string;
  matches: DressMatch[];
};

export default function FindMyDressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ApiResult | null>(null);

  const disabled = useMemo(() => isLoading || !file, [isLoading, file]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/find-my-dress", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ApiResult & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to analyze image.");
      }

      setResult(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#332b1b_0%,#0e0c09_45%,#070706_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-[#c9a84c]/35 bg-black/35 p-8 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.36em] text-[#e6c878]">AI Styling Assistant</p>
          <h1 className="mt-3 font-serif text-5xl text-[#fff3d2]">Find My Dress</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75">
            Upload inspiration and Claude vision analyzes silhouette, fabric, tone, and formality, then matches your look to live Veil & Verses inventory.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-full border border-[#c9a84c]/55 px-5 py-2 text-xs uppercase tracking-[0.34em] text-[#f8e8b7]">
            Back to Home
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={onSubmit} className="rounded-3xl border border-[#c9a84c]/30 bg-black/35 p-6">
            <label className="block text-xs uppercase tracking-[0.32em] text-[#f1d690]">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setResult(null);
                if (selected) {
                  setPreview(URL.createObjectURL(selected));
                } else {
                  setPreview(null);
                }
              }}
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white"
            />

            {preview && (
              <div className="relative mt-5 h-64 w-full overflow-hidden rounded-2xl">
                <Image src={preview} alt="Uploaded inspiration" fill className="object-cover" unoptimized />
              </div>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="mt-5 w-full rounded-full border border-[#c9a84c]/55 bg-[#c9a84c]/12 px-6 py-3 text-xs uppercase tracking-[0.34em] text-[#f7e7ba] disabled:opacity-40"
            >
              {isLoading ? "Analyzing with Claude..." : "Find Matching Dresses"}
            </button>

            {error && <p className="mt-4 text-sm text-[#ffb6b6]">{error}</p>}
          </form>

          <section className="rounded-3xl border border-[#c9a84c]/30 bg-black/35 p-6">
            <h2 className="font-serif text-3xl text-[#fff0cc]">Results</h2>
            {!result && <p className="mt-4 text-sm leading-7 text-white/70">Your style analysis and best matches will appear here.</p>}

            {result && (
              <>
                <article className="mt-4 rounded-2xl border border-[#c9a84c]/25 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#e2c373]">Claude Analysis</p>
                  <p className="mt-3 text-sm leading-7 text-white/80 whitespace-pre-wrap">{result.styleAnalysis}</p>
                </article>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {result.matches.map((match) => (
                    <article key={match.id} className="rounded-2xl border border-[#c9a84c]/25 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#e8cd87]">{match.category}</p>
                      <h3 className="mt-2 font-serif text-2xl text-[#fff1cc]">{match.name}</h3>
                      <p className="mt-2 text-sm text-white/75">Color: {match.color} · Size: {match.size}</p>
                      <p className="mt-1 text-sm text-white/75">SKU: {match.sku}</p>
                      <p className="mt-3 text-lg text-[#f3d995]">${match.price.toLocaleString("en-US")}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#d1b067]">Match Score {match.score}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
