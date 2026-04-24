"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Package, UserCheck } from "lucide-react";
import { assignDriverAction } from "@/app/admin/dashboard/orders/actions";

export interface OrderRow {
  id: string;
  order_type: string;
  patient_name: string;
  patient_phone: string;
  delivery_type: string;
  address: string | null;
  status: string;
  order_source: string | null;
  pharmacy_id: string;
  assigned_driver_id: string | null;
  created_at: string;
}

export interface PharmacyInfo {
  id: string;
  display_name: string;
  city: string;
  province: string;
}

export interface DriverInfo {
  id: string;
  full_name: string;
  city: string;
  province: string;
}

const STATUS_OPTIONS  = ["all", "new", "processing", "ready", "dispatched", "completed", "cancelled"] as const;
const TYPE_OPTIONS    = ["all", "prescription", "transfer", "otc"] as const;
const DELIVERY_OPTIONS = ["all", "delivery", "pickup"] as const;
const SOURCE_OPTIONS  = ["all", "online", "manual"] as const;

function formatLabel(v: string) {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

interface Props {
  orders: OrderRow[];
  pharmacies: PharmacyInfo[];
  drivers: DriverInfo[];
}

export default function AdminOrdersClient({ orders, pharmacies, drivers }: Props) {
  const [statusFilter,   setStatusFilter]   = useState<string>("all");
  const [typeFilter,     setTypeFilter]     = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [sourceFilter,   setSourceFilter]   = useState<string>("all");
  const [pharmacyFilter, setPharmacyFilter] = useState<string>("");
  const [cityFilter,     setCityFilter]     = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const pharmacyMap = useMemo(() => {
    const m: Record<string, PharmacyInfo> = {};
    pharmacies.forEach((p) => { m[p.id] = p; });
    return m;
  }, [pharmacies]);

  const driverMap = useMemo(() => {
    const m: Record<string, DriverInfo> = {};
    drivers.forEach((d) => { m[d.id] = d; });
    return m;
  }, [drivers]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_OPTIONS.slice(1).forEach((s) => { c[s] = 0; });
    orders.forEach(({ status }) => { if (status in c) c[status]++; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const city = cityFilter.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter   !== "all" && o.status        !== statusFilter)   return false;
      if (typeFilter     !== "all" && o.order_type    !== typeFilter)     return false;
      if (deliveryFilter !== "all" && o.delivery_type !== deliveryFilter) return false;
      if (sourceFilter   !== "all" && (o.order_source ?? "online") !== sourceFilter) return false;
      if (pharmacyFilter && o.pharmacy_id !== pharmacyFilter)             return false;
      if (city) {
        const phCity = (pharmacyMap[o.pharmacy_id]?.city ?? "").toLowerCase();
        const addr   = (o.address ?? "").toLowerCase();
        if (!phCity.includes(city) && !addr.includes(city)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, typeFilter, deliveryFilter, sourceFilter, pharmacyFilter, cityFilter, pharmacyMap]);

  function handleAssign(orderId: string, driverId: string | null) {
    setAssigningId(orderId);
    startTransition(async () => {
      await assignDriverAction(orderId, driverId);
      setAssigningId(null);
    });
  }

  return (
    <div>
      {/* Summary cards */}
      <section className="grid grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`bg-white rounded-xl border p-3 shadow-sm text-left transition-colors ${
              statusFilter === s ? "border-[#2a9d8f]" : "border-[#e2efed]"
            }`}
          >
            <p className="text-xl font-extrabold text-[#0d1f1c]">{counts[s] ?? 0}</p>
            <p className="text-[0.65rem] text-[#6b8280] mt-0.5">{s === "all" ? "Total" : formatLabel(s)}</p>
          </button>
        ))}
      </section>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statusFilter === s
                ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                : "bg-white border-[#d8e9e6] text-[#406460] hover:bg-[#e8f6f4]"
            }`}
          >
            {s === "all" ? "All" : formatLabel(s)}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <div>
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Order Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f]"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Types" : formatLabel(t)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Delivery</label>
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f]"
          >
            {DELIVERY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d === "all" ? "All" : formatLabel(d)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f]"
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Sources" : formatLabel(s)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">Pharmacy</label>
          <select
            value={pharmacyFilter}
            onChange={(e) => setPharmacyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] max-w-[180px]"
          >
            <option value="">All Pharmacies</option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1">City</label>
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Filter by city…"
            className="px-3 py-2 rounded-xl border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] w-36"
          />
        </div>
        <button
          onClick={() => {
            setStatusFilter("all");
            setTypeFilter("all");
            setDeliveryFilter("all");
            setSourceFilter("all");
            setPharmacyFilter("");
            setCityFilter("");
          }}
          className="px-4 py-2 rounded-xl border border-[#e2efed] text-xs font-semibold text-[#6b8280] hover:bg-[#f0fbf9]"
        >
          Clear
        </button>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e2efed]">
          <p className="text-xs text-[#6b8280]">Showing {filtered.length} of {orders.length} orders</p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0d1f1c]">No orders found</p>
            <p className="text-xs text-[#6b8280] mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#f8fffe] text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Order</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Source</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Pharmacy</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Patient</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Delivery</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Created</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Assign Driver</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#6b8280]">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2efed]">
                {filtered.map((order) => {
                  const ph = pharmacyMap[order.pharmacy_id];
                  const assignedDriver = order.assigned_driver_id ? driverMap[order.assigned_driver_id] : null;
                  const canAssign = order.delivery_type === "delivery" && order.status === "ready";
                  const isAssigning = assigningId === order.id && pending;

                  return (
                    <tr key={order.id} className="hover:bg-[#f7fcfb]">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0d1f1c]">{formatLabel(order.order_type)}</p>
                        <p className="text-xs text-[#6b8280]">#{order.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          (order.order_source ?? "online") === "manual"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}>
                          {order.order_source ?? "online"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0d1f1c]">{ph?.display_name ?? "—"}</p>
                        <p className="text-xs text-[#6b8280]">{ph?.city}{ph?.province ? `, ${ph.province}` : ""}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0d1f1c]">{order.patient_name}</p>
                        <p className="text-xs text-[#6b8280]">{order.patient_phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#0d1f1c]">{formatLabel(order.delivery_type)}</p>
                        {order.address && (
                          <p className="text-xs text-[#6b8280] max-w-[160px] truncate">{order.address}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(order.status)}`}>
                          {formatLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#406460]">
                        {new Date(order.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 min-w-[180px]">
                        {canAssign ? (
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={order.assigned_driver_id ?? ""}
                              disabled={isAssigning}
                              onChange={(e) => handleAssign(order.id, e.target.value || null)}
                              className="px-2 py-1.5 rounded-lg border border-[#e2efed] text-xs text-[#0d1f1c] bg-white focus:outline-none focus:border-[#2a9d8f] disabled:opacity-50 flex-1"
                            >
                              <option value="">Unassigned</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                              ))}
                            </select>
                            {isAssigning && (
                              <span className="text-[10px] text-[#6b8280]">Saving…</span>
                            )}
                          </div>
                        ) : assignedDriver ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#2a9d8f]" />
                            <span className="text-xs font-medium text-[#0d1f1c]">{assignedDriver.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9bb3b0]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/dashboard/orders/${order.id}`}
                          className="text-xs font-semibold text-[#2a9d8f] hover:underline no-underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
