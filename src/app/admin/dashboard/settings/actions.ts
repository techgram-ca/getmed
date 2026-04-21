"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");
}

export async function adminChangePasswordAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") return { error: "Not authorized" };

  const newPassword     = fd.get("newPassword")     as string;
  const confirmPassword = fd.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) return { error: "Passwords do not match." };
  if (newPassword.length < 8)          return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateRadiusAction(fd: FormData) {
  await assertAdmin();
  const radius = parseInt(fd.get("radius") as string, 10);
  if (isNaN(radius) || radius < 1 || radius > 100) return;

  const admin = createAdminClient();
  await admin
    .from("app_settings")
    .upsert({ key: "search_radius_km", value: radius.toString(), updated_at: new Date().toISOString() });

  redirect("/admin/dashboard/settings?flash=saved");
}
