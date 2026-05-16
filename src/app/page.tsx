import { HomePage } from "@/components/site/HomePage";
import { getFeaturedInventory } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function Home() {
  const featuredInventory = await getFeaturedInventory(4);

  return <HomePage featuredInventory={featuredInventory} />;
}
