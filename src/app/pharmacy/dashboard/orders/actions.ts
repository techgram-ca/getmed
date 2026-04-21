"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TRANSITIONS: Record<string, string[]> = {
  new:        ["processing", "cancelled"],
  processing: ["ready",      "cancelled"],
  cancelled:  ["processing"],
  ready:      ["completed",  "cancelled"],
  completed:  [],
};

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pharmacy) return { error: "Pharmacy not found" };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("pharmacy_id", pharmacy.id)
    .single();

  if (!order) return { error: "Order not found" };

  const allowed = TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot transition from ${order.status} to ${newStatus}` };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/pharmacy/dashboard/orders");
  revalidatePath(`/pharmacy/dashboard/orders/${orderId}`);
  return { error: null };
}
