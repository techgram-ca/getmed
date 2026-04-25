import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/Admin/dashboard/AdminSidebar";
import DeliveryProofSection, { type DeliveryProof } from "@/components/shared/DeliveryProofSection";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = { title: "Order Detail — GetMed Admin" };

const HIDDEN_KEYS = new Set(["prescriptionFilePaths", "insuranceFilePaths", "consent"]);

function formatLabel(v: string) {
  return v.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\s+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
}
function renderValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" || typeof v === "number") return String(v);
  return JSON.stringify(v);
}

function badgeClasses(status: string) {
  if (status === "new")        return "bg-sky-50 text-sky-700 border-sky-200";
  if (status === "processing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "ready")      return "bg-violet-50 text-violet-700 border-violet-200";
  if (status === "completed")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled")       return "bg-red-50 text-red-500 border-red-200";
  if (status === "delivery_failed") return "bg-orange-50 text-orange-600 border-orange-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/admin/login");

  const { id } = await params;
  const admin  = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, order_type, patient_name, patient_phone, patient_email, delivery_type, address, status, order_source, pharmacy_id, details, delivery_proof, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: pharmacy } = await admin
    .from("pharmacies")
    .select("id, display_name, city, province, phone")
    .eq("id", order.pharmacy_id)
    .maybeSingle();

  const details = (order.details ?? {}) as Record<string, unknown>;
  const filteredDetails = Object.entries(details).filter(([k]) => !HIDDEN_KEYS.has(k));

  const proof = (order.delivery_proof ?? null) as DeliveryProof | null;
  const podPaths = [proof?.photo_path, proof?.signature_path].filter(Boolean) as string[];
  const { data: podSigned } = podPaths.length
    ? await admin.storage.from("delivery-proofs").createSignedUrls(podPaths, 60 * 60)
    : { data: [] as { signedUrl: string | null }[] };
  const podUrlMap: Record<string, string | null> = {};
  podPaths.forEach((p, i) => { podUrlMap[p] = podSigned?.[i]?.signedUrl ?? null; });

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <AdminSidebar />
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[900px]">
          <div className="mb-6">
            <Link
              href="/admin/dashboard/orders"
              className="inline-flex items-center gap-1.5 text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to orders
            </Link>
            <div className="flex flex-wrap gap-3 items-start justify-between">
              <div>
                <p className="text-xs text-[#6b8280]">Order ID</p>
                <h1 className="text-[1.3rem] font-extrabold text-[#0d1f1c] break-all">{order.id}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <RefreshButton />
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${badgeClasses(order.status)}`}>
                  {formatLabel(order.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order info */}
            <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
              <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Order Information</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Type</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.order_type)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Status</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.status)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Source</dt>
                  <dd className="font-semibold text-[#0d1f1c] capitalize">{order.order_source ?? "online"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Delivery</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.delivery_type)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Created</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{new Date(order.created_at).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Updated</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{new Date(order.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </article>

            {/* Pharmacy info */}
            <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
              <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Pharmacy</h2>
              {pharmacy ? (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#6b8280]">Name</dt>
                    <dd className="font-semibold text-[#0d1f1c]">
                      <Link href={`/admin/dashboard/pharmacies/${pharmacy.id}`} className="text-[#2a9d8f] hover:underline no-underline font-semibold">
                        {pharmacy.display_name}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#6b8280]">Location</dt>
                    <dd className="font-semibold text-[#0d1f1c]">{pharmacy.city}, {pharmacy.province}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#6b8280]">Phone</dt>
                    <dd className="font-semibold text-[#0d1f1c]">{pharmacy.phone}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-[#6b8280]">Pharmacy not found.</p>
              )}
            </article>

            {/* Patient info */}
            <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
              <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Patient Information</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Name</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Phone</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6b8280]">Email</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_email || "—"}</dd>
                </div>
                {order.address && (
                  <div className="flex justify-between">
                    <dt className="text-[#6b8280]">Delivery Address</dt>
                    <dd className="font-semibold text-[#0d1f1c] text-right max-w-[200px]">{order.address}</dd>
                  </div>
                )}
              </dl>
            </article>

            {/* Order details (no file paths) */}
            {filteredDetails.length > 0 && (
              <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
                <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Order Details</h2>
                <dl className="space-y-3 text-sm">
                  {filteredDetails.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <dt className="text-[#6b8280] shrink-0">{formatLabel(key)}</dt>
                      <dd className="font-semibold text-[#0d1f1c] text-right break-words">{renderValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )}
          </div>

          {proof && (
            <DeliveryProofSection
              proof={proof}
              photoUrl={proof.photo_path ? (podUrlMap[proof.photo_path] ?? null) : null}
              signatureUrl={proof.signature_path ? (podUrlMap[proof.signature_path] ?? null) : null}
            />
          )}
        </div>
      </main>
    </div>
  );
}
