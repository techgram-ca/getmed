import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import AdminOrdersClient from "@/components/Admin/dashboard/AdminOrdersClient";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = { title: "Orders — GetMed Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const admin = createAdminClient();

  // Load ALL orders at once — filtering is done client-side
  const { data: ordersRaw } = await admin
    .from("orders")
    .select("id, order_type, patient_name, patient_phone, delivery_type, address, status, order_source, pharmacy_id, assigned_driver_id, created_at")
    .order("created_at", { ascending: false });

  // All approved pharmacies for filter dropdown + name lookup
  const { data: pharmacies } = await admin
    .from("pharmacies")
    .select("id, display_name, city, province")
    .order("display_name");

  // All approved drivers for assignment dropdown
  const { data: drivers } = await admin
    .from("drivers")
    .select("id, full_name, city, province")
    .eq("status", "approved")
    .order("full_name");

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Orders</h1>
              <p className="text-sm text-[#6b8280] mt-1">View and manage all orders. Filters apply instantly without reloading.</p>
            </div>
            <RefreshButton />
          </div>

          <AdminOrdersClient
            orders={ordersRaw ?? []}
            pharmacies={pharmacies ?? []}
            drivers={drivers ?? []}
          />
        </div>
      </main>
    </div>
  );
}
