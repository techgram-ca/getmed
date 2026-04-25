import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = { title: "Pharmacies — GetMed Admin" };

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "suspended"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-100 text-amber-700",    dot: "bg-amber-500 animate-pulse" },
  approved:  { label: "Approved",  badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500"             },
  rejected:  { label: "Rejected",  badge: "bg-red-100 text-red-700",         dot: "bg-red-500"                 },
  suspended: { label: "Suspended", badge: "bg-orange-100 text-orange-700",   dot: "bg-orange-500"              },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function safeLower(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function formatCreatedAt(value: unknown) {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function isOpenNow(hours: Record<string, { open: boolean; openTime: string; closeTime: string }> | null): boolean {
  if (!hours) return false;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now  = new Date();
  const h    = hours[days[now.getDay()]];
  if (!h?.open) return false;
  const [oH, oM] = h.openTime.split(":").map(Number);
  const [cH, cM] = h.closeTime.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oH * 60 + oM && cur < cH * 60 + cM;
}

export default async function AdminPharmaciesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const params        = await searchParams;
  const statusFilter  = STATUS_OPTIONS.includes(str(params.status) as StatusFilter) ? str(params.status) as StatusFilter : "all";
  const cityFilter    = str(params.city).trim().toLowerCase();
  const openFilter    = str(params.open); // "open" | "closed" | ""

  const admin = createAdminClient();

  let query = admin
    .from("pharmacies")
    .select("id, display_name, legal_name, logo_url, city, province, status, contact_name, phone, opening_hours, service_online_orders, service_delivery, service_consultation, created_at")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  const { data: raw } = await query;
  let pharmacies = raw ?? [];

  // Client-side filters (city + open/closed)
  if (cityFilter) {
    pharmacies = pharmacies.filter((p) => safeLower(p.city).includes(cityFilter));
  }
  if (openFilter === "open") {
    pharmacies = pharmacies.filter((p) => isOpenNow(p.opening_hours));
  } else if (openFilter === "closed") {
    pharmacies = pharmacies.filter((p) => !isOpenNow(p.opening_hours));
  }

  // Distinct cities for filter dropdown
  const { data: allCities } = await admin
    .from("pharmacies")
    .select("city")
    .order("city");
  const cities = [...new Set((allCities ?? []).map((r) => r.city).filter((city): city is string => typeof city === "string" && city.length > 0))].sort();

  // Status counts
  const { data: allStatuses } = await admin.from("pharmacies").select("status");
  const counts: Record<string, number> = { all: allStatuses?.length ?? 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
  allStatuses?.forEach(({ status }) => { if (status in counts) counts[status]++; });

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (cityFilter)             p.set("city", cityFilter);
    if (openFilter)             p.set("open", openFilter);
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    const qs = p.toString();
    return `/admin/dashboard/pharmacies${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1200px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Pharmacies</h1>
              <p className="text-sm text-[#6b8280] mt-1">Manage all pharmacy accounts on the platform.</p>
            </div>
            <RefreshButton />
          </div>

          {/* Status tab filters */}
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

          {/* Secondary filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            {/* City filter */}
            <form method="GET" action="/admin/dashboard/pharmacies" className="flex items-center gap-2">
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              {openFilter && <input type="hidden" name="open" value={openFilter} />}
              <select
                name="city"
                defaultValue={cityFilter}
                className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
              <button type="submit" className="px-3 py-2 rounded-xl bg-[#2a9d8f] text-white text-xs font-bold">Apply</button>
            </form>

            {/* Open/Closed filter */}
            <div className="flex gap-1.5">
              {[["", "Any Hours"], ["open", "Open Now"], ["closed", "Closed Now"]].map(([val, label]) => (
                <Link
                  key={val}
                  href={buildHref({ open: val })}
                  className={`no-underline px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                    openFilter === val
                      ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                      : "bg-white border-[#e2efed] text-[#6b8280] hover:bg-[#f0fbf9] hover:border-[#2a9d8f]/40"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Active filter badges */}
            {(cityFilter || openFilter) && (
              <Link
                href={buildHref({ city: "", open: "" })}
                className="no-underline px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e2efed]">
              <p className="text-xs text-[#6b8280]">{pharmacies.length} pharmacies found</p>
            </div>

            {pharmacies.length === 0 ? (
              <div className="py-16 text-center">
                <Building2 className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0d1f1c]">No pharmacies found</p>
                <p className="text-xs text-[#6b8280] mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2efed]">
                {pharmacies.map((ph) => {
                  const s    = STATUS_STYLES[ph.status] ?? STATUS_STYLES.pending;
                  const open = isOpenNow(ph.opening_hours);
                  const displayName = typeof ph.display_name === "string" && ph.display_name.length > 0
                    ? ph.display_name
                    : (typeof ph.legal_name === "string" && ph.legal_name.length > 0 ? ph.legal_name : "Unnamed Pharmacy");
                  const legalName = typeof ph.legal_name === "string" && ph.legal_name.length > 0 ? ph.legal_name : "—";
                  const city = typeof ph.city === "string" && ph.city.length > 0 ? ph.city : "—";
                  const province = typeof ph.province === "string" && ph.province.length > 0 ? ph.province : "—";
                  const contactName = typeof ph.contact_name === "string" && ph.contact_name.length > 0 ? ph.contact_name : "No contact";
                  const phone = typeof ph.phone === "string" && ph.phone.length > 0 ? ph.phone : "—";
                  return (
                    <Link
                      key={ph.id}
                      href={`/admin/dashboard/pharmacies/${ph.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fffe] transition-colors no-underline group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden">
                        {ph.logo_url ? (
                          <img src={ph.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[0.7rem] font-extrabold text-[#2a9d8f]">
                            {displayName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0d1f1c] truncate group-hover:text-[#2a9d8f] transition-colors">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#6b8280] truncate">
                          {legalName} · {city}, {province}
                        </p>
                      </div>

                      <div className="hidden md:block min-w-0 w-36">
                        <p className="text-xs text-[#0d1f1c] font-medium truncate">{contactName}</p>
                        <p className="text-xs text-[#6b8280]">{phone}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-1">
                        <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${open ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"}`}>
                          {open ? "Open" : "Closed"}
                        </span>
                      </div>

                      <div className="hidden lg:flex items-center gap-1 w-24">
                        {ph.service_online_orders && (
                          <span className="text-[0.55rem] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">Orders</span>
                        )}
                        {ph.service_delivery && (
                          <span className="text-[0.55rem] bg-purple-50 text-purple-600 font-bold px-1.5 py-0.5 rounded">Delivery</span>
                        )}
                        {ph.service_consultation && (
                          <span className="text-[0.55rem] bg-teal-50 text-teal-600 font-bold px-1.5 py-0.5 rounded">Consult</span>
                        )}
                      </div>

                      <div className="hidden sm:block text-xs text-[#6b8280] w-20 text-right shrink-0">
                        {formatCreatedAt(ph.created_at)}
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
