"use server";

import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------
// Service-role admin client — server only, never exposed to browser.
// Used to create auth users and write DB records during signup
// (before the user has an active session).
// ----------------------------------------------------------------
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ----------------------------------------------------------------
// pharmacySignupAction
//
// Receives a FormData payload from the signup form and:
//   1. Creates a Supabase Auth user
//   2. Uploads license file (pharmacy-licenses bucket)
//   3. Inserts a row into public.pharmacies
//   4. (Conditional) Uploads pharmacist photo and inserts
//      a row into public.pharmacist_profiles
//
// Any partial failure rolls back the auth user so the form can
// be re-submitted cleanly.
// ----------------------------------------------------------------
export async function pharmacySignupAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = adminClient();

  // ── Parse fields ──────────────────────────────────────────────
  const email    = fd.get("email")    as string;
  const password = fd.get("password") as string;
  const contact  = fd.get("contactName") as string;
  const phone    = fd.get("phone")    as string;

  const pharmacy    = JSON.parse(fd.get("pharmacy")    as string);
  const services    = JSON.parse(fd.get("services")    as string);
  const pharmacistJson = fd.get("pharmacist") as string | null;

  const logoFile        = fd.get("logoFile")        as File | null;
  const licenseFile     = fd.get("licenseFile")     as File | null;
  const pharmacistPhoto = fd.get("pharmacistPhoto") as File | null;

  // ── 1. Create auth user ───────────────────────────────────────
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: "pharmacy", contact_name: contact },
      email_confirm: false, // sends a verification email
    });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "An account with this email already exists. Please sign in instead." };
    }
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // ── 2a. Upload pharmacy logo ──────────────────────────────────
  let logoUrl: string | null = null;

  if (logoFile && logoFile.size > 0) {
    const ext  = logoFile.name.split(".").pop() ?? "png";
    const path = `${userId}/logo.${ext}`;

    const { error: logoUploadError } = await supabase.storage
      .from("pharmacy-logos")
      .upload(path, await logoFile.arrayBuffer(), {
        contentType: logoFile.type,
        upsert: true,
      });

    if (!logoUploadError) {
      const { data } = supabase.storage.from("pharmacy-logos").getPublicUrl(path);
      logoUrl = data.publicUrl;
    }
  }

  // ── 2b. Upload pharmacy license ───────────────────────────────
  let licenseStoragePath: string | null = null;

  if (licenseFile && licenseFile.size > 0) {
    const ext  = licenseFile.name.split(".").pop() ?? "pdf";
    const path = `${userId}/license.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("pharmacy-licenses")
      .upload(path, await licenseFile.arrayBuffer(), {
        contentType: licenseFile.type,
        upsert: true,
      });

    if (uploadError) {
      await supabase.auth.admin.deleteUser(userId);
      return { error: `License upload failed: ${uploadError.message}` };
    }

    licenseStoragePath = path; // stored as path; use signed URL to retrieve
  }

  // ── 3. Insert pharmacy row ────────────────────────────────────
  const { data: pharmacyRow, error: pharmacyError } = await supabase
    .from("pharmacies")
    .insert({
      user_id:              userId,
      contact_name:         contact,
      phone,
      legal_name:           pharmacy.legalName,
      display_name:         pharmacy.displayName,
      logo_url:             logoUrl,
      full_address:         pharmacy.address.fullAddress,
      unit:                 pharmacy.address.unit      || null,
      city:                 pharmacy.address.city,
      province:             pharmacy.address.province,
      postal_code:          pharmacy.address.postalCode,
      lat:                  pharmacy.address.lat       || null,
      lng:                  pharmacy.address.lng       || null,
      license_number:       pharmacy.licenseNumber,
      license_url:          licenseStoragePath,
      opening_hours:        pharmacy.openingHours,
      payment_methods:      pharmacy.paymentMethods,
      service_online_orders: services.onlineOrders,
      service_delivery:     services.delivery,
      service_consultation: services.consultation,
    })
    .select("id")
    .single();

  if (pharmacyError) {
    await supabase.auth.admin.deleteUser(userId);
    return { error: `Failed to save pharmacy details: ${pharmacyError.message}` };
  }

  // ── 4. Pharmacist profile (consultation service only) ─────────
  if (services.consultation && pharmacistJson) {
    const ph = JSON.parse(pharmacistJson);

    // Upload pharmacist photo
    let photoUrl: string | null = null;
    if (pharmacistPhoto && pharmacistPhoto.size > 0) {
      const ext  = pharmacistPhoto.name.split(".").pop() ?? "jpg";
      const path = `${userId}/pharmacist.${ext}`;

      const { error: photoError } = await supabase.storage
        .from("pharmacist-photos")
        .upload(path, await pharmacistPhoto.arrayBuffer(), {
          contentType: pharmacistPhoto.type,
          upsert: true,
        });

      if (!photoError) {
        const { data } = supabase.storage
          .from("pharmacist-photos")
          .getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }

    const modes = (Object.entries(ph.modes) as [string, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k);

    const { error: phError } = await supabase
      .from("pharmacist_profiles")
      .insert({
        pharmacy_id:          pharmacyRow.id,
        full_name:            ph.fullName,
        photo_url:            photoUrl,
        qualification:        ph.qualification,
        license_number:       ph.licenseNumber,
        years_of_experience:  ph.yearsOfExperience ? parseInt(ph.yearsOfExperience) : null,
        specialization:       splitCSV(ph.specialization),
        languages:            splitCSV(ph.languages),
        bio:                  ph.bio       || null,
        availability_hours:   ph.availabilityHours,
        consultation_modes:   modes,
        consultation_fee:     ph.fee       ? parseFloat(ph.fee) : null,
      });

    if (phError) {
      // Non-fatal: pharmacy row exists, pharmacist profile failed.
      // Log server-side; the admin can fix via dashboard.
      console.error("[signup] pharmacist_profiles insert failed:", phError.message);
    }
  }

  return { error: null };
}

// ── Helpers ──────────────────────────────────────────────────────
function splitCSV(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
