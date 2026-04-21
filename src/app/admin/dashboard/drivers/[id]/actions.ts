"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  sendSms,
  smsDriverApproved,
  smsDriverRejected,
  smsDriverSuspended,
  smsDriverReactivated,
} from "@/lib/twilio";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");
}

export async function approveDriverAction(fd: FormData) {
  await assertAdmin();
  const id    = fd.get("driverId") as string;
  const admin = createAdminClient();

  const { data: driver } = await admin
    .from("drivers")
    .select("full_name, phone")
    .eq("id", id)
    .single();

  await admin
    .from("drivers")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", id);

  if (driver?.phone) {
    await sendSms(driver.phone, smsDriverApproved(driver.full_name));
  }

  redirect(`/admin/dashboard/drivers/${id}?flash=approved`);
}

export async function rejectDriverAction(fd: FormData) {
  await assertAdmin();
  const id     = fd.get("driverId") as string;
  const reason = (fd.get("reason") as string).trim();

  if (!reason) redirect(`/admin/dashboard/drivers/${id}?error=reason_required`);

  const admin = createAdminClient();

  const { data: driver } = await admin
    .from("drivers")
    .select("full_name, phone")
    .eq("id", id)
    .single();

  await admin
    .from("drivers")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", id);

  if (driver?.phone) {
    await sendSms(driver.phone, smsDriverRejected(driver.full_name, reason));
  }

  redirect(`/admin/dashboard/drivers/${id}?flash=rejected`);
}

export async function suspendDriverAction(fd: FormData) {
  await assertAdmin();
  const id    = fd.get("driverId") as string;
  const admin = createAdminClient();

  const { data: driver } = await admin
    .from("drivers")
    .select("full_name, phone")
    .eq("id", id)
    .single();

  await admin
    .from("drivers")
    .update({ status: "suspended", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (driver?.phone) {
    await sendSms(driver.phone, smsDriverSuspended(driver.full_name));
  }

  redirect(`/admin/dashboard/drivers/${id}?flash=suspended`);
}

export async function reactivateDriverAction(fd: FormData) {
  await assertAdmin();
  const id    = fd.get("driverId") as string;
  const admin = createAdminClient();

  const { data: driver } = await admin
    .from("drivers")
    .select("full_name, phone")
    .eq("id", id)
    .single();

  await admin
    .from("drivers")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", id);

  if (driver?.phone) {
    await sendSms(driver.phone, smsDriverReactivated(driver.full_name));
  }

  redirect(`/admin/dashboard/drivers/${id}?flash=reactivated`);
}
