"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");
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
