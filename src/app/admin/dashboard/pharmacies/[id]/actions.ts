"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== "admin") redirect("/admin/login");
}

export async function approvePharmacyAction(fd: FormData) {
  await assertAdmin();
  const id = fd.get("pharmacyId") as string;

  const admin = createAdminClient();
  await admin
    .from("pharmacies")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", id);

  redirect(`/admin/dashboard/pharmacies/${id}?flash=approved`);
}

export async function rejectPharmacyAction(fd: FormData) {
  await assertAdmin();
  const id     = fd.get("pharmacyId") as string;
  const reason = (fd.get("reason") as string).trim();

  if (!reason) redirect(`/admin/dashboard/pharmacies/${id}?error=reason_required`);

  const admin = createAdminClient();
  await admin
    .from("pharmacies")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", id);

  redirect(`/admin/dashboard/pharmacies/${id}?flash=rejected`);
}
