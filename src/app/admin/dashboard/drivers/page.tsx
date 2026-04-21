import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";

export const metadata: Metadata = { title: "Drivers — GetMed Admin" };

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "suspended"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-500 animate-pulse" },
  approved:  { label: "Approved",  badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500"             },
  rejected:  { label: "Rejected",  badge: "bg-red-100 text-red-700",         dot: "bg-red-500"                 },
  suspended: { label: "Suspended", badge: "bg-orange-100 text-orange-700",   dot: "bg-orange-500"              },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function fmt(value: unknown) {
  if (typeof value !== "string") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminDriversPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const params       = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes(str(params.status) as StatusFilter) ? str(params.status) as StatusFilter : "all";
  const cityFilter   = str(params.city).trim().toLowerCase();

  const admin = createAdminClient();

  let query = admin
    .from("drivers")
    .select("id, full_name, photo_url, city, province, vehicle_type, status, phone, email, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  const { data: raw } = await query;
  let drivers = raw ?? [];

  if (cityFilter) {
    drivers = drivers.filter((d) =>
      typeof d.city === "string" && d.city.toLowerCase().includes(cityFilter)
    );
  }

  const { data: allCities } = await admin.from("drivers").select("city").order("city");
  const cities = [
    ...new Set(
      (allCities ?? [])
        .map((r) => r.city)
        .filter((c): c is string => typeof c === "string" && c.length > 0)
    ),
  ].sort();

  const { data: allStatuses } = await admin.from("drivers").select("status");
  const counts: Record<string, number> = { all: allStatuses?.length ?? 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
  allStatuses?.forEach(({ status }) => { if (status in counts) counts[status]++; });

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (cityFilter)             p.set("city", cityFilter);
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    const qs = p.toString();
    return `/admin/dashboard/drivers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1200px]">
          <div className="mb-6">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Drivers</h1>
            <p className="text-sm text-[#6b8280] mt-1">Manage all driver accounts on the platform.</p>
          </div>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {STATUS_OPTIONS.map((s) => (
              <Link
                key={s}
                href={buildHref({ status: s === "all" ? "" : s })}
                className={`no-underline px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  statusFilter === s
                    ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                    : "bg-white border-[#d8e9e6] text-[#406460] hover:bg-[#e8f6f4]"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1.5 opacity-70">{counts[s]}</span>
              </Link>
            ))}
          </div>

          {/* City filter */}
          <div className="flex flex-wrap gap-3 mb-5">
            <form method="GET" action="/admin/dashboard/drivers" className="flex items-center gap-2">
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              <select
                name="city" defaultValue={cityFilter}
                className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
              >
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
              <button type="submit" className="px-3 py-2 rounded-xl bg-[#2a9d8f] text-white text-xs font-bold cursor-pointer">Apply</button>
            </form>
            {cityFilter && (
              <Link
                href={buildHref({ city: "" })}
                className="no-underline px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e2efed]">
              <p className="text-xs text-[#6b8280]">{drivers.length} driver{drivers.length !== 1 ? "s" : ""} found</p>
            </div>

            {drivers.length === 0 ? (
              <div className="py-16 text-center">
                <Car className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0d1f1c]">No drivers found</p>
                <p className="text-xs text-[#6b8280] mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2efed]">
                {drivers.map((d) => {
                  const s = STATUS_STYLES[d.status] ?? STATUS_STYLES.pending;
                  const name = typeof d.full_name === "string" && d.full_name ? d.full_name : "Unnamed Driver";
                  return (
                    <Link
                      key={d.id}
                      href={`/admin/dashboard/drivers/${d.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fffe] transition-colors no-underline group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden">
                        {d.photo_url ? (
                          <img src={d.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[0.7rem] font-extrabold text-[#2a9d8f]">
                            {name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0d1f1c] truncate group-hover:text-[#2a9d8f] transition-colors">{name}</p>
                        <p className="text-xs text-[#6b8280] truncate">
                          {d.city ?? "—"}, {d.province ?? "—"}
                          {d.vehicle_type ? ` · ${d.vehicle_type}` : ""}
                        </p>
                      </div>

                      <div className="hidden md:block min-w-0 w-40">
                        <p className="text-xs text-[#0d1f1c] font-medium truncate">{d.email ?? "—"}</p>
                        <p className="text-xs text-[#6b8280]">{d.phone ?? "—"}</p>
                      </div>

                      <div className="hidden sm:block text-xs text-[#6b8280] w-20 text-right shrink-0">
                        {fmt(d.created_at)}
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold shrink-0 ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>

                      <ChevronRight className="w-4 h-4 text-[#6b8280] shrink-0 group-hover:text-[#2a9d8f] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
