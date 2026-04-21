import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";

export const metadata: Metadata = { title: "Orders — GetMed Admin" };

const PAGE_SIZE = 15;

const STATUS_OPTIONS  = ["all", "new", "processing", "ready", "completed", "cancelled"] as const;
const TYPE_OPTIONS    = ["all", "prescription", "transfer", "otc"]                      as const;
const DELIVERY_OPTIONS = ["all", "delivery", "pickup"]                                  as const;

type StatusFilter   = (typeof STATUS_OPTIONS)[number];
type TypeFilter     = (typeof TYPE_OPTIONS)[number];
type DeliveryFilter = (typeof DELIVERY_OPTIONS)[number];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}
function num(v: string | string[] | undefined, def = 1) {
  const n = parseInt(str(v), 10);
  return Number.isFinite(n) && n >= 1 ? n : def;
}

function formatLabel(v: string) {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClasses(status: string) {
  if (status === "new")        return "bg-sky-50 text-sky-700 border-sky-200";
  if (status === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "ready")      return "bg-violet-50 text-violet-700 border-violet-200";
  if (status === "completed")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled")  return "bg-red-50 text-red-500 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const params         = await searchParams;
  const statusFilter   = STATUS_OPTIONS.includes(str(params.status)   as StatusFilter)   ? str(params.status)   as StatusFilter   : "all";
  const typeFilter     = TYPE_OPTIONS.includes(str(params.type)       as TypeFilter)     ? str(params.type)     as TypeFilter     : "all";
  const deliveryFilter = DELIVERY_OPTIONS.includes(str(params.delivery) as DeliveryFilter) ? str(params.delivery) as DeliveryFilter : "all";
  const pharmacyFilter = str(params.pharmacy);
  const cityFilter     = str(params.city).trim().toLowerCase();
  const currentPage    = num(params.page);

  const admin = createAdminClient();

  // Fetch all pharmacies for dropdown
  const { data: pharmacyList } = await admin
    .from("pharmacies")
    .select("id, display_name")
    .order("display_name");

  // Build orders query — join to pharmacies for pharmacy name + city
  // Supabase doesn't support direct joins in PostgREST easily without foreign-key;
  // fetch orders with pharmacy_id, then lookup pharmacy info
  let ordersQuery = admin
    .from("orders")
    .select(
      "id, order_type, patient_name, patient_phone, patient_email, delivery_type, address, status, pharmacy_id, created_at, details",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (statusFilter   !== "all") ordersQuery = ordersQuery.eq("status",        statusFilter);
  if (typeFilter     !== "all") ordersQuery = ordersQuery.eq("order_type",    typeFilter);
  if (deliveryFilter !== "all") ordersQuery = ordersQuery.eq("delivery_type", deliveryFilter);
  if (pharmacyFilter)           ordersQuery = ordersQuery.eq("pharmacy_id",   pharmacyFilter);

  const from = (currentPage - 1) * PAGE_SIZE;
  const { data: ordersRaw, count: totalCount } = await ordersQuery.range(from, from + PAGE_SIZE - 1);

  // Build pharmacy lookup map
  const pharmacyMap: Record<string, { display_name: string; city: string; province: string }> = {};
  (pharmacyList ?? []).forEach((p) => { pharmacyMap[p.id] = { display_name: p.display_name, city: "", province: "" }; });

  // Fetch pharmacy city info (only needed IDs)
  const neededIds = [...new Set((ordersRaw ?? []).map((o) => o.pharmacy_id))];
  if (neededIds.length > 0) {
    const { data: phCities } = await admin
      .from("pharmacies")
      .select("id, display_name, city, province")
      .in("id", neededIds);
    (phCities ?? []).forEach((p) => { pharmacyMap[p.id] = { display_name: p.display_name, city: p.city, province: p.province }; });
  }

  // Filter by city (delivery address or pharmacy city)
  let orders = ordersRaw ?? [];
  if (cityFilter) {
    orders = orders.filter((o) => {
      const deliveryCity = (o.address ?? "").toLowerCase();
      const phCity = (pharmacyMap[o.pharmacy_id]?.city ?? "").toLowerCase();
      return deliveryCity.includes(cityFilter) || phCity.includes(cityFilter);
    });
  }

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));

  // Status counts
  const { data: statusCounts } = await admin.from("orders").select("status");
  const counts: Record<string, number> = { all: statusCounts?.length ?? 0 };
  STATUS_OPTIONS.slice(1).forEach((s) => { counts[s] = 0; });
  statusCounts?.forEach(({ status }) => { if (status in counts) counts[status]++; });

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter   !== "all") p.set("status",   statusFilter);
    if (typeFilter     !== "all") p.set("type",     typeFilter);
    if (deliveryFilter !== "all") p.set("delivery", deliveryFilter);
    if (pharmacyFilter)           p.set("pharmacy", pharmacyFilter);
    if (cityFilter)               p.set("city",     cityFilter);
    p.set("page", "1");
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    const qs = p.toString();
    return `/admin/dashboard/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1300px]">
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Orders</h1>
            <p className="text-sm text-[#6b8280] mt-1">View and filter all orders across all pharmacies.</p>
          </div>

          {/* Summary cards */}
          <section className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {STATUS_OPTIONS.map((s) => (
              <article key={s} className="bg-white rounded-xl border border-[#e2efed] p-3 shadow-sm">
                <p className="text-xl font-extrabold text-[#0d1f1c]">{counts[s] ?? 0}</p>
                <p className="text-[0.65rem] text-[#6b8280] mt-0.5">{s === "all" ? "Total" : formatLabel(s)}</p>
              </article>
            ))}
          </section>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {STATUS_OPTIONS.map((s) => (
              <Link
                key={s}
                href={buildHref({ status: s === "all" ? "" : s })}
                className={`no-underline px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  statusFilter === s
                    ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                    : "bg-white border-[#d8e9e6] text-[#406460] hover:bg-[#e8f6f4]"
                }`}
              >
                {s === "all" ? "All" : formatLabel(s)}
              </Link>
            ))}
          </div>

          {/* Secondary filters */}
          <form method="GET" action="/admin/dashboard/orders" className="flex flex-wrap gap-3 mb-5 items-end">
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
            <input type="hidden" name="page" value="1" />

            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Order Type</label>
              <select name="type" defaultValue={typeFilter} className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f]">
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t === "all" ? "All Types" : formatLabel(t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Delivery</label>
              <select name="delivery" defaultValue={deliveryFilter} className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f]">
                {DELIVERY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d === "all" ? "All" : formatLabel(d)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Pharmacy</label>
              <select name="pharmacy" defaultValue={pharmacyFilter} className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] max-w-[180px]">
                <option value="">All Pharmacies</option>
                {(pharmacyList ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">City</label>
              <input
                type="text"
                name="city"
                defaultValue={cityFilter}
                placeholder="Filter by city…"
                className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] w-36"
              />
            </div>

            <button type="submit" className="px-4 py-2 rounded-xl bg-[#2a9d8f] text-white text-xs font-bold hover:bg-[#21867a] transition-colors">
              Apply
            </button>
            <Link href="/admin/dashboard/orders" className="no-underline px-4 py-2 rounded-xl border border-[#e2efed] text-xs font-semibold text-[#6b8280] hover:bg-[#f0fbf9]">
              Clear
            </Link>
          </form>

          {/* Orders table */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e2efed] flex items-center justify-between">
              <p className="text-xs text-[#6b8280]">Showing {orders.length} of {totalCount ?? 0} orders</p>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0d1f1c]">No orders found</p>
                <p className="text-xs text-[#6b8280] mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#f8fffe] text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Order</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Pharmacy</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Delivery</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Created</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2efed]">
                    {orders.map((order) => {
                      const ph = pharmacyMap[order.pharmacy_id];
                      return (
                        <tr key={order.id} className="hover:bg-[#f7fcfb]">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0d1f1c]">{formatLabel(order.order_type)}</p>
                            <p className="text-xs text-[#6b8280]">#{order.id.slice(0, 8)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0d1f1c]">{ph?.display_name ?? "—"}</p>
                            <p className="text-xs text-[#6b8280]">{ph?.city}{ph?.province ? `, ${ph.province}` : ""}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#0d1f1c]">{order.patient_name}</p>
                            <p className="text-xs text-[#6b8280]">{order.patient_phone}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-[#0d1f1c]">{formatLabel(order.delivery_type)}</p>
                            {order.address && (
                              <p className="text-xs text-[#6b8280] max-w-[160px] truncate">{order.address}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(order.status)}`}>
                              {formatLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#406460]">
                            {new Date(order.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/admin/dashboard/orders/${order.id}`}
                              className="text-xs font-semibold text-[#2a9d8f] hover:underline no-underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-[#e2efed] flex items-center justify-between">
              <Link
                href={buildHref({ page: String(Math.max(1, currentPage - 1)) })}
                aria-disabled={currentPage <= 1}
                className={`no-underline text-xs font-semibold rounded-lg px-3 py-2 border ${
                  currentPage <= 1
                    ? "pointer-events-none border-[#e2efed] text-[#9bb3b0]"
                    : "border-[#cfe3df] text-[#2a9d8f] hover:bg-[#e8f6f4]"
                }`}
              >
                Previous
              </Link>
              <p className="text-xs text-[#6b8280]">Page {Math.min(currentPage, totalPages)} of {totalPages}</p>
              <Link
                href={buildHref({ page: String(Math.min(totalPages, currentPage + 1)) })}
                aria-disabled={currentPage >= totalPages}
                className={`no-underline text-xs font-semibold rounded-lg px-3 py-2 border ${
                  currentPage >= totalPages
                    ? "pointer-events-none border-[#e2efed] text-[#9bb3b0]"
                    : "border-[#cfe3df] text-[#2a9d8f] hover:bg-[#e8f6f4]"
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
