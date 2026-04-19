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
      "display_name, status, contact_name, city, province, service_online_orders, service_delivery, service_consultation, created_at"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !pharmacy) redirect("/pharmacy/login");

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />
      <main className="flex-1 lg:pt-0 pt-14">
        <Overview pharmacy={pharmacy} />
      </main>
    </div>
  );
}
