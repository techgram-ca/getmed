import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import ReviewActions from "@/components/Admin/dashboard/ReviewActions";

export const metadata: Metadata = { title: "Pharmacy Review — GetMed Admin" };

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#f0f0f0] last:border-0">
      <span className="text-xs text-[#6b8280] w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#0d1f1c] font-medium flex-1">{value}</span>
    </div>
  );
}

export default async function PharmacyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flash?: string; error?: string }>;
}) {
  // Auth guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const { id } = await params;
  const { flash, error } = await searchParams;

  const admin = createAdminClient();

  // Fetch pharmacy + pharmacist profile
  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select("*")
    .eq("id", id)
    .single();

  if (!pharmacy) notFound();

  const { data: pharmacist } = await admin
    .from("pharmacist_profiles")
    .select("*")
    .eq("pharmacy_id", id)
    .maybeSingle();

  // Generate signed URL for private license document
  let licenseSignedUrl: string | null = null;
  if (pharmacy.license_url) {
    const { data: signed } = await admin.storage
      .from("pharmacy-licenses")
      .createSignedUrl(pharmacy.license_url, 3600);
    licenseSignedUrl = signed?.signedUrl ?? null;
  }

  const statusLabel: Record<string, string> = {
    pending: "Pending Review", approved: "Approved", rejected: "Rejected", suspended: "Suspended",
  };

  const hoursEntries = pharmacy.opening_hours
    ? Object.entries(pharmacy.opening_hours as Record<string, { open: boolean; openTime: string; closeTime: string }>)
    : [];

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1100px]">
          {/* Back + header */}
          <div className="mb-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all pharmacies
            </Link>

            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-[#e0f5f2] flex items-center justify-center shrink-0 overflow-hidden border border-[#e2efed]">
                {pharmacy.logo_url ? (
                  <img src={pharmacy.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-extrabold text-[#2a9d8f]">
                    {pharmacy.display_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[1.4rem] font-extrabold text-[#0d1f1c] tracking-tight">
                    {pharmacy.display_name}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[pharmacy.status] ?? ""}`}>
                    {statusLabel[pharmacy.status] ?? pharmacy.status}
                  </span>
                </div>
                <p className="text-sm text-[#6b8280] mt-0.5">
                  {pharmacy.legal_name} &middot; Applied {new Date(pharmacy.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: all info ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact */}
              <Section title="Contact Information" icon={Phone}>
                <InfoRow label="Contact Name"  value={pharmacy.contact_name} />
                <InfoRow label="Phone"         value={pharmacy.phone} />
                <InfoRow label="Email"         value={
                  <a href={`mailto:${pharmacy.email ?? ""}`} className="text-[#2a9d8f] hover:underline">
                    {pharmacy.email ?? "—"}
                  </a>
                } />
              </Section>

              {/* Location */}
              <Section title="Location" icon={MapPin}>
                <InfoRow label="Full Address" value={pharmacy.full_address} />
                {pharmacy.unit    && <InfoRow label="Unit / Suite" value={pharmacy.unit} />}
                <InfoRow label="City"         value={pharmacy.city} />
                <InfoRow label="Province"     value={pharmacy.province} />
                <InfoRow label="Postal Code"  value={pharmacy.postal_code} />
                {pharmacy.lat && pharmacy.lng && (
                  <InfoRow label="Coordinates" value={`${pharmacy.lat.toFixed(5)}, ${pharmacy.lng.toFixed(5)}`} />
                )}
              </Section>

              {/* License */}
              <Section title="Pharmacy License" icon={FileText}>
                <InfoRow label="License #" value={pharmacy.license_number} />
                <InfoRow
                  label="Document"
                  value={
                    licenseSignedUrl ? (
                      <a
                        href={licenseSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#2a9d8f] hover:underline no-underline font-medium text-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View / Download License
                      </a>
                    ) : (
                      <span className="text-[#a0b5b2]">Not uploaded</span>
                    )
                  }
                />
              </Section>

              {/* Services */}
              <Section title="Services & Payment" icon={Building2}>
                <InfoRow
                  label="Services"
                  value={
                    <div className="flex flex-wrap gap-1.5">
                      {pharmacy.service_online_orders && (
                        <Tag label="Online Orders" color="bg-blue-50 text-blue-600" />
                      )}
                      {pharmacy.service_delivery && (
                        <Tag label="Delivery" color="bg-purple-50 text-purple-600" />
                      )}
                      {pharmacy.service_consultation && (
                        <Tag label="Consultation" color="bg-teal-50 text-teal-600" />
                      )}
                      {!pharmacy.service_online_orders && !pharmacy.service_delivery && !pharmacy.service_consultation && (
                        <span className="text-[#a0b5b2] text-sm">None selected</span>
                      )}
                    </div>
                  }
                />
                <InfoRow
                  label="Payment"
                  value={
                    <div className="flex flex-wrap gap-1.5">
                      {(pharmacy.payment_methods ?? []).map((m: string) => (
                        <Tag key={m} label={m} color="bg-[#e0f5f2] text-[#2a9d8f]" />
                      ))}
                    </div>
                  }
                />
              </Section>

              {/* Opening hours */}
              {hoursEntries.length > 0 && (
                <Section title="Opening Hours" icon={Clock}>
                  {hoursEntries.map(([day, h]) => (
                    <InfoRow
                      key={day}
                      label={day}
                      value={
                        h.open
                          ? `${h.openTime} – ${h.closeTime}`
                          : <span className="text-[#a0b5b2]">Closed</span>
                      }
                    />
                  ))}
                </Section>
              )}

              {/* Pharmacist profile */}
              {pharmacist && (
                <Section title="Pharmacist Profile" icon={Stethoscope}>
                  {pharmacist.photo_url && (
                    <div className="mb-4">
                      <img
                        src={pharmacist.photo_url}
                        alt={pharmacist.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#e2efed]"
                      />
                    </div>
                  )}
                  <InfoRow label="Full Name"    value={pharmacist.full_name} />
                  <InfoRow label="Qualification" value={pharmacist.qualification} />
                  <InfoRow label="License #"    value={pharmacist.license_number} />
                  {pharmacist.years_of_experience != null && (
                    <InfoRow label="Experience"   value={`${pharmacist.years_of_experience} years`} />
                  )}
                  {pharmacist.specialization?.length > 0 && (
                    <InfoRow label="Specialization" value={pharmacist.specialization.join(", ")} />
                  )}
                  {pharmacist.languages?.length > 0 && (
                    <InfoRow label="Languages"    value={pharmacist.languages.join(", ")} />
                  )}
                  {pharmacist.bio && (
                    <InfoRow label="Bio"          value={<span className="leading-relaxed">{pharmacist.bio}</span>} />
                  )}
                  {pharmacist.consultation_modes?.length > 0 && (
                    <InfoRow label="Consult Modes" value={pharmacist.consultation_modes.join(", ")} />
                  )}
                  {pharmacist.consultation_fee != null && (
                    <InfoRow label="Fee"           value={`$${Number(pharmacist.consultation_fee).toFixed(2)}`} />
                  )}
                </Section>
              )}
            </div>

            {/* ── Right: review actions ───────────────────────────── */}
            <div className="space-y-4">
              <ReviewActions
                pharmacyId={id}
                status={pharmacy.status}
                rejectionReason={pharmacy.rejection_reason}
                reviewedAt={pharmacy.reviewed_at}
                flash={flash}
                error={error}
              />

              {/* Quick info card */}
              <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm px-5 py-4 space-y-3">
                <p className="text-xs font-bold text-[#0d1f1c] uppercase tracking-wider">Quick Info</p>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{pharmacy.email ?? "No email stored"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>{(pharmacy.payment_methods ?? []).length} payment method{(pharmacy.payment_methods ?? []).length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6b8280]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Applied {new Date(pharmacy.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
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

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[0.65rem] font-bold ${color}`}>
      {label}
    </span>
  );
}
