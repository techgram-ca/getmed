"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePharmacyDetailsAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const displayName  = fd.get("displayName")  as string;
  const contactName  = fd.get("contactName")  as string;
  const phone        = fd.get("phone")        as string;
  const onlineOrders = fd.get("onlineOrders") === "on";
  const delivery     = fd.get("delivery")     === "on";
  const consultation = fd.get("consultation") === "on";
  const paymentRaw   = fd.getAll("paymentMethods") as string[];

  const { error } = await supabase
    .from("pharmacies")
    .update({
      display_name:          displayName,
      contact_name:          contactName,
      phone,
      service_online_orders: onlineOrders,
      service_delivery:      delivery,
      service_consultation:  consultation,
      payment_methods:       paymentRaw,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/pharmacy/dashboard/settings");
  return { error: null };
}

export async function changePasswordAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const newPassword     = fd.get("newPassword")     as string;
  const confirmPassword = fd.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { error: null };
}
