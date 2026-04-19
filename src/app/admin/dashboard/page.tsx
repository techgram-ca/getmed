import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";

export const metadata: Metadata = { title: "Admin Dashboard — GetMed" };

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  pending:   { label: "Pending Review", badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500 animate-pulse" },
  approved:  { label: "Approved",       badge: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"            },
  rejected:  { label: "Rejected",       badge: "bg-red-100 text-red-700",        dot: "bg-red-500"               },
  suspended: { label: "Suspended",      badge: "bg-orange-100 text-orange-700",  dot: "bg-orange-500"            },
};

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "suspended";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Auth guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== "admin") redirect("/admin/login");

  const { status: rawStatus } = await searchParams;
  const filter = (["all","pending","approved","rejected","suspended"].includes(rawStatus ?? "")
    ? rawStatus
    : "all") as FilterStatus;

  // Fetch pharmacies using service-role client (bypass RLS)
  const admin = createAdminClient();
  let query = admin
    .from("pharmacies")
    .select("id, display_name, legal_name, logo_url, city, province, status, contact_name, phone, service_online_orders, service_delivery, service_consultation, created_at")
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data: pharmaciesRaw } = await query;
  const pharmacies = pharmaciesRaw ?? [];

  // Stats
  const { data: counts } = await admin
    .from("pharmacies")
    .select("status");

  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
  counts?.forEach(({ status }) => {
    stats.total++;
    if (status in stats) stats[status as keyof typeof stats]++;
  });

  const TABS: { label: string; value: FilterStatus; count?: number }[] = [
    { label: "All",      value: "all",      count: stats.total    },
    { label: "Pending",  value: "pending",  count: stats.pending  },
    { label: "Approved", value: "approved", count: stats.approved },
    { label: "Rejected", value: "rejected", count: stats.rejected },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1100px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#6b8280] mt-1">
              Review and manage pharmacy applications
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Applications", value: stats.total,    icon: Building2,    color: "bg-[#e0f5f2] text-[#2a9d8f]" },
              { label: "Pending Review",     value: stats.pending,  icon: Clock,        color: "bg-amber-50 text-amber-600"   },
              { label: "Approved",           value: stats.approved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600"},
              { label: "Rejected",           value: stats.rejected, icon: XCircle,      color: "bg-red-50 text-red-500"       },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#e2efed] p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-[#0d1f1c]">{value}</p>
                <p className="text-xs text-[#6b8280] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs + list */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#e2efed] px-4 pt-2 gap-1 overflow-x-auto">
              {TABS.map(({ label, value, count }) => (
                <Link
                  key={value}
                  href={`/admin/dashboard${value !== "all" ? `?status=${value}` : ""}`}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors no-underline whitespace-nowrap ${
                    filter === value
                      ? "border-[#2a9d8f] text-[#2a9d8f] bg-[#f0fbf9]"
                      : "border-transparent text-[#6b8280] hover:text-[#0d1f1c]"
                  }`}
                >
                  {label}
                  {count !== undefined && (
                    <span
                      className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold ${
                        filter === value ? "bg-[#2a9d8f] text-white" : "bg-[#e2efed] text-[#6b8280]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Table */}
            {pharmacies.length === 0 ? (
              <div className="py-16 text-center">
                <Building2 className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0d1f1c]">No pharmacies found</p>
                <p className="text-xs text-[#6b8280] mt-1">
                  {filter === "all" ? "No pharmacy applications yet." : `No ${filter} applications.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2efed]">
                {pharmacies.map((ph) => {
                  const s = STATUS_STYLES[ph.status] ?? STATUS_STYLES.pending;
                  return (
                    <Link
                      key={ph.id}
                      href={`/admin/dashboard/pharmacies/${ph.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fffe] transition-colors no-underline group"
                    >
                      {/* Logo / initials */}
                      <div className="w-10 h-10 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden">
                        {ph.logo_url ? (
                          <img src={ph.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[0.7rem] font-extrabold text-[#2a9d8f]">
                            {ph.display_name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Name + location */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0d1f1c] truncate group-hover:text-[#2a9d8f] transition-colors">
                          {ph.display_name}
                        </p>
                        <p className="text-xs text-[#6b8280] truncate">
                          {ph.legal_name} &middot; {ph.city}, {ph.province}
                        </p>
                      </div>

                      {/* Contact */}
                      <div className="hidden md:block min-w-0 w-36">
                        <p className="text-xs text-[#0d1f1c] font-medium truncate">{ph.contact_name}</p>
                        <p className="text-xs text-[#6b8280]">{ph.phone}</p>
                      </div>

                      {/* Services */}
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

                      {/* Applied date */}
                      <div className="hidden sm:block text-xs text-[#6b8280] w-20 text-right shrink-0">
                        {new Date(ph.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </div>

                      {/* Status badge */}
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
