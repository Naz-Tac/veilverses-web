import { DashboardData } from "@/types/domain";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { OrderManagementTable } from "@/components/admin/OrderManagementTable";
import { StatCard } from "@/components/admin/StatCard";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type AdminDashboardProps = {
  data: DashboardData;
};

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-12 lg:px-10">
      <header className="rounded-3xl border border-[#d4bd85] bg-[linear-gradient(145deg,#fffdf7_12%,#ffefca_100%)] p-7">
        <p className="text-xs uppercase tracking-[0.22em] text-[#947935]">Veil & Verses Back Office</p>
        <h1 className="mt-2 font-serif text-4xl text-[#161616]">Admin Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#515151]">
          Manage inventory, review customer orders, and track boutique revenue in one place.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross Revenue"
          value={CURRENCY.format(data.salesTotals.grossRevenue)}
          subtitle="All-time boutique sales"
        />
        <StatCard
          label="Monthly Revenue"
          value={CURRENCY.format(data.salesTotals.monthlyRevenue)}
          subtitle="Current month performance"
        />
        <StatCard
          label="Pending Orders"
          value={String(data.salesTotals.pendingOrders)}
          subtitle="Orders awaiting fulfillment"
        />
        <StatCard
          label="Total Orders"
          value={String(data.salesTotals.totalOrders)}
          subtitle="Processed and active orders"
        />
      </section>

      <InventoryTable items={data.inventory} />
      <OrderManagementTable initialOrders={data.orders} />
      <CustomersTable customers={data.customers} />
      <AppointmentsTable appointments={data.appointments} />
    </main>
  );
}
