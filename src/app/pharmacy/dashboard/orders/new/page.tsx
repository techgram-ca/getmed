import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import GoogleMapsScript from "@/components/Pharmacy/GoogleMapsScript";
import NewOrderForm from "./NewOrderForm";

export const metadata: Metadata = {
  title: "New Order — GetMed Pharmacy Portal",
};

export default async function NewOrderPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error } = await supabase
    .from("pharmacies")
    .select("id, display_name, status")
    .eq("user_id", user.id)
    .single();

  if (error || !pharmacy) redirect("/pharmacy/login");

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <GoogleMapsScript />
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[900px]">
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
              New Order
            </h1>
            <p className="text-sm text-[#6b8280] mt-1">
              Create a manual order on behalf of a patient.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-6 lg:p-8">
            <NewOrderForm />
          </div>
        </div>
      </main>
    </div>
  );
}
