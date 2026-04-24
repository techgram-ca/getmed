"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createManualOrderAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pharmacy) return { error: "Pharmacy not found." };

  const admin        = createAdminClient();
  const patientName  = fd.get("name")         as string;
  const patientPhone = fd.get("phone")        as string;
  const patientEmail = fd.get("email")        as string | null;
  const address      = fd.get("address")      as string | null;
  const deliveryInstructions = fd.get("deliveryInstructions") as string | null;

  const details: Record<string, unknown> = {};
  if (deliveryInstructions?.trim()) {
    details.deliveryInstructions = deliveryInstructions.trim();
  }

  const { error } = await admin.from("orders").insert({
    pharmacy_id:   pharmacy.id,
    order_type:    "prescription",
    patient_name:  patientName,
    patient_phone: patientPhone,
    patient_email: patientEmail || null,
    delivery_type: "delivery",
    address:       address || null,
    details,
    file_urls:     [],
    status:        "ready",
    order_source:  "manual",
  });

  if (error) return { error: error.message };
  return { error: null };
}
