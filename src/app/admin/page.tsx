import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getDashboardData } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function AdminPage() {
  const data = await getDashboardData();
  return <AdminDashboard data={data} />;
}
