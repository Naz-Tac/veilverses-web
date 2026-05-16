"use client";

import { useRouter } from "next/navigation";

export function CollectionBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute left-6 top-6 z-20 w-fit text-xs uppercase tracking-[0.38em] text-[#e2c66b]/75 transition hover:text-[#e2c66b]"
    >
      ← THE VAULT
    </button>
  );
}