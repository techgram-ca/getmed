import { MapPin, Phone, ShoppingBag, Stethoscope, Truck } from "lucide-react";

export interface SearchPharmacy {
  id: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  url_slug: string | null;
  distance_km: number;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
  opening_hours: Record<string, { open: boolean; openTime: string; closeTime: string }>;
}

interface Props {
  pharmacy: SearchPharmacy;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  searchLat?: number;
  searchLng?: number;
  searchAddress?: string | null;
}

function isOpenNow(hours: Record<string, { open: boolean; openTime: string; closeTime: string }>) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now   = new Date();
  const day   = days[now.getDay()];
  const h     = hours?.[day];
  if (!h?.open) return false;

  const [oH, oM] = h.openTime.split(":").map(Number);
  const [cH, cM] = h.closeTime.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oH * 60 + oM && cur < cH * 60 + cM;
}

export default function PharmacyCard({ pharmacy: ph, index, isActive, onMouseEnter, onMouseLeave, searchLat, searchLng, searchAddress }: Props) {
  const open = isOpenNow(ph.opening_hours ?? {});

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`p-4 border-b border-[#e2efed] transition-colors cursor-default ${
        isActive ? "bg-[#f0fbf9]" : "hover:bg-[#f8fffe]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Number badge + logo */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#e0f5f2] flex items-center justify-center overflow-hidden border border-[#e2efed]">
            {ph.logo_url ? (
              <img src={ph.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-extrabold text-[#2a9d8f]">
                {ph.display_name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-white text-[0.6rem] font-extrabold flex items-center justify-center shadow-sm ${
            isActive ? "bg-[#e76f51]" : "bg-[#2a9d8f]"
          }`}>
            {index}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#0d1f1c] leading-tight">{ph.display_name}</h3>
            <span className={`shrink-0 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
              open ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"
            }`}>
              {open ? "Open" : "Closed"}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-[#6b8280] shrink-0" />
            <p className="text-xs text-[#6b8280] truncate">{ph.full_address}</p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-[#2a9d8f] font-semibold">
              <MapPin className="w-3 h-3" />
              {ph.distance_km.toFixed(1)} km
            </span>
            <span className="flex items-center gap-1 text-xs text-[#6b8280]">
              <Phone className="w-3 h-3" />
              {ph.phone}
            </span>
          </div>

          {/* Service tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {ph.service_online_orders && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                <ShoppingBag className="w-2.5 h-2.5" /> Orders
              </span>
            )}
            {ph.service_delivery && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                <Truck className="w-2.5 h-2.5" /> Delivery
              </span>
            )}
            {ph.service_consultation && (
              <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">
                <Stethoscope className="w-2.5 h-2.5" /> Consult
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="mt-3">
        <a
          href={(() => {
            const slug = ph.url_slug ?? ph.id;
            const p = new URLSearchParams();
            if (searchAddress) p.set("address", searchAddress);
            if (searchLat != null) p.set("lat", searchLat.toString());
            if (searchLng != null) p.set("lng", searchLng.toString());
            const qs = p.toString();
            return `/${slug}${qs ? `?${qs}` : ""}`;
          })()}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a9d8f] text-white text-xs font-bold hover:bg-[#21867a] transition-colors no-underline"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Order Now
        </a>
      </div>
    </div>
  );
}
