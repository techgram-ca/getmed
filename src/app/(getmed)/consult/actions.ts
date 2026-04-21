"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface BookConsultationResult {
  error: string | null;
}

export async function bookConsultationAction(
  fd: FormData
): Promise<BookConsultationResult> {
  const admin       = createAdminClient();
  const pharmacyId  = fd.get("pharmacyId")  as string;
  const patientName = fd.get("name")         as string;
  const phone       = fd.get("phone")        as string;
  const email       = fd.get("email")        as string | null;
  const condition   = fd.get("condition")    as string | null;
  const notes       = fd.get("notes")        as string | null;

  if (!pharmacyId || !patientName || !phone) {
    return { error: "Missing required fields." };
  }

  const { error } = await admin.from("consultations").insert({
    pharmacy_id:   pharmacyId,
    patient_name:  patientName,
    patient_phone: phone,
    patient_email: email || null,
    condition:     condition || null,
    notes:         notes || null,
    status:        "pending",
  });

  if (error) return { error: error.message };
  return { error: null };
}
