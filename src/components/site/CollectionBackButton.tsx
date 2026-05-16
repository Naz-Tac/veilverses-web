"use client";
import { useRouter } from "next/navigation";

export function CollectionBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="fixed top-4 left-4 z-50 text-xs uppercase tracking-widest text-[#C9A84C] transition hover:text-white"
    >
      ← Back
    </button>
  );
}