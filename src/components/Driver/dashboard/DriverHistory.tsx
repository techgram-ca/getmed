"use client";

import { useState, useMemo } from "react";
import { Clock, Package, CheckCircle, XCircle, Truck } from "lucide-react";
import RefreshButton from "@/components/shared/RefreshButton";

export interface HistoryOrder {
  id: string;
  order_type: string;
  patient_name: string;
  delivery_type: string;
  address: string | null;
  status: string;
  created_at: string;
  pharmacy_name: string;
  pharmacy_city: string;
}

interface Props {
  orders: HistoryOrder[];
}

type Range = "week" | "month" | "all";

const RANGE_LABELS: Record<Range, string> = { week: "This Week", month: "This Month", all: "All Time" };
const TYPE_LABELS: Record<string, string> = { prescription: "Rx", transfer: "Transfer", otc: "OTC" };

function badgeClasses(status: string) {
  if (status === "completed")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "dispatched") return "bg-teal-50 text-teal-700 border-teal-200";
  if (status === "ready")      return "bg-violet-50 text-violet-700 border-violet-200";
  if (status === "cancelled")  return "bg-red-50 text-red-500 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function statusIcon(status: string) {
  if (status === "completed")  return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
  if (status === "dispatched") return <Truck className="w-3.5 h-3.5 text-teal-500" />;
  if (status === "cancelled")  return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  return <Package className="w-3.5 h-3.5 text-violet-500" />;
}

function startOf(range: Range): Date {
  const now = new Date();
  if (range === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(0);
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function DriverHistory({ orders }: Props) {
  const [range, setRange]     = useState<Range>("all");
  const [typeFilter, setType] = useState("all");

  const cutoff = useMemo(() => startOf(range), [range]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (new Date(o.created_at) < cutoff) return false;
      if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
      return true;
    });
  }, [orders, cutoff, typeFilter]);

  // Stats from filtered list
  const completed  = filtered.filter((o) => o.status === "completed").length;
  const cancelled  = filtered.filter((o) => o.status === "cancelled").length;
  const inProgress = filtered.filter((o) => ["ready", "dispatched"].includes(o.status)).length;
  const rate       = filtered.length > 0
    ? Math.round((completed / (completed + cancelled || 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#f0faf8] pb-24">
      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-extrabold text-[#0d1f1c]">Delivery History</p>
          <RefreshButton />
        </div>

        {/* Range tabs */}
        <div className="flex gap-2 mb-4">
          {(["week", "month", "all"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                range === r
                  ? "bg-[#2a9d8f] border-[#2a9d8f] text-white"
                  : "bg-white border-[#e2efed] text-[#6b8280]"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Delivered", value: completed,  color: "text-emerald-600" },
            { label: "In Progress", value: inProgress, color: "text-[#2a9d8f]" },
            { label: "Cancelled",  value: cancelled,  color: "text-red-500"    },
            { label: "Success %",  value: `${rate}%`, color: "text-[#0d1f1c]"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-[#e2efed] p-2.5 shadow-sm text-center">
              <p className={`text-lg font-extrabold ${color}`}>{value}</p>
              <p className="text-[0.55rem] text-[#6b8280] mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Order type filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["all", "prescription", "transfer", "otc"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                typeFilter === t
                  ? "bg-[#0d1f1c] border-[#0d1f1c] text-white"
                  : "bg-white border-[#e2efed] text-[#6b8280]"
              }`}
            >
              {t === "all" ? "All Types" : TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2efed] p-10 text-center shadow-sm">
            <Clock className="w-10 h-10 text-[#e2efed] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#0d1f1c]">No deliveries yet</p>
            <p className="text-xs text-[#6b8280] mt-1">Try changing the time range or filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-[#e2efed] shadow-sm p-3.5 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{statusIcon(o.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#0d1f1c] truncate">{o.patient_name}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${badgeClasses(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-[0.65rem] text-[#6b8280] mt-0.5 truncate">{o.pharmacy_name} · {o.pharmacy_city}</p>
                  {o.address && (
                    <p className="text-[0.65rem] text-[#9bb3b0] truncate mt-0.5">{o.address}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[0.6rem] font-medium text-[#9bb3b0]">
                      {TYPE_LABELS[o.order_type] ?? o.order_type}
                    </span>
                    <span className="text-[0.6rem] text-[#9bb3b0]">{fmt(o.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
