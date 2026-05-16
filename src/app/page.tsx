import { VaultHome } from "@/components/site/VaultHome";
import { VAULT_COLLECTIONS } from "@/lib/vault";

export const revalidate = 60;

export default async function Home() {
  return <VaultHome collections={VAULT_COLLECTIONS} />;
}
