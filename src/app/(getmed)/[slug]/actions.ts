"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendSms,
  smsOrderConfirmationPatient,
  smsOrderConfirmationPharmacy,
} from "@/lib/twilio";

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

  async function uploadFiles(files: File[], prefix: string): Promise<string[]> {
    const paths: string[] = [];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `${pharmacyId}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await admin.storage
        .from("prescription-uploads")
        .upload(path, await file.arrayBuffer(), { contentType: file.type });
      if (!uploadErr) paths.push(path);
    }
    return paths;
  }

  // Order-type specific details
  let details: Record<string, unknown> = {};
  let prescriptionFilePaths: string[] = [];
  let insuranceFilePaths: string[]    = [];

  if (orderType === "prescription") {
    const rxFiles  = fd.getAll("prescriptionFiles") as File[];
    const insFiles = fd.getAll("insuranceFiles")    as File[];
    prescriptionFilePaths = await uploadFiles(rxFiles,  "rx");
    insuranceFilePaths    = await uploadFiles(insFiles, "ins");

    details = {
      healthCardNumber:      fd.get("healthCardNumber"),
      deliveryInstructions:  fd.get("deliveryInstructions"),
      consent:               fd.get("consent") === "on",
      prescriptionFilePaths,
      insuranceFilePaths,
    };
  } else if (orderType === "transfer") {
    const rxFiles  = fd.getAll("prescriptionFiles") as File[];
    const insFiles = fd.getAll("insuranceFiles")    as File[];
    prescriptionFilePaths = await uploadFiles(rxFiles,  "rx");
    insuranceFilePaths    = await uploadFiles(insFiles, "ins");

    details = {
      currentPharmacyName:  fd.get("currentPharmacyName"),
      currentPharmacyPhone: fd.get("currentPharmacyPhone"),
      rxNumber:             fd.get("rxNumber"),
      medicationName:       fd.get("medicationName"),
      doctorName:           fd.get("doctorName"),
      healthCardNumber:     fd.get("healthCardNumber") || null,
      consent:              fd.get("consent") === "on",
      notes:                fd.get("notes"),
      prescriptionFilePaths,
      insuranceFilePaths,
    };
  } else if (orderType === "otc") {
    const rawFiles = fd.getAll("files") as File[];
    prescriptionFilePaths = await uploadFiles(rawFiles, "otc");

    details = {
      productName:     fd.get("productName"),
      quantity:        fd.get("quantity"),
      brandPreference: fd.get("brandPreference"),
      symptoms:        fd.get("symptoms"),
      notes:           fd.get("notes"),
    };
  }

  const allFilePaths = [...prescriptionFilePaths, ...insuranceFilePaths];

  const { data, error } = await admin.from("orders").insert({
    pharmacy_id:   pharmacyId,
    order_type:    orderType,
    patient_name:  patientName,
    patient_phone: patientPhone,
    patient_email: patientEmail || null,
    delivery_type: deliveryType,
    address:       deliveryType === "delivery" ? (address || null) : null,
    details,
    file_urls:     allFilePaths,
  }).select("id").single();

  if (error) return { error: error.message };

  // ── SMS notifications (non-fatal) ────────────────────────────
  const orderId = (data as { id: string } | null)?.id ?? "";

  // Fetch pharmacy display name + phone for messages
  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select("display_name, phone")
    .eq("id", pharmacyId)
    .single();

  const pharmacyName  = pharmacy?.display_name ?? "the pharmacy";
  const pharmacyPhone = pharmacy?.phone ?? "";

  await Promise.all([
    sendSms(
      patientPhone,
      smsOrderConfirmationPatient(patientName, pharmacyName, orderType, orderId)
    ),
    pharmacyPhone
      ? sendSms(
          pharmacyPhone,
          smsOrderConfirmationPharmacy(patientName, patientPhone, orderType, deliveryType)
        )
      : Promise.resolve(),
  ]);

  return { error: null };
}
