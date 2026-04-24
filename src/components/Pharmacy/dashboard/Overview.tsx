import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  PackageCheck,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

interface Pharmacy {
  id: string;
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
  orders: Order[];
}

interface Order {
  id: string;
  order_type: "prescription" | "transfer" | "otc";
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  delivery_type: "pickup" | "delivery";
  address: string | null;
  details: Record<string, unknown>;
  file_urls: string[];
  status: "new" | "processing" | "ready" | "completed" | "cancelled";
  created_at: string;
  files: { path: string; url: string | null }[];
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
}

export default function Overview({ pharmacy, orders }: Props) {
  const isPending  = pharmacy.status === "pending";
  const today = new Date();
  const ordersToday = orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    return (
      orderDate.getFullYear() === today.getFullYear()
      && orderDate.getMonth() === today.getMonth()
      && orderDate.getDate() === today.getDate()
    );
  }).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "new" || order.status === "processing" || order.status === "ready"
  ).length;

  const uniquePatients = new Set(
    orders.map((order) => `${order.patient_name}-${order.patient_phone}`)
  ).size;

  const deliveredOrders = orders.filter((order) => order.status === "completed").length;

  const stats = [
    { label: "Orders Today",           value: String(ordersToday),    icon: PackageCheck, color: "bg-[#e0f5f2] text-[#2a9d8f]" },
    { label: "Pending Orders",         value: String(pendingOrders),  icon: Clock,        color: "bg-amber-50 text-amber-600"    },
    { label: "Total Patients",         value: String(uniquePatients), icon: Users,        color: "bg-blue-50 text-blue-600"      },
    { label: "Total Orders Delivered", value: String(deliveredOrders),icon: TrendingUp,   color: "bg-purple-50 text-purple-600"  },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-extrabold text-[#0d1f1c] tracking-tight">
            Good morning, {pharmacy.contact_name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#6b8280] mt-1">
            {pharmacy.display_name} &middot; {pharmacy.city}, {pharmacy.province}
          </p>
        </div>
        <Link
          href="/pharmacy/dashboard/orders/new"
          className="no-underline shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Order
        </Link>
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
        {stats.map(({ label, value, icon: Icon, color }) => (
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
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center mx-auto mb-3">
                <PackageCheck className="w-6 h-6 text-[#2a9d8f]" />
              </div>
              <p className="text-sm font-semibold text-[#0d1f1c]">No orders yet</p>
              <p className="text-xs text-[#6b8280] mt-1 max-w-[200px] mx-auto">
                Orders from patients will appear here once your account is active.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e2efed] max-h-[32rem] overflow-y-auto">
              {orders.map((order) => (
                <article key={order.id} className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <p className="text-sm font-bold text-[#0d1f1c]">
                      {formatLabel(order.order_type)} order
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8f6f4] text-[#1f7f74]">
                        {formatLabel(order.status)}
                      </span>
                      <span className="text-xs text-[#6b8280]">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-[#6b8280]">Patient</dt>
                      <dd className="font-medium text-[#0d1f1c]">{order.patient_name}</dd>
                    </div>
                    <div>
                      <dt className="text-[#6b8280]">Phone</dt>
                      <dd className="font-medium text-[#0d1f1c]">{order.patient_phone}</dd>
                    </div>
                    <div>
                      <dt className="text-[#6b8280]">Email</dt>
                      <dd className="font-medium text-[#0d1f1c]">{order.patient_email || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[#6b8280]">Delivery</dt>
                      <dd className="font-medium text-[#0d1f1c]">
                        {formatLabel(order.delivery_type)}
                      </dd>
                    </div>
                    {order.address && (
                      <div className="sm:col-span-2">
                        <dt className="text-[#6b8280]">Address</dt>
                        <dd className="font-medium text-[#0d1f1c]">{order.address}</dd>
                      </div>
                    )}
                  </dl>

                  <div>
                    <p className="text-xs font-semibold text-[#0d1f1c] mb-2">Order details</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(order.details ?? {}).length === 0 ? (
                        <p className="text-[#6b8280]">No extra details provided.</p>
                      ) : (
                        Object.entries(order.details ?? {}).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-[#6b8280]">{formatLabel(key)}</dt>
                            <dd className="font-medium text-[#0d1f1c] break-words">
                              {String(value || "—")}
                            </dd>
                          </div>
                        ))
                      )}
                    </dl>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#0d1f1c] mb-2">Files</p>
                    {order.files.length === 0 ? (
                      <p className="text-xs text-[#6b8280]">No files uploaded.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {order.files.map((file) => (
                          <li key={file.path}>
                            {file.url ? (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#2a9d8f] font-semibold hover:underline break-all"
                              >
                                {file.path.split("/").at(-1)}
                              </a>
                            ) : (
                              <span className="text-xs text-[#6b8280] break-all">{file.path}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
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

    </div>
  );
}
