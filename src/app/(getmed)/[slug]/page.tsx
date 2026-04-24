import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import PharmacyPublicPage from "@/components/GetMed/pharmacy/PharmacyPublicPage";

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
    title: `${data.display_name} — ${data.city} Pharmacy | GetMed`,
    description: `${data.display_name} in ${data.city}, ${data.province}. Transfer prescriptions, order medications online, and consult with a licensed pharmacist.`,
  };
}

export default async function PharmacyLandingPage({
  params,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;

  const admin = createAdminClient();
  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select(
      "id, display_name, logo_url, full_address, city, province, phone, service_online_orders, service_delivery, service_consultation, hero_image_url, hero_title, hero_subtitle, about_heading, about_description, landing_stats"
    )
    .eq("url_slug", slug)
    .eq("status", "approved")
    .single();

  if (!pharmacy) notFound();

  return <PharmacyPublicPage pharmacy={pharmacy} slug={slug} />;
}
