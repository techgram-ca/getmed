import Link from "next/link";
import { HeartPulse, MapPin, Phone, ShoppingBag, Stethoscope, Truck } from "lucide-react";

interface Pharmacy {
  display_name: string;
  logo_url: string | null;
  full_address: string;
  phone: string;
  opening_hours: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
}

function isOpenNow(hours: Record<string, { open: boolean; openTime: string; closeTime: string }>) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now  = new Date();
  const day  = days[now.getDay()];
  const h    = hours?.[day];
  if (!h?.open) return false;
  const [oH, oM] = h.openTime.split(":").map(Number);
  const [cH, cM] = h.closeTime.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oH * 60 + oM && cur < cH * 60 + cM;
}

export default function PharmacyHeader({ pharmacy }: { pharmacy: Pharmacy }) {
  const open = isOpenNow(pharmacy.opening_hours ?? {});

  return (
    <>
      {/* Top nav */}
      <header className="bg-white border-b border-[#e2efed] px-4 h-14 flex items-center gap-3 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>
        <span className="text-[#d0e8e5]">/</span>
        <span className="text-sm text-[#6b8280] truncate font-medium">{pharmacy.display_name}</span>
      </header>

      {/* Pharmacy hero */}
      <div className="bg-white border-b border-[#e2efed]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
              {pharmacy.logo_url ? (
                <img src={pharmacy.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-[#2a9d8f]">
                  {pharmacy.display_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="text-xl font-extrabold text-[#0d1f1c] leading-tight">
                  {pharmacy.display_name}
                </h1>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                  open ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"
                }`}>
                  {open ? "Open Now" : "Closed"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-[#6b8280]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {pharmacy.full_address}
              </div>

              <a
                href={`tel:${pharmacy.phone}`}
                className="flex items-center gap-1.5 mt-1 no-underline group w-fit"
              >
                <Phone className="w-3.5 h-3.5 text-[#6b8280] shrink-0" />
                <span className="text-sm text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors">
                  {pharmacy.phone}
                </span>
              </a>

              <div className="flex flex-wrap gap-2 mt-3">
                {pharmacy.service_online_orders && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                    <ShoppingBag className="w-3 h-3" /> Online Orders
                  </span>
                )}
                {pharmacy.service_delivery && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full">
                    <Truck className="w-3 h-3" /> Delivery
                  </span>
                )}
                {pharmacy.service_consultation && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">
                    <Stethoscope className="w-3 h-3" /> Consultation
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
