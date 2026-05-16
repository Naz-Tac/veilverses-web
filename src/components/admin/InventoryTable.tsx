import { InventoryItem } from "@/types/domain";

type InventoryTableProps = {
  items: InventoryItem[];
};

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <section className="rounded-3xl border border-[#d8bf81] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#1b1b1b]">Inventory Tracker</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#efe4c9] text-[#7a6635]">
              <th className="py-3 pr-4 font-semibold">Name</th>
              <th className="py-3 pr-4 font-semibold">Category</th>
              <th className="py-3 pr-4 font-semibold">SKU</th>
              <th className="py-3 pr-4 font-semibold">Stock</th>
              <th className="py-3 pr-4 font-semibold">Location</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[#f3ecd9] text-[#272727]">
                <td className="py-3 pr-4">{item.name}</td>
                <td className="py-3 pr-4">{item.category}</td>
                <td className="py-3 pr-4">{item.sku}</td>
                <td className="py-3 pr-4">{item.stock}</td>
                <td className="py-3 pr-4">{item.location}</td>
                <td className="py-3 pr-4 capitalize">{item.status.replaceAll("_", " ")}</td>
                <td className="py-3 pr-4">${item.price.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
