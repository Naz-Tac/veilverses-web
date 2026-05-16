import { Customer } from "@/types/domain";

type CustomersTableProps = {
  customers: Customer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <section className="rounded-3xl border border-[#d8bf81] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-3xl text-[#1b1b1b]">Customers</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#efe4c9] text-[#7a6635]">
              <th className="py-3 pr-4 font-semibold">Name</th>
              <th className="py-3 pr-4 font-semibold">Email</th>
              <th className="py-3 pr-4 font-semibold">Phone</th>
              <th className="py-3 pr-4 font-semibold">Preferred Category</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#f3ecd9] text-[#272727]">
                <td className="py-3 pr-4">{customer.firstName} {customer.lastName}</td>
                <td className="py-3 pr-4">{customer.email ?? "-"}</td>
                <td className="py-3 pr-4">{customer.phone ?? "-"}</td>
                <td className="py-3 pr-4">{customer.preferredCategory ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
