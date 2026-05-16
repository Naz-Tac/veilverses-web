import { InventoryItem } from "@/types/domain";

type FeaturedInventorySectionProps = {
  items: InventoryItem[];
};

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function FeaturedInventorySection({ items }: FeaturedInventorySectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-10">
      <div className="mb-8 flex items-center justify-between gap-6">
        <h2 className="font-serif text-4xl text-[#111]">Atelier Highlights</h2>
        <span className="text-sm text-[#6f6f6f]">Live from inventory</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[#e5d7ad] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9d7f31]">{item.category}</p>
            <h3 className="mt-2 font-serif text-2xl text-[#191919]">{item.name}</h3>
            <p className="mt-3 text-sm text-[#505050]">SKU: {item.sku}</p>
            <p className="mt-1 text-sm text-[#505050]">Available: {item.stock}</p>
            <p className="mt-5 text-xl font-semibold text-[#5d4a16]">{CURRENCY.format(item.price)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
