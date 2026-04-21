import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, HeartPulse, LogOut, MapPin, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AssignedOrdersList, { type AssignedOrder } from "@/components/Driver/dashboard/AssignedOrdersList";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/driver/login");
}

export default async function DriverDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/driver/login");

  const admin = createAdminClient();

  const { data: driver } = await admin
    .from("drivers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!driver) redirect("/driver/login");
  if (driver.status !== "approved") redirect("/driver/login");

  // Fetch assigned orders
  const { data: ordersRaw } = await admin
    .from("orders")
    .select("id, order_type, patient_name, patient_phone, delivery_type, address, status, pharmacy_id, created_at")
    .eq("assigned_driver_id", driver.id)
    .in("status", ["ready", "dispatched"])
    .order("created_at", { ascending: true });

  // Fetch pharmacy info for each unique pharmacy
  const pharmacyIds = [...new Set((ordersRaw ?? []).map((o) => o.pharmacy_id))];
  const { data: pharmaciesRaw } = pharmacyIds.length > 0
    ? await admin
        .from("pharmacies")
        .select("id, display_name, full_address, city, province, lat, lng")
        .in("id", pharmacyIds)
    : { data: [] };

  const pharmacyMap = Object.fromEntries((pharmaciesRaw ?? []).map((p) => [p.id, p]));

  const orders: AssignedOrder[] = (ordersRaw ?? []).map((o) => ({
    id: o.id,
    order_type: o.order_type,
    patient_name: o.patient_name,
    patient_phone: o.patient_phone,
    delivery_type: o.delivery_type,
    address: o.address,
    status: o.status,
    pharmacy_id: o.pharmacy_id,
    created_at: o.created_at,
    pharmacy: pharmacyMap[o.pharmacy_id] ?? null,
  }));

  const vehicleLabel = [driver.vehicle_make, driver.vehicle_model, driver.vehicle_year]
    .filter(Boolean).join(" ") || driver.vehicle_type || "—";

  return (
    <div className="min-h-screen bg-[#f0faf8]">
      {/* Sticky mobile header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#e2efed] safe-area-top">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-[7px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
              <span className="text-[#6b8280] font-medium ml-1.5">Driver</span>
            </span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-[#6b8280] hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-2"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-10">
        {/* Driver profile strip */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-4 mb-5 flex items-center gap-3">
          {driver.photo_url ? (
            <img src={driver.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#e2efed] shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#e0f5f2] flex items-center justify-center border-2 border-[#e2efed] shrink-0">
              <User className="w-5 h-5 text-[#2a9d8f]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-[#0d1f1c] truncate">{driver.full_name}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[0.6rem] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-[#0d1f1c] truncate max-w-[120px]">{vehicleLabel}</p>
            <p className="text-[0.65rem] text-[#6b8280] flex items-center gap-0.5 justify-end">
              <MapPin className="w-2.5 h-2.5" />{driver.city}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-[#e2efed] p-3 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-[#2a9d8f]">
              {orders.filter((o) => o.status === "ready").length}
            </p>
            <p className="text-[0.65rem] text-[#6b8280] mt-0.5 font-semibold uppercase tracking-wide">To Pick Up</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2efed] p-3 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-teal-600">
              {orders.filter((o) => o.status === "dispatched").length}
            </p>
            <p className="text-[0.65rem] text-[#6b8280] mt-0.5 font-semibold uppercase tracking-wide">Out for Delivery</p>
          </div>
        </div>

        {/* Assigned orders list */}
        <AssignedOrdersList orders={orders} />
      </main>
    </div>
  );
}
