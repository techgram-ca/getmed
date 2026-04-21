import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import PharmacyLanding from "@/components/GetMed/pharmacy/PharmacyLanding";

type Params      = Promise<{ slug: string }>;
type SearchParams = Promise<{ address?: string; lat?: string; lng?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("pharmacies")
    .select("display_name, city, province")
    .eq("url_slug", slug)
    .eq("status", "approved")
    .single();

  if (!data) return { title: "Pharmacy — GetMed" };
  return {
    title: `${data.display_name} — GetMed`,
    description: `Order prescriptions and medications online from ${data.display_name} in ${data.city}, ${data.province}.`,
  };
}

export default async function PharmacyPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug }    = await params;
  const { address } = await searchParams;

  const admin = createAdminClient();
  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select(
      "id, display_name, logo_url, full_address, city, province, phone, opening_hours, payment_methods, service_online_orders, service_delivery, service_consultation"
    )
    .eq("url_slug", slug)
    .eq("status", "approved")
    .single();

  if (!pharmacy) notFound();

  let pharmacist: {
    full_name: string;
    photo_url: string | null;
    qualification: string | null;
    years_of_experience: number | null;
    specialization: string[] | null;
    languages: string[] | null;
    bio: string | null;
    consultation_modes: string[] | null;
    consultation_fee: number | null;
  } | null = null;

  if (pharmacy.service_consultation) {
    const { data } = await admin
      .from("pharmacist_profiles")
      .select(
        "full_name, photo_url, qualification, years_of_experience, specialization, languages, bio, consultation_modes, consultation_fee"
      )
      .eq("pharmacy_id", pharmacy.id)
      .maybeSingle();
    pharmacist = data;
  }

  return (
    <PharmacyLanding
      pharmacy={pharmacy}
      pharmacist={pharmacist}
      defaultAddress={address ?? null}
    />
  );
}
