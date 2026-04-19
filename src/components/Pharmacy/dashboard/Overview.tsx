import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  PackageCheck,
  TrendingUp,
  Users,
} from "lucide-react";

interface Pharmacy {
  display_name: string;
  status: string;
  contact_name: string;
  city: string;
  province: string;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
  created_at: string;
}

interface Props {
  pharmacy: Pharmacy;
}

const STATS = [
  { label: "Orders Today",    value: "0", icon: PackageCheck, color: "bg-[#e0f5f2] text-[#2a9d8f]" },
  { label: "Pending Orders",  value: "0", icon: Clock,        color: "bg-amber-50 text-amber-600"    },
  { label: "Total Patients",  value: "0", icon: Users,        color: "bg-blue-50 text-blue-600"      },
  { label: "This Month",      value: "$0",icon: TrendingUp,   color: "bg-purple-50 text-purple-600"  },
];

export default function Overview({ pharmacy }: Props) {
  const isPending = pharmacy.status === "pending";

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
          Good morning, {pharmacy.contact_name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[#6b8280] mt-1">
          {pharmacy.display_name} &middot; {pharmacy.city}, {pharmacy.province}
        </p>
      </div>

      {/* Pending approval banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Account Pending Approval</p>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              Your pharmacy application is being reviewed. Our team typically approves applications within 24 hours.
              You&apos;ll receive an email confirmation once your account is active.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-[#e2efed] p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-[#0d1f1c]">{value}</p>
            <p className="text-xs text-[#6b8280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2efed] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0d1f1c]">Recent Orders</h2>
            <Link
              href="/pharmacy/dashboard/orders"
              className="text-xs text-[#2a9d8f] font-semibold flex items-center gap-1 hover:underline no-underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center mx-auto mb-3">
              <PackageCheck className="w-6 h-6 text-[#2a9d8f]" />
            </div>
            <p className="text-sm font-semibold text-[#0d1f1c]">No orders yet</p>
            <p className="text-xs text-[#6b8280] mt-1 max-w-[200px] mx-auto">
              Orders from patients will appear here once your account is active.
            </p>
          </div>
        </div>

        {/* Services & Setup */}
        <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2efed]">
            <h2 className="text-sm font-bold text-[#0d1f1c]">Your Services</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: "Online Orders",   enabled: pharmacy.service_online_orders  },
              { label: "Delivery",        enabled: pharmacy.service_delivery        },
              { label: "Consultations",   enabled: pharmacy.service_consultation    },
            ].map(({ label, enabled }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-[#0d1f1c]">{label}</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[#f0f0f0] text-[#a0b5b2]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      enabled ? "bg-emerald-500" : "bg-[#c0d0ce]"
                    }`}
                  />
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-[#e2efed]">
              <Link
                href="/pharmacy/dashboard/settings"
                className="text-xs text-[#2a9d8f] font-semibold flex items-center gap-1 hover:underline no-underline"
              >
                Manage settings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Getting started checklist */}
      <div className="mt-6 bg-gradient-to-r from-[#2a9d8f] to-[#21867a] rounded-2xl p-6 text-white">
        <h2 className="text-base font-bold mb-4">Getting Started Checklist</h2>
        <div className="space-y-2.5">
          {[
            { label: "Create your pharmacy account",           done: true  },
            { label: "Application under review by GetMed",    done: isPending },
            { label: "Account approved & profile goes live",  done: !isPending },
            { label: "Receive your first online order",       done: false  },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  done
                    ? "bg-white border-white"
                    : "border-white/40"
                }`}
              >
                {done && (
                  <svg className="w-3 h-3 text-[#2a9d8f]" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${done ? "text-white font-medium" : "text-white/60"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
