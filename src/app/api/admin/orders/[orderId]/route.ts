import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@/types/domain";
import { updateOrderStatus } from "@/lib/supabase/queries";

const VALID_STATUSES: OrderStatus[] = [
  "draft",
  "submitted",
  "partially_received",
  "received",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const body = (await request.json()) as { status?: string };

  if (!body.status || !VALID_STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json(
      { error: "Invalid status value." },
      { status: 400 },
    );
  }

  const result = await updateOrderStatus(orderId, body.status as OrderStatus);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Unable to update order status." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
