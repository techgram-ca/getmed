"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");
}

export async function assignDriverAction(
  orderId: string,
  driverId: string | null
): Promise<{ error: string | null }> {
  await assertAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("orders")
    .update({ assigned_driver_id: driverId || null })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/admin/dashboard/orders");
  return { error: null };
}
