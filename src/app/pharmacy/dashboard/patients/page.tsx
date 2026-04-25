import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Search } from "lucide-react";
import Sidebar from "@/components/Pharmacy/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import RefreshButton from "@/components/shared/RefreshButton";

export const metadata: Metadata = {
  title: "Patients — GetMed Pharmacy Portal",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
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

function fmtStatus(s: string) {
  return s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export default async function PatientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params  = await searchParams;
  const query   = str(params.q).trim().toLowerCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pharmacy/login");

  const { data: pharmacy, error: pharmacyError } = await supabase
    .from("pharmacies")
    .select("id, display_name, status")
    .eq("user_id", user.id)
    .single();

  if (pharmacyError || !pharmacy) redirect("/pharmacy/login");

  // Fetch all orders for this pharmacy — we'll aggregate client-side
  const { data: orders } = await supabase
    .from("orders")
    .select("id, patient_name, patient_phone, patient_email, address, order_type, status, created_at")
    .eq("pharmacy_id", pharmacy.id)
    .order("created_at", { ascending: false });

  // Aggregate by phone number (unique patient identifier)
  type Patient = {
    phone: string;
    name: string;
    email: string | null;
    address: string | null;
    totalOrders: number;
    lastOrderDate: string;
    lastOrderStatus: string;
    orderIds: string[];
  };

  const patientMap = new Map<string, Patient>();
  for (const order of orders ?? []) {
    const key = order.patient_phone;
    if (!patientMap.has(key)) {
      patientMap.set(key, {
        phone:           order.patient_phone,
        name:            order.patient_name,
        email:           order.patient_email ?? null,
        address:         order.address ?? null,
        totalOrders:     1,
        lastOrderDate:   order.created_at,
        lastOrderStatus: order.status,
        orderIds:        [order.id],
      });
    } else {
      const p = patientMap.get(key)!;
      p.totalOrders++;
      p.orderIds.push(order.id);
      // Orders are already sorted newest-first so first encounter = most recent
    }
  }

  let patients = [...patientMap.values()];

  // Server-side search filter
  if (query) {
    patients = patients.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      (p.email ?? "").toLowerCase().includes(query)
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fffe]">
      <Sidebar pharmacyName={pharmacy.display_name} status={pharmacy.status} />

      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-[1300px]">

          <Link
            href="/pharmacy/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b8280] hover:text-[#0d1f1c] transition-colors no-underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">Patients</h1>
              <p className="text-sm text-[#6b8280] mt-1">
                {patients.length} unique patient{patients.length !== 1 ? "s" : ""} from your order history.
              </p>
            </div>
            <RefreshButton />
          </div>

          {/* Summary cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Patients",    value: patientMap.size },
              { label: "With Email",        value: [...patientMap.values()].filter((p) => p.email).length },
              { label: "Repeat Patients",   value: [...patientMap.values()].filter((p) => p.totalOrders > 1).length },
              { label: "Total Orders",      value: orders?.length ?? 0 },
            ].map((card) => (
              <article key={card.label} className="bg-white rounded-xl border border-[#e2efed] p-4 shadow-sm">
                <p className="text-2xl font-extrabold text-[#0d1f1c]">{card.value}</p>
                <p className="text-xs text-[#6b8280] mt-0.5">{card.label}</p>
              </article>
            ))}
          </section>

          {/* Search */}
          <form method="GET" className="mb-5">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8280]" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search by name, phone or email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e2efed] text-sm text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] transition-colors"
              />
            </div>
          </form>

          {/* Patient table */}
          <section className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
            {patients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#f8fffe] text-left border-b border-[#e2efed]">
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Patient</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Contact</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Address</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Orders</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Last Order</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Last Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2efed]">
                    {patients.map((patient) => (
                      <tr key={patient.phone} className="hover:bg-[#f7fcfb]">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#0d1f1c]">{patient.name}</p>
                          {patient.totalOrders > 1 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-[10px] font-bold mt-0.5">
                              Repeat
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-[#0d1f1c]">
                            <Phone className="w-3.5 h-3.5 text-[#2a9d8f] shrink-0" />
                            <a href={`tel:${patient.phone}`} className="hover:text-[#2a9d8f] no-underline">
                              {patient.phone}
                            </a>
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-1.5 text-xs text-[#6b8280] mt-1">
                              <Mail className="w-3 h-3 text-[#2a9d8f] shrink-0" />
                              <a href={`mailto:${patient.email}`} className="hover:text-[#2a9d8f] no-underline truncate max-w-[180px]">
                                {patient.email}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {patient.address ? (
                            <div className="flex items-start gap-1.5 text-xs text-[#6b8280] max-w-[200px]">
                              <MapPin className="w-3 h-3 text-[#2a9d8f] shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{patient.address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9bb3b0]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-extrabold text-[#0d1f1c]">{patient.totalOrders}</p>
                          <p className="text-[10px] text-[#6b8280]">
                            {patient.totalOrders === 1 ? "order" : "orders"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#406460] whitespace-nowrap">
                          {new Date(patient.lastOrderDate).toLocaleDateString("en-CA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(patient.lastOrderStatus)}`}>
                            {fmtStatus(patient.lastOrderStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/pharmacy/dashboard/orders?q=${encodeURIComponent(patient.phone)}`}
                            className="text-xs font-semibold text-[#2a9d8f] hover:underline no-underline whitespace-nowrap"
                          >
                            View orders →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <p className="text-sm font-semibold text-[#0d1f1c]">
                  {query ? `No patients match "${query}"` : "No patients yet"}
                </p>
                <p className="text-xs text-[#6b8280] mt-1">
                  {query ? "Try a different search term." : "Patients will appear here once orders are placed."}
                </p>
                {query && (
                  <a href="/pharmacy/dashboard/patients" className="mt-3 inline-block text-xs font-semibold text-[#2a9d8f] hover:underline no-underline">
                    Clear search
                  </a>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
