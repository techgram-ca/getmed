import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import PharmacyDetailsForm from "@/components/Pharmacy/dashboard/settings/PharmacyDetailsForm";
import PharmacistDetailsForm from "@/components/Pharmacy/dashboard/settings/PharmacistDetailsForm";
import LandingPageForm from "@/components/Pharmacy/dashboard/settings/LandingPageForm";
import PasswordChangeForm from "@/components/Pharmacy/dashboard/settings/PasswordChangeForm";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Settings — GetMed Pharmacy Portal",
};

export default async function PharmacySettingsPage() {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error } = await supabase
    .from("pharmacies")
    .select(
      "id, display_name, contact_name, phone, legal_name, full_address, city, province, postal_code, license_number, logo_url, service_online_orders, service_delivery, service_consultation, payment_methods, status, hero_image_url, hero_title, hero_subtitle, about_heading, about_description, landing_stats"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !pharmacy) redirect("/pharmacy/login");

  const { data: pharmacist } = await admin
    .from("pharmacist_profiles")
    .select("*")
    .eq("pharmacy_id", pharmacy.id)
    .maybeSingle();

  const pharmacyEmail = user.email ?? null;

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[900px]">
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Settings</h1>
            <p className="text-sm text-[#6b8280] mt-1">Manage your pharmacy profile and account.</p>
          </div>

          {/* Read-only pharmacy info */}
          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mb-6">
            <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Pharmacy Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
              <div>
                <dt className="text-[#6b8280]">Legal Name</dt>
                <dd className="font-semibold text-[#0d1f1c]">{pharmacy.legal_name}</dd>
              </div>
              <div>
                <dt className="text-[#6b8280]">Email</dt>
                <dd className="font-semibold text-[#0d1f1c]">{pharmacyEmail ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[#6b8280]">License Number</dt>
                <dd className="font-semibold text-[#0d1f1c]">{pharmacy.license_number}</dd>
              </div>
              <div>
                <dt className="text-[#6b8280]">Address</dt>
                <dd className="font-semibold text-[#0d1f1c]">{pharmacy.full_address}</dd>
              </div>
              <div>
                <dt className="text-[#6b8280]">City</dt>
                <dd className="font-semibold text-[#0d1f1c]">{pharmacy.city}, {pharmacy.province} {pharmacy.postal_code}</dd>
              </div>
            </dl>

            <div className="border-t border-[#e2efed] pt-5">
              <PharmacyDetailsForm pharmacy={pharmacy} />
            </div>
          </section>

          {/* Pharmacist profile (only for consultation-enabled pharmacies) */}
          {pharmacy.service_consultation && (
            <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mb-6">
              <PharmacistDetailsForm pharmacist={pharmacist ?? null} />
            </section>
          )}

          {/* Landing page customisation */}
          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mb-6">
            <LandingPageForm
              pharmacy={{
                hero_image_url:    pharmacy.hero_image_url    ?? null,
                hero_title:        pharmacy.hero_title        ?? null,
                hero_subtitle:     pharmacy.hero_subtitle     ?? null,
                about_heading:     pharmacy.about_heading     ?? null,
                about_description: pharmacy.about_description ?? null,
                landing_stats:     pharmacy.landing_stats     ?? null,
              }}
            />
          </section>

          {/* Password change */}
          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Change Password</h2>
            <PasswordChangeForm />
          </section>
        </div>
      </main>
    </div>
  );
}
