"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendSms, smsStatusUpdate } from "@/lib/twilio";

const TRANSITIONS: Record<string, string[]> = {
  new:        ["processing", "cancelled"],
  processing: ["ready",      "cancelled"],
  cancelled:  ["processing"],
  ready:      ["cancelled"],
  dispatched: [],
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
    .select("id, status, patient_name, patient_phone, delivery_type")
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

  // ── SMS to patient (non-fatal) ────────────────────────────────
  const message = smsStatusUpdate(newStatus, order.patient_name, order.delivery_type);
  if (message && order.patient_phone) {
    await sendSms(order.patient_phone, message);
  }

  revalidatePath("/pharmacy/dashboard/orders");
  revalidatePath(`/pharmacy/dashboard/orders/${orderId}`);
  return { error: null };
}
