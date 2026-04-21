"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getDriverId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id ?? null;
}

export async function markDispatchedAction(
  orderIds: string[]
): Promise<{ error: string | null }> {
  const driverId = await getDriverId();
  if (!driverId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "dispatched" })
    .in("id", orderIds)
    .eq("assigned_driver_id", driverId)
    .eq("status", "ready");

  if (error) return { error: error.message };
  revalidatePath("/driver/dashboard");
  return { error: null };
}

export async function markDeliveredAction(
  orderId: string
): Promise<{ error: string | null }> {
  const driverId = await getDriverId();
  if (!driverId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("assigned_driver_id", driverId)
    .eq("status", "dispatched");

  if (error) return { error: error.message };
  revalidatePath("/driver/dashboard");
  return { error: null };
}
