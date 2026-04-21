import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Consultations — GetMed Pharmacy Portal",
};

const PAGE_SIZE = 10;

const STATUS_FILTERS = ["all", "pending", "in_progress", "completed", "cancelled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getFilter(raw: string | string[] | undefined): StatusFilter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !STATUS_FILTERS.includes(v as StatusFilter)) return "all";
  return v as StatusFilter;
}

function getPage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(v ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function badgeClasses(status: string) {
  if (status === "pending")     return "bg-amber-50  text-amber-700  border-amber-200";
  if (status === "in_progress") return "bg-sky-50    text-sky-700    border-sky-200";
  if (status === "completed")   return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled")   return "bg-red-50    text-red-500    border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function label(s: string) {
  return s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function buildHref(filter: StatusFilter, page: number) {
  return `/pharmacy/dashboard/consultations?status=${filter}&page=${page}`;
}

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params       = await searchParams;
  const statusFilter = getFilter(params.status);
  const currentPage  = getPage(params.page);
  const supabase     = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error: pharmacyError } = await supabase
    .from("pharmacies")
    .select("id, display_name, status")
    .eq("user_id", user.id)
    .single();

  if (pharmacyError || !pharmacy) redirect("/pharmacy/login");

  // Summary counts
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: inProgressCount },
    { count: completedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    supabase.from("consultations").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id),
    supabase.from("consultations").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "pending"),
    supabase.from("consultations").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "in_progress"),
    supabase.from("consultations").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "completed"),
    supabase.from("consultations").select("id", { head: true, count: "exact" }).eq("pharmacy_id", pharmacy.id).eq("status", "cancelled"),
  ]);

  let query = supabase
    .from("consultations")
    .select(
      "id, patient_name, patient_phone, patient_email, condition, notes, status, created_at",
      { count: "exact" }
    )
    .eq("pharmacy_id", pharmacy.id)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const { data: consultations, count: filteredCount } = await query.range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((filteredCount ?? 0) / PAGE_SIZE));

  const summaryCards = [
    { label: "Total",       value: totalCount      ?? 0 },
    { label: "Pending",     value: pendingCount     ?? 0 },
    { label: "In Progress", value: inProgressCount  ?? 0 },
    { label: "Completed",   value: completedCount   ?? 0 },
    { label: "Cancelled",   value: cancelledCount   ?? 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1300px]">
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
              Consultations
            </h1>
            <p className="text-sm text-[#6b8280] mt-1">
              View and manage patient consultation requests.
            </p>
          </div>

          {/* Summary cards */}
          <section className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="bg-white rounded-xl border border-[#e2efed] p-4 shadow-sm"
              >
                <p className="text-2xl font-extrabold text-[#0d1f1c]">{card.value}</p>
                <p className="text-xs text-[#6b8280] mt-0.5">{card.label}</p>
              </article>
            ))}
          </section>

          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            {/* Filter tabs */}
            <div className="px-5 py-4 border-b border-[#e2efed] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((s) => {
                  const isActive = s === statusFilter;
                  return (
                    <a
                      key={s}
                      href={buildHref(s, 1)}
                      className={`no-underline px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        isActive
                          ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                          : "bg-white border-[#d8e9e6] text-[#406460] hover:bg-[#e8f6f4]"
                      }`}
                    >
                      {s === "all" ? "All" : label(s)}
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-[#6b8280]">
                Showing {consultations?.length ?? 0} of {filteredCount ?? 0}
              </p>
            </div>

            {consultations && consultations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#f8fffe] text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Condition</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2efed]">
                    {consultations.map((c) => (
                      <tr key={c.id} className="hover:bg-[#f7fcfb]">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#0d1f1c]">{c.patient_name}</p>
                          <p className="text-xs text-[#6b8280]">{c.patient_phone}</p>
                          {c.patient_email && (
                            <p className="text-xs text-[#6b8280]">{c.patient_email}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-[#0d1f1c]">{c.condition ?? "—"}</p>
                          {c.notes && (
                            <p className="text-xs text-[#6b8280] mt-0.5 max-w-[240px] truncate">
                              {c.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(c.status)}`}
                          >
                            {label(c.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#406460]">
                          {new Date(c.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-14 text-center text-sm text-[#6b8280]">
                No consultations found for this filter.
              </div>
            )}

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-[#e2efed] flex items-center justify-between">
              <a
                href={buildHref(statusFilter, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={`no-underline text-xs font-semibold rounded-lg px-3 py-2 border ${
                  currentPage <= 1
                    ? "pointer-events-none border-[#e2efed] text-[#9bb3b0]"
                    : "border-[#cfe3df] text-[#2a9d8f] hover:bg-[#e8f6f4]"
                }`}
              >
                Previous
              </a>
              <p className="text-xs text-[#6b8280]">
                Page {Math.min(currentPage, totalPages)} of {totalPages}
              </p>
              <a
                href={buildHref(statusFilter, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={`no-underline text-xs font-semibold rounded-lg px-3 py-2 border ${
                  currentPage >= totalPages
                    ? "pointer-events-none border-[#e2efed] text-[#9bb3b0]"
                    : "border-[#cfe3df] text-[#2a9d8f] hover:bg-[#e8f6f4]"
                }`}
              >
                Next
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
