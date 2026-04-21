"use client";

import { useTransition, useState } from "react";
import { MapPin, Navigation, Package, CheckCircle, Truck } from "lucide-react";
import { markDispatchedAction, markDeliveredAction } from "@/app/driver/dashboard/actions";

interface PharmacyInfo {
  display_name: string;
  full_address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
}

export interface AssignedOrder {
  id: string;
  order_type: string;
  patient_name: string;
  patient_phone: string;
  delivery_type: string;
  address: string | null;
  status: string;
  pharmacy_id: string;
  created_at: string;
  pharmacy: PharmacyInfo | null;
}

interface Props {
  orders: AssignedOrder[];
}

function mapsUrl(address: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

function routeUrl(from: string, to: string) {
  return `https://maps.google.com/maps?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}`;
}

function shortId(id: string) {
  return id.slice(-8).toUpperCase();
}

export default function AssignedOrdersList({ orders }: Props) {
  const [pending, startTransition] = useTransition();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const readyOrders = orders.filter((o) => o.status === "ready");
  const dispatchedOrders = orders.filter((o) => o.status === "dispatched");

  // Group ready orders by pharmacy
  const pharmacyGroups = readyOrders.reduce<Record<string, { pharmacy: PharmacyInfo | null; orders: AssignedOrder[] }>>(
    (acc, order) => {
      const key = order.pharmacy_id;
      if (!acc[key]) acc[key] = { pharmacy: order.pharmacy, orders: [] };
      acc[key].orders.push(order);
      return acc;
    },
    {}
  );

  function markLoading(ids: string[]) {
    setLoadingIds((prev) => new Set([...prev, ...ids]));
  }
  function clearLoading(ids: string[]) {
    setLoadingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function handleDispatch(orderIds: string[]) {
    markLoading(orderIds);
    startTransition(async () => {
      await markDispatchedAction(orderIds);
      clearLoading(orderIds);
    });
  }

  function handleDeliver(orderId: string) {
    markLoading([orderId]);
    startTransition(async () => {
      await markDeliveredAction(orderId);
      clearLoading([orderId]);
    });
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2efed] p-10 shadow-sm text-center mt-4">
        <Package className="w-12 h-12 text-[#e2efed] mx-auto mb-4" />
        <p className="text-base font-bold text-[#0d1f1c]">No active deliveries</p>
        <p className="text-sm text-[#6b8280] mt-1">
          New assignments will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Pickup groups — orders that need to be collected from pharmacy */}
      {Object.entries(pharmacyGroups).length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-[#0d1f1c] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2a9d8f]" />
            Ready for Pickup ({readyOrders.length})
          </h2>

          <div className="space-y-4">
            {Object.entries(pharmacyGroups).map(([pharmacyId, group]) => {
              const ph = group.pharmacy;
              const allIds = group.orders.map((o) => o.id);
              const allLoading = allIds.every((id) => loadingIds.has(id));
              const pharmacyAddr = ph
                ? `${ph.full_address}, ${ph.city}, ${ph.province}`
                : "";

              return (
                <div key={pharmacyId} className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
                  {/* Pharmacy pickup header */}
                  <div className="bg-[#f0fbf9] border-b border-[#e2efed] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#2a9d8f] flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#2a9d8f] mb-0.5">Pickup from</p>
                          <p className="text-sm font-bold text-[#0d1f1c] leading-tight">{ph?.display_name ?? "Pharmacy"}</p>
                          {ph && (
                            <p className="text-xs text-[#6b8280] mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ph.full_address}, {ph.city}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {pharmacyAddr && (
                        <a
                          href={mapsUrl(pharmacyAddr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a9d8f] text-white text-xs font-bold no-underline"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Navigate
                        </a>
                      )}
                    </div>

                    {/* OpenStreetMap embed for pharmacy */}
                    {ph?.lat && ph?.lng && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-[#e2efed]">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${ph.lng - 0.008},${ph.lat - 0.005},${ph.lng + 0.008},${ph.lat + 0.005}&layer=mapnik&marker=${ph.lat},${ph.lng}`}
                          className="w-full h-36"
                          loading="lazy"
                          title={`Map: ${ph.display_name}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Orders in this pickup group */}
                  <div className="divide-y divide-[#f0f7f5]">
                    {group.orders.map((order) => {
                      const isLoading = loadingIds.has(order.id);
                      return (
                        <div key={order.id} className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="text-xs text-[#6b8280] font-mono">#{shortId(order.id)}</p>
                              <p className="text-sm font-bold text-[#0d1f1c]">{order.patient_name}</p>
                              <p className="text-xs text-[#6b8280]">{order.patient_phone}</p>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                              {order.order_type}
                            </span>
                          </div>

                          {order.address && (
                            <div className="flex items-start gap-2 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-[#6b8280] mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#406460] leading-relaxed">{order.address}</p>
                              </div>
                              <a
                                href={
                                  pharmacyAddr && order.address
                                    ? routeUrl(pharmacyAddr, order.address)
                                    : mapsUrl(order.address)
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#2a9d8f] text-[#2a9d8f] text-[11px] font-semibold no-underline"
                              >
                                <Navigation className="w-3 h-3" />
                                Route
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Mark all picked up */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleDispatch(allIds)}
                      disabled={pending || allLoading}
                      className="w-full py-3 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#21867a]"
                    >
                      <Truck className="w-4 h-4" />
                      {allLoading ? "Updating…" : `Mark All Picked Up (${group.orders.length})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Dispatched orders — en route to customer */}
      {dispatchedOrders.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-[#0d1f1c] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-600" />
            Out for Delivery ({dispatchedOrders.length})
          </h2>

          <div className="space-y-3">
            {dispatchedOrders.map((order) => {
              const ph = order.pharmacy;
              const isLoading = loadingIds.has(order.id);
              const pharmacyAddr = ph
                ? `${ph.full_address}, ${ph.city}, ${ph.province}`
                : "";

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-teal-200 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          En Route
                        </span>
                        <p className="text-xs text-[#6b8280] font-mono">#{shortId(order.id)}</p>
                      </div>
                      <p className="text-sm font-bold text-[#0d1f1c]">{order.patient_name}</p>
                      <p className="text-xs text-[#6b8280]">{order.patient_phone}</p>
                      {ph && (
                        <p className="text-xs text-[#6b8280] mt-0.5">From: {ph.display_name}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                      {order.order_type}
                    </span>
                  </div>

                  {order.address && (
                    <div className="flex items-start gap-2 mb-3 p-3 bg-[#f8fffe] rounded-xl border border-[#e2efed]">
                      <MapPin className="w-3.5 h-3.5 text-[#2a9d8f] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#6b8280] mb-0.5">Delivering to</p>
                        <p className="text-xs text-[#0d1f1c] leading-relaxed">{order.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.address && (
                      <a
                        href={
                          pharmacyAddr && order.address
                            ? routeUrl(pharmacyAddr, order.address)
                            : mapsUrl(order.address)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl border border-[#2a9d8f] text-[#2a9d8f] text-sm font-bold flex items-center justify-center gap-1.5 no-underline"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </a>
                    )}
                    <button
                      onClick={() => handleDeliver(order.id)}
                      disabled={pending || isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:bg-emerald-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isLoading ? "Updating…" : "Mark Delivered"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
