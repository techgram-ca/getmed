import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DriverHistory from "@/components/Driver/dashboard/DriverHistory";

export default async function DriverHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/driver/login");

  const admin = createAdminClient();
  const { data: driver } = await admin
    .from("drivers")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (!driver || driver.status !== "approved") redirect("/driver/login");

  // Load ALL delivery history for this driver
  const { data: ordersRaw } = await admin
    .from("orders")
    .select("id, order_type, patient_name, delivery_type, address, status, pharmacy_id, created_at")
    .eq("assigned_driver_id", driver.id)
    .order("created_at", { ascending: false });

  // Fetch pharmacy names
  const pharmacyIds = [...new Set((ordersRaw ?? []).map((o) => o.pharmacy_id))];
  const { data: pharmaciesRaw } = pharmacyIds.length > 0
    ? await admin.from("pharmacies").select("id, display_name, city").in("id", pharmacyIds)
    : { data: [] };
  const pharmacyMap = Object.fromEntries((pharmaciesRaw ?? []).map((p) => [p.id, p]));

  const orders = (ordersRaw ?? []).map((o) => ({
    ...o,
    pharmacy_name: pharmacyMap[o.pharmacy_id]?.display_name ?? "—",
    pharmacy_city: pharmacyMap[o.pharmacy_id]?.city ?? "",
  }));

  return <DriverHistory orders={orders} />;
}
