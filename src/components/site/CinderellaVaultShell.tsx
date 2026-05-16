"use client";

import dynamic from "next/dynamic";
import type { CollectionSection } from "@/types/vault";

const CinderellaVaultHome = dynamic(
  () => import("@/components/site/CinderellaVaultHome").then((mod) => mod.CinderellaVaultHome),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-black" />,
  },
);

type CinderellaVaultShellProps = {
  collections: CollectionSection[];
};

export function CinderellaVaultShell({ collections }: CinderellaVaultShellProps) {
  return <CinderellaVaultHome collections={collections} />;
}
