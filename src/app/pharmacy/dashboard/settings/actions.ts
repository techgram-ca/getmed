"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updatePharmacyDetailsAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const displayName  = fd.get("displayName")  as string;
  const contactName  = fd.get("contactName")  as string;
  const phone        = fd.get("phone")        as string;
  const onlineOrders = fd.get("onlineOrders") === "on";
  const delivery     = fd.get("delivery")     === "on";
  const consultation = fd.get("consultation") === "on";
  const paymentRaw   = fd.getAll("paymentMethods") as string[];

  // Handle optional logo upload
  let logoUrl: string | undefined;
  const logoFile = fd.get("logoFile") as File | null;
  if (logoFile && logoFile.size > 0) {
    const ext  = logoFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("pharmacy-logos")
      .upload(path, await logoFile.arrayBuffer(), { contentType: logoFile.type });
    if (!uploadErr) {
      const { data: { publicUrl } } = admin.storage
        .from("pharmacy-logos")
        .getPublicUrl(path);
      logoUrl = publicUrl;
    }
  }

  const updateData: Record<string, unknown> = {
    display_name:          displayName,
    contact_name:          contactName,
    phone,
    service_online_orders: onlineOrders,
    service_delivery:      delivery,
    service_consultation:  consultation,
    payment_methods:       paymentRaw,
  };

  if (logoUrl) updateData.logo_url = logoUrl;

  const { error } = await supabase
    .from("pharmacies")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/pharmacy/dashboard/settings");
  return { error: null };
}

export async function updatePharmacistAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: pharmacy } = await supabase
    .from("pharmacies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!pharmacy) return { error: "Pharmacy not found" };

  // Handle optional photo upload
  let photoUrl: string | undefined;
  const photoFile = fd.get("photoFile") as File | null;
  if (photoFile && photoFile.size > 0) {
    const ext  = photoFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/photo-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("pharmacist-photos")
      .upload(path, await photoFile.arrayBuffer(), { contentType: photoFile.type });
    if (!uploadErr) {
      const { data: { publicUrl } } = admin.storage
        .from("pharmacist-photos")
        .getPublicUrl(path);
      photoUrl = publicUrl;
    }
  }

  const fullName        = fd.get("fullName")      as string;
  const qualification   = fd.get("qualification") as string;
  const licenseNumber   = fd.get("licenseNumber") as string;
  const yearsStr        = fd.get("years")         as string;
  const years           = yearsStr ? parseInt(yearsStr, 10) : null;
  const specStr         = fd.get("specialization") as string;
  const specialization  = specStr ? specStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const langStr         = fd.get("languages")     as string;
  const languages       = langStr ? langStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const bio             = (fd.get("bio") as string) || null;
  const modes           = fd.getAll("modes")      as string[];
  const feeStr          = fd.get("fee")           as string;
  const fee             = feeStr ? parseFloat(feeStr) : null;

  const upsertData: Record<string, unknown> = {
    pharmacy_id:          pharmacy.id,
    full_name:            fullName,
    qualification,
    license_number:       licenseNumber,
    years_of_experience:  isNaN(years as number) ? null : years,
    specialization,
    languages,
    bio,
    consultation_modes:   modes,
    consultation_fee:     fee,
  };

  if (photoUrl) upsertData.photo_url = photoUrl;

  const { error } = await admin
    .from("pharmacist_profiles")
    .upsert(upsertData, { onConflict: "pharmacy_id" });

  if (error) return { error: error.message };

  revalidatePath("/pharmacy/dashboard/settings");
  return { error: null };
}

export async function updateLandingPageAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const heroTitle        = (fd.get("heroTitle")        as string) || null;
  const heroSubtitle     = (fd.get("heroSubtitle")     as string) || null;
  const aboutHeading     = (fd.get("aboutHeading")     as string) || null;
  const aboutDescription = (fd.get("aboutDescription") as string) || null;
  const statsRaw         = fd.get("landingStats")      as string | null;
  const landingStats     = statsRaw ? JSON.parse(statsRaw) : null;

  let heroImageUrl: string | undefined;
  const heroImageFile = fd.get("heroImageFile") as File | null;
  if (heroImageFile && heroImageFile.size > 0) {
    const ext  = heroImageFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/hero-${Date.now()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from("pharmacy-hero-images")
      .upload(path, await heroImageFile.arrayBuffer(), { contentType: heroImageFile.type });
    if (!uploadErr) {
      const { data: { publicUrl } } = admin.storage
        .from("pharmacy-hero-images")
        .getPublicUrl(path);
      heroImageUrl = publicUrl;
    }
  }

  const updateData: Record<string, unknown> = {
    hero_title:        heroTitle,
    hero_subtitle:     heroSubtitle,
    about_heading:     aboutHeading,
    about_description: aboutDescription,
    landing_stats:     landingStats,
  };

  if (heroImageUrl) updateData.hero_image_url = heroImageUrl;

  const { error } = await supabase
    .from("pharmacies")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/pharmacy/dashboard/settings");
  return { error: null };
}

export async function changePasswordAction(
  fd: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const newPassword     = fd.get("newPassword")     as string;
  const confirmPassword = fd.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };
  if (newPassword.length < 8)          return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { error: null };
}
