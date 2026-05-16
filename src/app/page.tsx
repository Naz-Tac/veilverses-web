import { CinderellaVaultShell } from "@/components/site/CinderellaVaultShell";
import { VAULT_COLLECTIONS } from "@/lib/vault";

export const revalidate = 60;

export default async function Home() {
  return <CinderellaVaultShell collections={VAULT_COLLECTIONS} />;
}
