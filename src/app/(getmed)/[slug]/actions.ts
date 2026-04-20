"use server";

import { createAdminClient } from "@/lib/supabase/admin";

function toSlug(displayName: string, city: string) {
  return `${displayName}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(supabase: ReturnType<typeof createAdminClient>, base: string) {
  let slug = base;
  let attempt = 2;
  for (;;) {
    const { data } = await supabase
      .from("pharmacies")
      .select("id")
      .eq("url_slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${attempt++}`;
  }
}

export async function submitOrderAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const admin        = createAdminClient();
  const pharmacyId   = fd.get("pharmacyId")   as string;
  const orderType    = fd.get("orderType")     as string;
  const patientName  = fd.get("name")          as string;
  const patientPhone = fd.get("phone")         as string;
  const patientEmail = fd.get("email")         as string | null;
  const deliveryType = fd.get("deliveryType")  as string;
  const address      = fd.get("address")       as string | null;

  // Order-type specific details
  let details: Record<string, unknown> = {};
  if (orderType === "prescription") {
    details = {
      healthCardNumber:     fd.get("healthCardNumber"),
      deliveryInstructions: fd.get("deliveryInstructions"),
      consent:              fd.get("consent") === "on",
    };
  } else if (orderType === "transfer") {
    details = {
      currentPharmacyName:  fd.get("currentPharmacyName"),
      currentPharmacyPhone: fd.get("currentPharmacyPhone"),
      rxNumber:             fd.get("rxNumber"),
      medicationName:       fd.get("medicationName"),
      doctorName:           fd.get("doctorName"),
      consent:              fd.get("consent") === "on",
      notes:                fd.get("notes"),
    };
  } else if (orderType === "otc") {
    details = {
      productName:      fd.get("productName"),
      quantity:         fd.get("quantity"),
      brandPreference:  fd.get("brandPreference"),
      symptoms:         fd.get("symptoms"),
      notes:            fd.get("notes"),
    };
  }

  // Upload all files to prescription-uploads bucket
  const fileUrls: string[] = [];
  const files = fd.getAll("files") as File[];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${pharmacyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("prescription-uploads")
      .upload(path, await file.arrayBuffer(), { contentType: file.type });
    if (!uploadErr) fileUrls.push(path);
  }

  const { error } = await admin.from("orders").insert({
    pharmacy_id:   pharmacyId,
    order_type:    orderType,
    patient_name:  patientName,
    patient_phone: patientPhone,
    patient_email: patientEmail || null,
    delivery_type: deliveryType,
    address:       deliveryType === "delivery" ? (address || null) : null,
    details,
    file_urls:     fileUrls,
  });

  if (error) return { error: error.message };
  return { error: null };
}

