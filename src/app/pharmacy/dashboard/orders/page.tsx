import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import OrderStatusChanger from "@/components/Pharmacy/dashboard/OrderStatusChanger";
import { createClient } from "@/lib/supabase/server";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = {
  title: "Orders — GetMed Pharmacy Portal",
};

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["all", "new", "processing", "ready", "dispatched", "completed", "cancelled"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFilterValue(raw: string | string[] | undefined): StatusFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !STATUS_FILTERS.includes(value as StatusFilter)) {
    return "all";
  }
  return value as StatusFilter;
}

function getPageValue(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
}

function badgeClasses(status: string) {
  if (status === "new")        return "bg-sky-50 text-sky-700 border-sky-200";
  if (status === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "ready")      return "bg-violet-50 text-violet-700 border-violet-200";
  if (status === "dispatched") return "bg-teal-50 text-teal-700 border-teal-200";
  if (status === "completed")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled")  return "bg-red-50 text-red-500 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function buildOrdersHref(filter: StatusFilter, page: number) {
  return `/pharmacy/dashboard/orders?status=${filter}&page=${page}`;
}

export default async function PharmacyOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statusFilter = getFilterValue(params.status);
  const currentPage  = getPageValue(params.page);
  const supabase     = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error: pharmacyError } = await supabase
    .from("pharmacies")
    .select("id, display_name, status")
    .eq("user_id", user.id)
    .single();

  if (pharmacyError || !pharmacy) redirect("/pharmacy/login");

  const [
    { count: totalCount },
    { count: newCount },
    { count: processingCount },
    { count: readyCount },
    { count: completedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id),
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "new"),
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "processing"),
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "ready"),
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "completed"),
    supabase.from("orders").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "cancelled"),
  ]);

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, order_type, patient_name, patient_phone, patient_email, delivery_type, status, created_at",
      { count: "exact" }
    )
    .eq("pharmacy_id", pharmacy.id)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    ordersQuery = ordersQuery.eq("status", statusFilter);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const { data: orders, count: filteredCount } = await ordersQuery.range(from, to);

  const totalPages = Math.max(1, Math.ceil((filteredCount ?? 0) / PAGE_SIZE));

  const summaryCards = [
    { label: "Total",              value: totalCount     ?? 0 },
    { label: "New",                value: newCount       ?? 0 },
    { label: "Processing",         value: processingCount ?? 0 },
    { label: "Ready for delivery", value: readyCount     ?? 0 },
    { label: "Completed",          value: completedCount ?? 0 },
    { label: "Cancelled",          value: cancelledCount ?? 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1300px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Orders</h1>
              <p className="text-sm text-[#6b8280] mt-1">Manage and track all pharmacy orders.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <RefreshButton />
              <Link
                href="/pharmacy/dashboard/orders/new"
                className="no-underline inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Order
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {summaryCards.map((card) => (
              <article key={card.label} className="bg-white rounded-xl border border-[#e2efed] p-4 shadow-sm">
                <p className="text-2xl font-extrabold text-[#0d1f1c]">{card.value}</p>
                <p className="text-xs text-[#6b8280] mt-0.5">{card.label}</p>
              </article>
            ))}
          </section>

          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2efed] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((status) => {
                  const isActive = status === statusFilter;
                  return (
                    <Link
                      key={status}
                      href={buildOrdersHref(status, 1)}
                      className={`no-underline px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        isActive
                          ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                          : "bg-white border-[#d8e9e6] text-[#406460] hover:bg-[#e8f6f4]"
                      }`}
                    >
                      {status === "all" ? "All" : formatLabel(status)}
                    </Link>
                  );
                })}
              </div>
              <p className="text-xs text-[#6b8280]">
                Showing {orders?.length ?? 0} of {filteredCount ?? 0} orders
              </p>
            </div>

            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#f8fffe] text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Order</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Delivery</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Created</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2efed]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#f7fcfb]">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#0d1f1c]">{formatLabel(order.order_type)}</p>
                          <p className="text-xs text-[#6b8280] truncate max-w-[190px]">#{order.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#0d1f1c]">{order.patient_name}</p>
                          <p className="text-xs text-[#6b8280]">{order.patient_phone}</p>
                          <p className="text-xs text-[#6b8280]">{order.patient_email ?? "No email"}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#0d1f1c]">{formatLabel(order.delivery_type)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(order.status)}`}>
                            {formatLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#406460]">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/pharmacy/dashboard/orders/${order.id}`}
                              className="text-xs font-semibold text-[#2a9d8f] hover:underline no-underline"
                            >
                              View details
                            </Link>
                            <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-14 text-center text-sm text-[#6b8280]">No orders found for this filter.</div>
            )}

            <div className="px-5 py-4 border-t border-[#e2efed] flex items-center justify-between">
              <Link
                href={buildOrdersHref(statusFilter, Math.max(1, currentPage - 1))}
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
                href={buildOrdersHref(statusFilter, Math.min(totalPages, currentPage + 1))}
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
          </section>
        </div>
      </main>
    </div>
  );
}
