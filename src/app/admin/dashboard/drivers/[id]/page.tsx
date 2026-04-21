import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Car, ExternalLink, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import DriverReviewActions from "@/components/Admin/dashboard/DriverReviewActions";

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
          <Link
            href="/admin/dashboard/drivers"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all drivers
          </Link>

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

          {/* Two-column layout */}
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
        </div>
      </main>
    </div>
  );
}
