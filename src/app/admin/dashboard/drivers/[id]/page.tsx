import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Car, ExternalLink, FileText, Mail, MapPin, Phone, TrendingUp, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import DriverReviewActions from "@/components/Admin/dashboard/DriverReviewActions";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = { title: "Driver Review — GetMed Admin" };

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review", approved: "Approved", rejected: "Rejected", suspended: "Suspended",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#f0f0f0] last:border-0">
      <span className="text-xs text-[#6b8280] w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#0d1f1c] font-medium flex-1">{value || "—"}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#2a9d8f]" />
        <h2 className="text-sm font-bold text-[#0d1f1c]">{title}</h2>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const { id } = await params;
  const { flash, error } = await searchParams;

  const admin = createAdminClient();
  const { data: driver } = await admin.from("drivers").select("*").eq("id", id).single();
  if (!driver) notFound();

  // Delivery history + stats
  const { data: driverOrders } = await admin
    .from("orders")
    .select("id, order_type, patient_name, delivery_type, status, created_at, pharmacy_id")
    .eq("assigned_driver_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allOrders = driverOrders ?? [];
  const completedOrders = allOrders.filter((o) => o.status === "completed");
  const thisMonth       = completedOrders.filter((o) => new Date(o.created_at) >= monthStart).length;
  const inProgress      = allOrders.filter((o) => ["ready", "dispatched"].includes(o.status)).length;
  const cancelled       = allOrders.filter((o) => o.status === "cancelled").length;
  const successRate = completedOrders.length + cancelled > 0
    ? Math.round((completedOrders.length / (completedOrders.length + cancelled)) * 100)
    : null;

  // Pharmacy names for history table
  const phIds = [...new Set(allOrders.map((o) => o.pharmacy_id))];
  const { data: phRows } = phIds.length > 0
    ? await admin.from("pharmacies").select("id, display_name").in("id", phIds)
    : { data: [] };
  const phMap = Object.fromEntries((phRows ?? []).map((p) => [p.id, p.display_name]));

  // Generate signed URL for private license doc
  let licenseSignedUrl: string | null = null;
  if (driver.license_url) {
    const { data: signed } = await admin.storage
      .from("driver-licenses")
      .createSignedUrl(driver.license_url, 3600);
    licenseSignedUrl = signed?.signedUrl ?? null;
  }

  const appliedDate = new Date(driver.created_at).toLocaleDateString("en-CA", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1100px]">
          {/* Back */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <Link
              href="/admin/dashboard/drivers"
              className="inline-flex items-center gap-1.5 text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to all drivers
            </Link>
            <RefreshButton />
          </div>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#e2efed]">
              {driver.photo_url ? (
                <img src={driver.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-extrabold text-[#2a9d8f]">
                  {(driver.full_name ?? "?").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[1.4rem] font-extrabold text-[#0d1f1c] tracking-tight">{driver.full_name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[driver.status] ?? ""}`}>
                  {STATUS_LABEL[driver.status] ?? driver.status}
                </span>
              </div>
              <p className="text-sm text-[#6b8280] mt-0.5">
                {driver.city}, {driver.province} &middot; Applied {appliedDate}
              </p>
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: details */}
            <div className="lg:col-span-2 space-y-5">
              <Section title="Contact Information" icon={Phone}>
                <InfoRow label="Full Name" value={driver.full_name} />
                <InfoRow label="Phone" value={driver.phone} />
                <InfoRow label="Email" value={
                  <a href={`mailto:${driver.email ?? ""}`} className="text-[#2a9d8f] hover:underline">
                    {driver.email ?? "—"}
                  </a>
                } />
              </Section>

              <Section title="Service Area" icon={MapPin}>
                <InfoRow label="City" value={driver.city} />
                <InfoRow label="Province" value={driver.province} />
                <InfoRow label="Postal Code" value={driver.postal_code} />
              </Section>

              <Section title="Vehicle Information" icon={Car}>
                <InfoRow label="Vehicle Type" value={driver.vehicle_type} />
                <InfoRow label="Make" value={driver.vehicle_make} />
                <InfoRow label="Model" value={driver.vehicle_model} />
                <InfoRow label="Year" value={driver.vehicle_year?.toString()} />
                <InfoRow label="License Plate" value={driver.vehicle_plate} />
              </Section>

              <Section title="Driver's License" icon={FileText}>
                <InfoRow label="License Number" value={driver.license_number} />
                <InfoRow label="Issuing Province" value={driver.license_province} />
                <InfoRow label="Expiry Date" value={
                  driver.license_expiry
                    ? new Date(driver.license_expiry).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })
                    : null
                } />
                <InfoRow label="Document" value={
                  licenseSignedUrl ? (
                    <a
                      href={licenseSignedUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#2a9d8f] hover:underline no-underline font-medium text-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View / Download License
                    </a>
                  ) : (
                    <span className="text-[#a0b5b2]">Not uploaded</span>
                  )
                } />
              </Section>
            </div>

            {/* Right: review actions + quick info */}
            <div className="space-y-4">
              <DriverReviewActions
                driverId={id}
                status={driver.status}
                rejectionReason={driver.rejection_reason}
                reviewedAt={driver.reviewed_at}
                flash={flash}
                error={error}
              />

              <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm px-5 py-4 space-y-3">
                <p className="text-xs font-bold text-[#0d1f1c] uppercase tracking-wider">Quick Info</p>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{driver.email ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <Car className="w-3.5 h-3.5 shrink-0" />
                  <span>{driver.vehicle_type ?? "Vehicle type not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Applied {appliedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery stats — full width below the 3-col section */}
          <div className="mt-6 lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e2efed] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2a9d8f]" />
                  <h2 className="text-sm font-bold text-[#0d1f1c]">Delivery Statistics</h2>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                      { label: "Total Delivered",   value: completedOrders.length, color: "text-emerald-600" },
                      { label: "This Month",         value: thisMonth,              color: "text-[#2a9d8f]"   },
                      { label: "In Progress",        value: inProgress,             color: "text-violet-600"  },
                      { label: "Cancelled",          value: cancelled,              color: "text-red-500"     },
                      { label: "Success Rate",       value: successRate !== null ? `${successRate}%` : "—", color: "text-[#0d1f1c]" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#f8fffe] rounded-xl border border-[#e2efed] p-3 text-center">
                        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                        <p className="text-[0.6rem] text-[#6b8280] mt-1 font-semibold uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery history table */}
                  {allOrders.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#0d1f1c] uppercase tracking-wide mb-3">Recent Deliveries</p>
                      <div className="overflow-x-auto rounded-xl border border-[#e2efed]">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-[#f8fffe] text-left">
                              <th className="px-4 py-2.5 font-semibold text-[#6b8280]">Patient</th>
                              <th className="px-4 py-2.5 font-semibold text-[#6b8280]">Pharmacy</th>
                              <th className="px-4 py-2.5 font-semibold text-[#6b8280]">Type</th>
                              <th className="px-4 py-2.5 font-semibold text-[#6b8280]">Status</th>
                              <th className="px-4 py-2.5 font-semibold text-[#6b8280]">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f0f7f5]">
                            {allOrders.slice(0, 30).map((o) => (
                              <tr key={o.id} className="hover:bg-[#f8fffe]">
                                <td className="px-4 py-2.5 font-medium text-[#0d1f1c]">{o.patient_name}</td>
                                <td className="px-4 py-2.5 text-[#6b8280]">{phMap[o.pharmacy_id] ?? "—"}</td>
                                <td className="px-4 py-2.5 text-[#6b8280] capitalize">{o.order_type}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${
                                    o.status === "completed"  ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    o.status === "dispatched" ? "bg-teal-50 text-teal-700 border-teal-200"         :
                                    o.status === "cancelled"  ? "bg-red-50 text-red-500 border-red-200"            :
                                    "bg-violet-50 text-violet-700 border-violet-200"
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-[#6b8280]">
                                  {new Date(o.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {allOrders.length > 30 && (
                        <p className="text-xs text-[#6b8280] mt-2 text-center">Showing 30 of {allOrders.length} orders</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

        </div>
      </main>
    </div>
  );
}
