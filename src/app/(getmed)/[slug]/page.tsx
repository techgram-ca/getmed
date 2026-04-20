import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import PharmacyHeader from "@/components/GetMed/pharmacy/PharmacyHeader";
import OrderTabs from "@/components/GetMed/pharmacy/OrderTabs";

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
      "id, display_name, logo_url, full_address, city, province, phone, opening_hours, service_online_orders, service_delivery, service_consultation"
    )
    .eq("url_slug", slug)
    .eq("status", "approved")
    .single();

  if (!pharmacy) notFound();

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      <PharmacyHeader pharmacy={pharmacy} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-[#0d1f1c]">Place an Order</h2>
          <p className="text-sm text-[#6b8280] mt-1">
            Choose your order type and fill in your details below.
          </p>
        </div>

        <OrderTabs
          pharmacyId={pharmacy.id}
          address={address ?? null}
          hasDelivery={pharmacy.service_delivery}
        />
      </div>
    </div>
  );
}
