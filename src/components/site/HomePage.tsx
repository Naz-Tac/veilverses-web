import { FeaturedInventorySection } from "@/components/site/FeaturedInventorySection";
import { CategorySection } from "@/components/site/CategorySection";
import { HeroSection } from "@/components/site/HeroSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { VisitSection } from "@/components/site/VisitSection";
import { InventoryItem } from "@/types/domain";

type HomePageProps = {
  featuredInventory: InventoryItem[];
};

export function HomePage({ featuredInventory }: HomePageProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedInventorySection items={featuredInventory} />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
