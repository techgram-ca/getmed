import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ConsultBookingLanding from "@/components/GetMed/consult/ConsultBookingLanding";

type Params = Promise<{ pharmacyId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pharmacyId } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("pharmacies")
    .select("display_name")
    .eq("id", pharmacyId)
    .eq("status", "approved")
    .single();
  if (!data) return { title: "Book Consultation — GetMed" };
  return { title: `Book Consultation at ${data.display_name} — GetMed` };
}

export default async function ConsultBookingPage({ params }: { params: Params }) {
  const { pharmacyId } = await params;
  const admin = createAdminClient();

  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select(
      "id, display_name, logo_url, full_address, city, province, phone, opening_hours, payment_methods, service_online_orders, service_delivery, service_consultation"
    )
    .eq("id", pharmacyId)
    .eq("status", "approved")
    .eq("service_consultation", true)
    .single();

  if (!pharmacy) notFound();

  const { data: pharmacist } = await admin
    .from("pharmacist_profiles")
    .select(
      "full_name, photo_url, qualification, years_of_experience, specialization, languages, bio, consultation_modes, consultation_fee"
    )
    .eq("pharmacy_id", pharmacyId)
    .maybeSingle();

  return <ConsultBookingLanding pharmacy={pharmacy} pharmacist={pharmacist ?? null} />;
}
