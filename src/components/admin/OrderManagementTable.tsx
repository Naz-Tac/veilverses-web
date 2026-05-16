"use client";

import { useMemo, useState, useTransition } from "react";
import { Order, OrderStatus } from "@/types/domain";

type OrderManagementTableProps = {
  initialOrders: Order[];
};

const ORDER_STATUSES: OrderStatus[] = [
  "draft",
  "submitted",
  "partially_received",
  "received",
  "cancelled",
];

export function OrderManagementTable({ initialOrders }: OrderManagementTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.orderedAt) - +new Date(a.orderedAt)),
    [orders],
  );

  const onStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));

    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setMessage("Unable to update order status in Supabase. Check your service role key.");
        return;
      }

      setMessage("Order status updated successfully.");
    });
  };

  return (
    <section className="rounded-3xl border border-[#d8bf81] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-3xl text-[#1b1b1b]">Order Management</h2>
        <p className="text-sm text-[#6a6a6a]">{isPending ? "Syncing with Supabase..." : message}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#efe4c9] text-[#7a6635]">
              <th className="py-3 pr-4 font-semibold">Order ID</th>
              <th className="py-3 pr-4 font-semibold">Supplier</th>
              <th className="py-3 pr-4 font-semibold">PO Number</th>
              <th className="py-3 pr-4 font-semibold">Total</th>
              <th className="py-3 pr-4 font-semibold">Ordered</th>
              <th className="py-3 pr-4 font-semibold">Expected Delivery</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <tr key={order.id} className="border-b border-[#f3ecd9] text-[#272727]">
                <td className="py-3 pr-4 font-medium">{order.id}</td>
                <td className="py-3 pr-4">{order.supplier}</td>
                <td className="py-3 pr-4">{order.supplierOrderNumber ?? "-"}</td>
                <td className="py-3 pr-4">${order.total.toLocaleString("en-US")}</td>
                <td className="py-3 pr-4">{new Date(order.orderedAt).toLocaleDateString("en-US")}</td>
                <td className="py-3 pr-4">{order.expectedDeliveryAt ? new Date(order.expectedDeliveryAt).toLocaleDateString("en-US") : "-"}</td>
                <td className="py-3 pr-4">
                  <select
                    className="rounded-lg border border-[#d5bc80] bg-white px-3 py-2 capitalize"
                    value={order.status}
                    onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
