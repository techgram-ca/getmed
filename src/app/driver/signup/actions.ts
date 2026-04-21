"use server";

import { createClient } from "@supabase/supabase-js";
import {
  sendSms,
  smsDriverSignupConfirmation,
  smsDriverSignupAdmin,
} from "@/lib/twilio";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function toSlug(name: string, city: string) {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(supabase: ReturnType<typeof adminClient>, base: string) {
  let slug = base;
  let attempt = 2;
  for (;;) {
    const { data } = await supabase
      .from("drivers")
      .select("id")
      .eq("url_slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${attempt++}`;
  }
}

export async function driverSignupAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = adminClient();

  const email       = fd.get("email")    as string;
  const password    = fd.get("password") as string;
  const fullName    = fd.get("fullName") as string;
  const phone       = fd.get("phone")   as string;
  const city        = fd.get("city")    as string;
  const province    = fd.get("province") as string;
  const postalCode  = fd.get("postalCode") as string;
  const vehicleType = fd.get("vehicleType") as string;
  const vehicleMake = fd.get("vehicleMake") as string;
  const vehicleModel = fd.get("vehicleModel") as string;
  const vehicleYear  = fd.get("vehicleYear") as string;
  const vehiclePlate = fd.get("vehiclePlate") as string;
  const licenseNumber = fd.get("licenseNumber") as string;
  const licenseExpiry = fd.get("licenseExpiry") as string;
  const licenseProvince = fd.get("licenseProvince") as string;
  const licenseFile = fd.get("licenseFile") as File | null;
  const photoFile   = fd.get("photoFile") as File | null;

  // 1. Create auth user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      app_metadata:  { role: "driver" },
      user_metadata: { full_name: fullName },
      email_confirm: true,
    });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "An account with this email already exists. Please sign in instead." };
    }
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // 2a. Upload profile photo (public bucket)
  let photoUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    const ext  = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${userId}/photo.${ext}`;
    const { error: photoErr } = await supabase.storage
      .from("driver-photos")
      .upload(path, await photoFile.arrayBuffer(), {
        contentType: photoFile.type,
        upsert: true,
      });
    if (!photoErr) {
      const { data } = supabase.storage.from("driver-photos").getPublicUrl(path);
      photoUrl = data.publicUrl;
    }
  }

  // 2b. Upload driver's license (private bucket)
  let licenseStoragePath: string | null = null;
  if (licenseFile && licenseFile.size > 0) {
    const ext  = licenseFile.name.split(".").pop() ?? "pdf";
    const path = `${userId}/license.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("driver-licenses")
      .upload(path, await licenseFile.arrayBuffer(), {
        contentType: licenseFile.type,
        upsert: true,
      });
    if (uploadErr) {
      await supabase.auth.admin.deleteUser(userId);
      return { error: `License upload failed: ${uploadErr.message}` };
    }
    licenseStoragePath = path;
  }

  // 3. Insert driver row
  const baseSlug = toSlug(fullName, city);
  const urlSlug  = await uniqueSlug(supabase, baseSlug);

  const { error: dbError } = await supabase
    .from("drivers")
    .insert({
      user_id:          userId,
      email,
      full_name:        fullName,
      phone,
      city,
      province,
      postal_code:      postalCode,
      vehicle_type:     vehicleType,
      vehicle_make:     vehicleMake   || null,
      vehicle_model:    vehicleModel  || null,
      vehicle_year:     vehicleYear   ? parseInt(vehicleYear) : null,
      vehicle_plate:    vehiclePlate  || null,
      license_number:   licenseNumber,
      license_expiry:   licenseExpiry || null,
      license_province: licenseProvince || null,
      license_url:      licenseStoragePath,
      photo_url:        photoUrl,
      url_slug:         urlSlug,
      status:           "pending",
    });

  if (dbError) {
    await supabase.auth.admin.deleteUser(userId);
    return { error: `Failed to save driver details: ${dbError.message}` };
  }

  // ── SMS notifications (non-fatal) ────────────────────────────
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  await Promise.all([
    sendSms(phone, smsDriverSignupConfirmation(fullName)),
    adminPhone
      ? sendSms(
          adminPhone,
          smsDriverSignupAdmin(fullName, city, province, vehicleType, phone)
        )
      : Promise.resolve(),
  ]);

  return { error: null };
}
