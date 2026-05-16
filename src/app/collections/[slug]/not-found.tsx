import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#060505] px-6 text-white">
      <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.45em] text-[#e2c66b]">The Vault</p>
        <h1 className="mt-4 font-serif text-4xl">Collection not found</h1>
        <p className="mt-4 text-sm leading-7 text-white/70">The wardrobe section you selected is not available.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-[#e2c66b]/50 px-6 py-3 text-xs uppercase tracking-[0.38em] text-[#f8eabf] transition hover:bg-[#e2c66b]/10">
          Return Home
        </Link>
      </div>
    </main>
  );
}
