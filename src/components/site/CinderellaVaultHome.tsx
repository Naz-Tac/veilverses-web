"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { CollectionSection, CollectionKey } from "@/types/vault";

type CinderellaVaultHomeProps = {
  collections: CollectionSection[];
};

type CursorSpark = { id: number; x: number; y: number };

// ---------------------------------------------------------------------------
// Cursor trail
// ---------------------------------------------------------------------------
function CursorTrail({ sparks }: { sparks: CursorSpark[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 0.7, scale: 0.3, x: s.x, y: s.y }}
            animate={{ opacity: 0, scale: 1.6, x: s.x + 6, y: s.y - 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute left-0 top-0 block h-2 w-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,232,160,0.9) 0%, rgba(201,168,76,0.4) 40%, transparent 72%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating gold dust particles (CSS only)
// ---------------------------------------------------------------------------
const PARTICLE_DATA = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 137) % 90)}%`,
  delay: (i * 0.38) % 6,
  duration: 5 + (i % 5),
  size: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
}));

function GoldDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLE_DATA.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{ left: p.left, width: p.size, height: p.size, bottom: -8, opacity: 0 }}
          animate={{ y: [0, -1100], opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chandelier
// ---------------------------------------------------------------------------
function Chandelier() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
      <div className="flex flex-col items-center">
        <div className="h-14 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/60 to-[#C9A84C]" />
        <motion.div
          animate={{
            filter: [
              "drop-shadow(0 0 8px #C9A84C)",
              "drop-shadow(0 0 22px #ffe4a0)",
              "drop-shadow(0 0 8px #C9A84C)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          <div className="h-24 w-24 rounded-full border-2 border-[#C9A84C] shadow-[0_0_24px_rgba(201,168,76,0.55),inset_0_0_14px_rgba(201,168,76,0.15)] sm:h-28 sm:w-28" />
          <div className="absolute h-6 w-6 rounded-full bg-[radial-gradient(circle,#fff9e6_0%,#f0cc60_40%,#a07828_100%)] shadow-[0_0_16px_rgba(255,220,100,0.9)] sm:h-8 sm:w-8" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="absolute h-px w-12 origin-left bg-gradient-to-r from-[#C9A84C] to-[#C9A84C]/40"
              style={{ transform: `rotate(${angle}deg) translateX(12px)` }}
            />
          ))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const r = 52;
            return (
              <motion.div
                key={angle}
                className="absolute h-3 w-1 rounded-full bg-gradient-to-b from-[#ffe8a0] to-[#C9A84C]/50 sm:h-4 sm:w-1.5"
                style={{
                  left: `calc(50% + ${Math.cos(rad) * r}px - 2px)`,
                  top: `calc(50% + ${Math.sin(rad) * r}px)`,
                }}
                animate={{ rotateZ: ["-3deg", "3deg", "-3deg"] }}
                transition={{ duration: 2 + (angle % 3), repeat: Infinity, ease: "easeInOut" }}
              />
            );
          })}
        </motion.div>
        <div className="h-24 w-48 bg-[radial-gradient(ellipse_at_top,rgba(255,210,100,0.22)_0%,transparent_68%)]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Door panel with CSS wood grain + gold trim
// ---------------------------------------------------------------------------
function DoorPanel({ side, isOpen }: { side: "left" | "right"; isOpen: boolean }) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={false}
      animate={{ rotateY: isOpen ? (isLeft ? -88 : 88) : 0 }}
      transition={{ duration: 1.5, ease: [0.22, 0.9, 0.36, 1] }}
      style={{ transformOrigin: isLeft ? "left center" : "right center", transformStyle: "preserve-3d" }}
      className="relative h-full w-1/2 overflow-hidden"
    >
      {/* walnut wood grain */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(179deg,rgba(36,18,6,0) 0px,rgba(36,18,6,0) 2px,rgba(124,70,22,0.34) 3px,rgba(36,18,6,0) 4px),
            repeating-linear-gradient(181deg,rgba(92,52,18,0) 0px,rgba(92,52,18,0) 5px,rgba(154,94,38,0.24) 6px,rgba(92,52,18,0) 7px),
            linear-gradient(180deg,#4a2711 0%,#6a3a18 18%,#794620 38%,#6b3a1b 55%,#562d14 72%,#43220f 88%,#31190b 100%)
          `,
        }}
      />
      {/* outer gold border */}
      <div className="pointer-events-none absolute inset-0 border-4 border-[#C9A84C] shadow-[inset_0_0_0_2px_rgba(255,235,160,0.55),0_0_14px_rgba(201,168,76,0.45)]" />
      {/* top molding panel */}
      <div className="absolute left-2.5 right-2.5 top-2.5 h-[26%] border-2 border-[#C9A84C]/90 bg-[rgba(201,168,76,0.1)]">
        <div className="absolute inset-1 border border-[#C9A84C]/58" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="h-8 w-8 opacity-65">
            <circle cx="24" cy="24" r="3.5" fill="#C9A84C" />
            <ellipse cx="24" cy="12" rx="3" ry="7" fill="#C9A84C" opacity="0.7" />
            <ellipse cx="24" cy="36" rx="3" ry="7" fill="#C9A84C" opacity="0.7" />
            <ellipse cx="12" cy="24" rx="7" ry="3" fill="#C9A84C" opacity="0.7" />
            <ellipse cx="36" cy="24" rx="7" ry="3" fill="#C9A84C" opacity="0.7" />
          </svg>
        </div>
      </div>
      {/* center molding panel */}
      <div className="absolute bottom-[15%] left-2.5 right-2.5 top-[30%] border-2 border-[#C9A84C]/90 bg-[rgba(201,168,76,0.08)]">
        <div className="absolute inset-1 border border-[#C9A84C]/52" />
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[#C9A84C]/45" />
        <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-[#C9A84C]/45" />
      </div>
      {/* bottom molding panel */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 h-[13%] border-2 border-[#C9A84C]/90 bg-[rgba(201,168,76,0.1)]">
        <div className="absolute inset-1 border border-[#C9A84C]/58" />
      </div>
      {/* door handle + keyhole on inner edge */}
      <div
        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
        style={{ [isLeft ? "right" : "left"]: "10px" }}
      >
        <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-[#a07828] via-[#f5e08c] to-[#a07828] shadow-[0_1px_6px_rgba(201,168,76,0.7)]" />
        <div className="h-9 w-2.5 rounded-full bg-gradient-to-b from-[#f5e08c] via-[#C9A84C] to-[#a07828] shadow-[0_0_8px_rgba(201,168,76,0.8),inset_0_1px_2px_rgba(255,255,200,0.5)]" />
        <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-[#a07828] via-[#f5e08c] to-[#a07828] shadow-[0_1px_6px_rgba(201,168,76,0.7)]" />
        <div className="mt-2 flex flex-col items-center">
          <div className="h-2.5 w-2.5 rounded-full border-2 border-[#C9A84C] bg-black/60 shadow-[0_0_5px_rgba(201,168,76,0.6)]" />
          <div className="h-2 w-1.5 bg-[#C9A84C]" style={{ clipPath: "polygon(25% 0, 75% 0, 100% 100%, 0% 100%)" }} />
        </div>
      </div>
      {/* center seam gold line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-[#ffe8a8]/35 via-[#C9A84C] to-[#ffe8a8]/35"
        style={{ [isLeft ? "right" : "left"]: 0 }}
      />
      {/* inner glow seam pulse */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : [0.25, 0.6, 0.25] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 w-10 bg-[radial-gradient(ellipse_at_center,rgba(255,220,100,0.2)_0%,transparent_80%)]"
        style={{ [isLeft ? "right" : "left"]: 0 }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Section card in vault interior
// ---------------------------------------------------------------------------
const SECTION_ICONS: Record<CollectionKey, string> = {
  accessories: "👑",
  bridal: "🤍",
  quinceanera: "🌸",
  "prom-formal": "✨",
  evening: "🌙",
  "shoes-bags": "👠",
};

function SectionCard({ section, onClick }: { section: CollectionSection; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -3 }}
      transition={{ duration: 0.35 }}
      className="relative w-full overflow-hidden rounded-sm border border-[#C9A84C]/55 p-2.5 text-center sm:p-4"
      style={{
        background: hovered
          ? "linear-gradient(135deg,rgba(201,168,76,0.2) 0%,rgba(201,168,76,0.07) 100%)"
          : "linear-gradient(135deg,rgba(60,38,12,0.85) 0%,rgba(30,18,6,0.92) 100%)",
        boxShadow: hovered
          ? "0 0 22px rgba(201,168,76,0.4),inset 0 0 10px rgba(201,168,76,0.1)"
          : "0 2px 10px rgba(0,0,0,0.45)",
      }}
    >
      {/* gold corner accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#C9A84C]" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#C9A84C]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#C9A84C]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#C9A84C]" />

      <div className="text-xl leading-none sm:text-2xl">{SECTION_ICONS[section.key]}</div>
      <div
        className="mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-[#F5D87A] sm:text-xs"
        style={{ textShadow: "0 1px 5px rgba(201,168,76,0.7)" }}
      >
        {section.label}
      </div>
      <div className="mt-1 text-[9px] leading-snug text-[#e8d5a8]/72 sm:text-[10px]">
        {section.description}
      </div>
      {hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-[#C9A84C]"
        >
          Explore →
        </motion.div>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CinderellaVaultHome({ collections }: CinderellaVaultHomeProps) {
  const router = useRouter();
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [cursorSparks, setCursorSparks] = useState<CursorSpark[]>([]);
  const sparkIdRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const id = (sparkIdRef.current += 1);
      setCursorSparks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }].slice(-18));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleEnter = () => {
    if (isOpening || isDoorOpen) return;
    setIsOpening(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsDoorOpen(true);
      setIsOpening(false);
    }, 1800);
  };

  // Ordered layout
  const topSection = collections.find((c) => c.key === "accessories");
  const midSections = collections.filter((c) =>
    ["bridal", "quinceanera", "prom-formal", "evening"].includes(c.key),
  );
  const bottomSection = collections.find((c) => c.key === "shoes-bags");

  return (
    <div
      className="relative flex h-screen w-full flex-col overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.13) 0%, transparent 52%), linear-gradient(180deg, #1c1624 0%, #14101e 40%, #0f0d17 100%)",
      }}
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(201,168,76,0.05)] to-transparent" />
      </div>

      <GoldDust />
      <CursorTrail sparks={cursorSparks} />
      <Chandelier />

      {/* ===== CLOSED / DOOR VIEW ===== */}
      <AnimatePresence>
        {!isDoorOpen && (
          <motion.div
            key="closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          >
            {/* V&V logo */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2 }}
              className="mb-5 flex flex-col items-center"
            >
              <motion.div
                animate={{
                  textShadow: [
                    "0 0 18px rgba(201,168,76,0.8)",
                    "0 0 42px rgba(255,224,120,1)",
                    "0 0 18px rgba(201,168,76,0.8)",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl font-bold italic text-[#C9A84C] sm:text-6xl"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                V&amp;V
              </motion.div>
              <div className="mt-1 h-px w-28 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
              <div
                className="mt-2 text-[11px] uppercase tracking-[0.48em] text-[#ddc882]"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.85)" }}
              >
                Veil &amp; Verses
              </div>
            </motion.div>

            {/* The door - clickable entire panel */}
            <motion.button
              type="button"
              onClick={handleEnter}
              disabled={isOpening}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.38 }}
              className="relative mx-auto w-[min(280px,70vw)] cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              style={{ perspective: "900px" }}
            >
              {/* outer gold frame */}
              <div
                className="relative overflow-hidden shadow-[0_12px_56px_rgba(0,0,0,0.75),0_0_50px_rgba(201,168,76,0.15)]"
                style={{
                  border: "3px solid #C9A84C",
                  boxShadow:
                    "0 0 0 1px rgba(255,235,160,0.22), 0 12px 56px rgba(0,0,0,0.75), 0 0 50px rgba(201,168,76,0.18)",
                }}
              >
                {/* arch header bar */}
                <div
                  className="flex h-9 items-center justify-center border-b-2 border-[#C9A84C]/65"
                  style={{
                    background: "linear-gradient(180deg,#4e2810 0%,#3b1e0c 60%,#2e160a 100%)",
                  }}
                >
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.55em] text-[#C9A84C]"
                    style={{ textShadow: "0 0 8px rgba(201,168,76,0.6)" }}
                  >
                    The Vault
                  </span>
                </div>

                {/* two door panels */}
                <div className="relative flex h-[280px] sm:h-[340px]" style={{ transformStyle: "preserve-3d" }}>
                  {/* golden seam glow */}
                  <motion.div
                    animate={{
                      opacity: isOpening ? [0.5, 1, 1] : [0.3, 0.65, 0.3],
                      width: isOpening ? ["2px", "8px", "8px"] : "2px",
                    }}
                    transition={{
                      duration: isOpening ? 1.4 : 2.8,
                      repeat: isOpening ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute inset-y-0 left-1/2 z-10 -translate-x-1/2 bg-gradient-to-b from-[#ffe88c]/60 via-[#ffd060] to-[#ffe88c]/60"
                    style={{ boxShadow: "0 0 14px 5px rgba(255,210,80,0.55)" }}
                  />
                  <DoorPanel side="left" isOpen={isDoorOpen || isOpening} />
                  <DoorPanel side="right" isOpen={isDoorOpen || isOpening} />
                </div>

                {/* floor sill */}
                <div
                  className="h-3.5 border-t-2 border-[#C9A84C]/65"
                  style={{ background: "linear-gradient(180deg,#4e2810 0%,#2e160a 100%)" }}
                />
              </div>
            </motion.button>

              {/* golden light burst when opening */}
              <AnimatePresence>
                {isOpening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="pointer-events-none absolute inset-[-20px] bg-[radial-gradient(ellipse_at_center,rgba(255,210,80,0.48)_0%,transparent_62%)]"
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* enter button */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-6 flex flex-col items-center gap-2.5"
            >
              <button
                type="button"
                onClick={handleEnter}
                disabled={isOpening}
                className="relative overflow-hidden border border-[#C9A84C] px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#F5D87A] transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,rgba(201,168,76,0.12) 0%,rgba(201,168,76,0.05) 100%)",
                  boxShadow: "0 0 22px rgba(201,168,76,0.28)",
                  textShadow: "0 1px 8px rgba(201,168,76,0.5)",
                }}
              >
                {isOpening ? "Opening…" : "Enter The Vault"}
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-[#C9A84C]/12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.55 }}
                />
              </button>
              <p
                className="text-xs uppercase tracking-[0.4em] text-[#d4b878]"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}
              >
                Your story begins here
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== OPEN / INTERIOR VIEW ===== */}
      <AnimatePresence>
        {isDoorOpen && (
          <motion.div
            key="interior"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-20 flex h-full flex-col"
          >
            {/* header */}
            <div
              className="relative px-4 pb-3 pt-20 text-center"
              style={{
                background: "radial-gradient(ellipse at 50% 0%,rgba(255,210,80,0.15) 0%,transparent 62%)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <div
                  className="text-3xl font-bold italic text-[#C9A84C] sm:text-4xl"
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    textShadow: "0 0 26px rgba(201,168,76,0.85)",
                  }}
                >
                  V&amp;V
                </div>
                <div className="mx-auto mt-1 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
                <p
                  className="mt-1.5 text-xs uppercase tracking-[0.38em] text-[#e8d090]"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
                >
                  Welcome to the vault
                </p>
              </motion.div>
            </div>

            {/* collection grid */}
            <div className="flex-1 overflow-y-auto px-3 pb-20 sm:px-5">
              {topSection && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.6 }}
                  className="mb-2.5"
                >
                  <SectionCard section={topSection} onClick={() => router.push(topSection.route)} />
                </motion.div>
              )}

              <div className="mb-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {midSections.map((s, i) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48 + i * 0.08, duration: 0.6 }}
                  >
                    <SectionCard section={s} onClick={() => router.push(s.route)} />
                  </motion.div>
                ))}
              </div>

              {bottomSection && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.76, duration: 0.6 }}
                >
                  <SectionCard section={bottomSection} onClick={() => router.push(bottomSection.route)} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BOTTOM BAR ===== */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-[#C9A84C]/22 bg-[rgba(10,8,16,0.88)] px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="text-[10px] uppercase tracking-[0.28em] text-white/48">
          Fremont · CA
        </div>
        <Link
          href="/find-my-dress"
          className="border border-[#C9A84C]/65 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5D87A] transition hover:bg-[#C9A84C]/14"
          style={{ textShadow: "0 1px 4px rgba(201,168,76,0.5)" }}
        >
          ✨ Find My Dress
        </Link>
        <Link
          href="/admin"
          className="text-[10px] uppercase tracking-[0.28em] text-white/38 hover:text-white/65"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
