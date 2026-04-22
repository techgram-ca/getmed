import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import OrderStatusChanger from "@/components/Pharmacy/dashboard/OrderStatusChanger";
import DeliveryProofSection, { type DeliveryProof } from "@/components/shared/DeliveryProofSection";

export const metadata: Metadata = {
  title: "Order Details — GetMed Pharmacy Portal",
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

const HIDDEN_DETAIL_KEYS = new Set(["prescriptionFilePaths", "insuranceFilePaths"]);

export default async function PharmacyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error: pharmacyError } = await supabase
    .from("pharmacies")
    .select("id, display_name, status")
    .eq("user_id", user.id)
    .single();

  if (pharmacyError || !pharmacy) redirect("/pharmacy/login");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, pharmacy_id, order_type, patient_name, patient_phone, patient_email, delivery_type, address, details, file_urls, status, delivery_proof, created_at, updated_at"
    )
    .eq("id", id)
    .eq("pharmacy_id", pharmacy.id)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) notFound();

  // Categorize files by stored metadata when available
  const details = (order.details ?? {}) as Record<string, unknown>;
  const rxPaths  = (details.prescriptionFilePaths as string[] | undefined) ?? null;
  const insPaths = (details.insuranceFilePaths    as string[] | undefined) ?? null;
  const allPaths: string[] = order.file_urls ?? [];

  // Determine which paths to sign
  const pathsToSign = allPaths.length > 0 ? allPaths : [];
  const { data: signedFiles } = pathsToSign.length
    ? await supabase.storage.from("prescription-uploads").createSignedUrls(pathsToSign, 60 * 60)
    : { data: [] as { signedUrl: string | null }[] };

  const urlMap: Record<string, string | null> = {};
  pathsToSign.forEach((p, i) => {
    urlMap[p] = signedFiles?.[i]?.signedUrl ?? null;
  });

  function buildFileList(paths: string[] | null, fallback: string[]) {
    const list = paths ?? fallback;
    return list.map((p) => ({ path: p, url: urlMap[p] ?? null }));
  }

  const prescriptionFiles = buildFileList(rxPaths, rxPaths ? [] : allPaths);
  const insuranceFiles    = buildFileList(insPaths, []);
  const useCategorized    = rxPaths !== null || insPaths !== null;

  // Proof of delivery signed URLs
  const proof = (order.delivery_proof ?? null) as DeliveryProof | null;
  const podPaths = [proof?.photo_path, proof?.signature_path].filter(Boolean) as string[];
  const { data: podSigned } = podPaths.length
    ? await supabase.storage.from("delivery-proofs").createSignedUrls(podPaths, 60 * 60)
    : { data: [] as { signedUrl: string | null }[] };
  const podUrlMap: Record<string, string | null> = {};
  podPaths.forEach((p, i) => { podUrlMap[p] = podSigned?.[i]?.signedUrl ?? null; });

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1100px]">
          <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div>
              <p className="text-xs text-[#6b8280]">Order ID</p>
              <h1 className="text-[1.4rem] font-extrabold text-[#0d1f1c] break-all">{order.id}</h1>
            </div>
            <Link
              href="/pharmacy/dashboard/orders"
              className="no-underline text-xs font-semibold text-[#2a9d8f] border border-[#cfe3df] rounded-lg px-3 py-2 hover:bg-[#e8f6f4]"
            >
              Back to orders
            </Link>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
              <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Order information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#6b8280]">Type</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.order_type)}</dd>
                </div>
                <div>
                  <dt className="text-[#6b8280]">Status</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.status)}</dd>
                </div>
                <div>
                  <dt className="text-[#6b8280]">Delivery type</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{formatLabel(order.delivery_type)}</dd>
                </div>
                <div>
                  <dt className="text-[#6b8280]">Created</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{new Date(order.created_at).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#6b8280]">Updated</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{new Date(order.updated_at).toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-5 pt-4 border-t border-[#e2efed]">
                <p className="text-xs text-[#6b8280] mb-2 font-semibold">Change Status</p>
                <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
              </div>
            </article>

            <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
              <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Patient information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#6b8280]">Name</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_name}</dd>
                </div>
                <div>
                  <dt className="text-[#6b8280]">Phone</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#6b8280]">Email</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.patient_email || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#6b8280]">Address</dt>
                  <dd className="font-semibold text-[#0d1f1c]">{order.address || "—"}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mt-6">
            <h2 className="text-sm font-bold text-[#0d1f1c] mb-3">Order details</h2>
            {Object.entries(details).filter(([k]) => !HIDDEN_DETAIL_KEYS.has(k)).length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(details)
                  .filter(([k]) => !HIDDEN_DETAIL_KEYS.has(k))
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[#6b8280]">{formatLabel(key)}</dt>
                      <dd className="font-semibold text-[#0d1f1c] break-words">{renderValue(value)}</dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="text-sm text-[#6b8280]">No additional details provided.</p>
            )}
          </section>

          {proof && (
            <DeliveryProofSection
              proof={proof}
              photoUrl={proof.photo_path ? (podUrlMap[proof.photo_path] ?? null) : null}
              signatureUrl={proof.signature_path ? (podUrlMap[proof.signature_path] ?? null) : null}
            />
          )}

          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 mt-6">
            <h2 className="text-sm font-bold text-[#0d1f1c] mb-4">Uploaded files</h2>

            {useCategorized ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6b8280] mb-2">Prescription Files</p>
                  {prescriptionFiles.length > 0 ? (
                    <ul className="space-y-2">
                      {prescriptionFiles.map((f) => (
                        <li key={f.path}>
                          {f.url ? (
                            <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-[#2a9d8f] font-semibold hover:underline break-all">
                              {f.path.split("/").at(-1)}
                            </a>
                          ) : (
                            <span className="text-sm text-[#6b8280] break-all">{f.path}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#6b8280]">No prescription files uploaded.</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6b8280] mb-2">Insurance Files</p>
                  {insuranceFiles.length > 0 ? (
                    <ul className="space-y-2">
                      {insuranceFiles.map((f) => (
                        <li key={f.path}>
                          {f.url ? (
                            <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-[#2a9d8f] font-semibold hover:underline break-all">
                              {f.path.split("/").at(-1)}
                            </a>
                          ) : (
                            <span className="text-sm text-[#6b8280] break-all">{f.path}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#6b8280]">No insurance files uploaded.</p>
                  )}
                </div>
              </div>
            ) : (
              allPaths.length > 0 ? (
                <ul className="space-y-2">
                  {allPaths.map((path) => (
                    <li key={path}>
                      {urlMap[path] ? (
                        <a href={urlMap[path]!} target="_blank" rel="noreferrer" className="text-sm text-[#2a9d8f] font-semibold hover:underline break-all">
                          {path.split("/").at(-1)}
                        </a>
                      ) : (
                        <span className="text-sm text-[#6b8280] break-all">{path}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#6b8280]">No files uploaded for this order.</p>
              )
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
