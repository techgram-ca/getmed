import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import Overview from "@/components/Pharmacy/dashboard/Overview";

export const metadata: Metadata = {
  title: "Dashboard — GetMed Pharmacy Portal",
};

export default async function PharmacyDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error } = await supabase
    .from("pharmacies")
    .select(
      "id, display_name, status, contact_name, city, province, service_online_orders, service_delivery, service_consultation, created_at"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !pharmacy) redirect("/pharmacy/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_type, patient_name, patient_phone, patient_email, delivery_type, address, details, file_urls, status, created_at"
    )
    .eq("pharmacy_id", pharmacy.id)
    .order("created_at", { ascending: false });

  const ordersWithFiles = await Promise.all(
    (orders ?? []).map(async (order) => {
      if (!order.file_urls || order.file_urls.length === 0) {
        return { ...order, files: [] as { path: string; url: string | null }[] };
      }

      const { data: signedFiles } = await supabase.storage
        .from("prescription-uploads")
        .createSignedUrls(order.file_urls, 60 * 60);

      const files = (order.file_urls as string[]).map((path: string, index: number) => ({
        path,
        url: signedFiles?.[index]?.signedUrl ?? null,
      }));

      return { ...order, files };
    })
  );

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />
      <main className="flex-1 lg:pt-0 pt-14">
        <Overview pharmacy={pharmacy} orders={ordersWithFiles} />
      </main>
    </div>
  );
}
