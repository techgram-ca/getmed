"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getDriverUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateDriverProfileAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const { user } = await getDriverUser();
  if (!user) return { error: "Not authenticated" };

  const vehicleYear = fd.get("vehicle_year") as string;

  const admin = createAdminClient();
  const { error } = await admin
    .from("drivers")
    .update({
      full_name:    (fd.get("full_name")    as string).trim(),
      phone:        (fd.get("phone")        as string).trim(),
      city:         (fd.get("city")         as string).trim(),
      province:     (fd.get("province")     as string).trim(),
      postal_code:  (fd.get("postal_code")  as string).trim(),
      vehicle_type: (fd.get("vehicle_type") as string).trim() || null,
      vehicle_make: (fd.get("vehicle_make") as string).trim() || null,
      vehicle_model:(fd.get("vehicle_model")as string).trim() || null,
      vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
      vehicle_plate:(fd.get("vehicle_plate")as string).trim() || null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/driver/dashboard/account");
  return { error: null };
}

export async function changeDriverPasswordAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const { supabase, user } = await getDriverUser();
  if (!user) return { error: "Not authenticated" };

  const newPassword     = fd.get("newPassword")     as string;
  const confirmPassword = fd.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) return { error: "Passwords do not match." };
  if (newPassword.length < 8)          return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}
