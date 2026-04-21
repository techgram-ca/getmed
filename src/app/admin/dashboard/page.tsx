import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, CheckCircle2, Clock, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";

export const metadata: Metadata = { title: "Admin Dashboard — GetMed" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const admin = createAdminClient();

  const [
    { data: pharmacyStatuses },
    { data: orderStatuses },
    { data: recentOrders },
    { data: recentPharmacies },
  ] = await Promise.all([
    admin.from("pharmacies").select("status"),
    admin.from("orders").select("status, order_type, delivery_type"),
    admin.from("orders")
      .select("id, order_type, patient_name, status, created_at, pharmacy_id")
      .order("created_at", { ascending: false })
      .limit(5),
    admin.from("pharmacies")
      .select("id, display_name, logo_url, city, province, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Pharmacy stats
  const phStats = { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
  pharmacyStatuses?.forEach(({ status }) => {
    phStats.total++;
    if (status in phStats) phStats[status as keyof typeof phStats]++;
  });

  // Order stats
  const ordStats = { total: 0, new: 0, processing: 0, ready: 0, completed: 0, cancelled: 0 };
  orderStatuses?.forEach(({ status }) => {
    ordStats.total++;
    if (status in ordStats) ordStats[status as keyof typeof ordStats]++;
  });

  // Pharmacy id → name map for recent orders
  const phIds = [...new Set((recentOrders ?? []).map((o) => o.pharmacy_id))];
  const { data: phNames } = await admin.from("pharmacies").select("id, display_name").in("id", phIds);
  const phMap: Record<string, string> = {};
  (phNames ?? []).forEach((p) => { phMap[p.id] = p.display_name; });

  const PHARMACY_STATUS_BADGE: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700",
    approved:  "bg-emerald-100 text-emerald-700",
    rejected:  "bg-red-100 text-red-700",
    suspended: "bg-orange-100 text-orange-700",
  };

  function orderBadge(status: string) {
    if (status === "new")        return "bg-sky-50 text-sky-700 border-sky-200";
    if (status === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "ready")      return "bg-violet-50 text-violet-700 border-violet-200";
    if (status === "completed")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "cancelled")  return "bg-red-50 text-red-500 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  function fmt(v: string) {
    return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1200px]">
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Admin Overview</h1>
            <p className="text-sm text-[#6b8280] mt-1">Platform snapshot across all pharmacies and orders.</p>
          </div>

          {/* Pharmacy stats */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0d1f1c]">Pharmacies</h2>
              <Link href="/admin/dashboard/pharmacies" className="no-underline text-xs text-[#2a9d8f] font-semibold hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: "Total",     value: phStats.total,     icon: Building2,    color: "bg-[#e0f5f2] text-[#2a9d8f]" },
                { label: "Pending",   value: phStats.pending,   icon: Clock,        color: "bg-amber-50 text-amber-600"   },
                { label: "Approved",  value: phStats.approved,  icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
                { label: "Rejected",  value: phStats.rejected,  icon: XCircle,      color: "bg-red-50 text-red-500"       },
                { label: "Suspended", value: phStats.suspended, icon: XCircle,      color: "bg-orange-50 text-orange-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#e2efed] p-4 shadow-sm">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-extrabold text-[#0d1f1c]">{value}</p>
                  <p className="text-xs text-[#6b8280] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Order stats */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0d1f1c]">Orders</h2>
              <Link href="/admin/dashboard/orders" className="no-underline text-xs text-[#2a9d8f] font-semibold hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total",      value: ordStats.total      },
                { label: "New",        value: ordStats.new        },
                { label: "Processing", value: ordStats.processing },
                { label: "Ready",      value: ordStats.ready      },
                { label: "Completed",  value: ordStats.completed  },
                { label: "Cancelled",  value: ordStats.cancelled  },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#e2efed] p-4 shadow-sm">
                  <p className="text-xl font-extrabold text-[#0d1f1c]">{value}</p>
                  <p className="text-xs text-[#6b8280] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Order type breakdown */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Order Breakdown</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Prescription", icon: Package, value: orderStatuses?.filter((o) => o.order_type === "prescription").length ?? 0, color: "bg-blue-50 text-blue-600" },
                { label: "Transfer",     icon: Package, value: orderStatuses?.filter((o) => o.order_type === "transfer").length ?? 0,     color: "bg-teal-50 text-teal-600" },
                { label: "OTC",          icon: ShoppingBag, value: orderStatuses?.filter((o) => o.order_type === "otc").length ?? 0,      color: "bg-purple-50 text-purple-600" },
                { label: "Delivery",     icon: Truck,   value: orderStatuses?.filter((o) => o.delivery_type === "delivery").length ?? 0,  color: "bg-orange-50 text-orange-600" },
              ].map(({ label, icon: Icon, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#e2efed] p-4 shadow-sm flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-[#0d1f1c]">{value}</p>
                    <p className="text-xs text-[#6b8280]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent orders */}
            <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e2efed] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0d1f1c]">Recent Orders</h2>
                <Link href="/admin/dashboard/orders" className="no-underline text-xs text-[#2a9d8f] hover:underline">See all</Link>
              </div>
              <div className="divide-y divide-[#f0f8f7]">
                {(recentOrders ?? []).map((o) => (
                  <Link key={o.id} href={`/admin/dashboard/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f8fffe] transition-colors no-underline group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d1f1c] truncate group-hover:text-[#2a9d8f]">{o.patient_name}</p>
                      <p className="text-xs text-[#6b8280]">{fmt(o.order_type)} · {phMap[o.pharmacy_id] ?? "—"}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${orderBadge(o.status)}`}>
                      {fmt(o.status)}
                    </span>
                  </Link>
                ))}
                {(recentOrders ?? []).length === 0 && (
                  <p className="px-5 py-6 text-sm text-[#6b8280] text-center">No orders yet.</p>
                )}
              </div>
            </section>

            {/* Recent pharmacies */}
            <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e2efed] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0d1f1c]">Recent Applications</h2>
                <Link href="/admin/dashboard/pharmacies" className="no-underline text-xs text-[#2a9d8f] hover:underline">See all</Link>
              </div>
              <div className="divide-y divide-[#f0f8f7]">
                {(recentPharmacies ?? []).map((ph) => (
                  <Link key={ph.id} href={`/admin/dashboard/pharmacies/${ph.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f8fffe] transition-colors no-underline group">
                    <div className="w-8 h-8 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden">
                      {ph.logo_url ? (
                        <img src={ph.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[0.6rem] font-extrabold text-[#2a9d8f]">{ph.display_name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d1f1c] truncate group-hover:text-[#2a9d8f]">{ph.display_name}</p>
                      <p className="text-xs text-[#6b8280]">{ph.city}, {ph.province}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PHARMACY_STATUS_BADGE[ph.status] ?? ""}`}>
                      {fmt(ph.status)}
                    </span>
                  </Link>
                ))}
                {(recentPharmacies ?? []).length === 0 && (
                  <p className="px-5 py-6 text-sm text-[#6b8280] text-center">No pharmacy applications yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
