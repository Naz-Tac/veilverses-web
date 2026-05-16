"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BUSINESS_INFO } from "@/lib/constants";

const BridalExperience = dynamic(
  () => import("@/components/three/BridalExperience"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-[#c9a84c]/25 bg-[#0a0a0a] text-sm text-[#e9ddbe]">
        Loading immersive showroom...
      </div>
    ),
  },
);

export function HeroSection() {
  return (
    <section id="experience" className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-10">
      <div className="flex flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-sm uppercase tracking-[0.22em] text-[#8d7434]"
        >
          Luxury Bridal Boutique in Fremont
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="mt-4 max-w-xl font-serif text-5xl leading-tight text-[#121212] md:text-6xl"
        >
          Veils, verses, and unforgettable silhouettes.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16 }}
          className="mt-5 max-w-lg text-base leading-8 text-[#3f3f3f]"
        >
          {BUSINESS_INFO.name} curates bridal, quinceanera, prom, and evening collections with private styling appointments and couture-level attention to detail.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.22 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <a
            href="#visit"
            className="rounded-full bg-[#121212] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#292929]"
          >
            Book Appointment
          </a>
          <a
            href="#collections"
            className="rounded-full border border-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#6f5718] transition hover:bg-[#fff8e8]"
          >
            Explore Collections
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, delay: 0.2 }}
      >
        <BridalExperience />
      </motion.div>
    </section>
  );
}
