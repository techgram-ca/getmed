"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  HeartPulse,
  Languages,
  MapPin,
  Phone,
  ShoppingBag,
  Stethoscope,
  Truck,
  User,
} from "lucide-react";
import OrderTabs from "./OrderTabs";

interface Pharmacy {
  id: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  opening_hours: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  payment_methods: string[] | null;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
}

interface Pharmacist {
  full_name: string;
  photo_url: string | null;
  qualification: string | null;
  years_of_experience: number | null;
  specialization: string[] | null;
  languages: string[] | null;
  bio: string | null;
  consultation_modes: string[] | null;
  consultation_fee: number | null;
}

interface Props {
  pharmacy: Pharmacy;
  pharmacist: Pharmacist | null;
  defaultAddress: string | null;
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

function todayHours(hours: Record<string, { open: boolean; openTime: string; closeTime: string }>) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day  = days[new Date().getDay()];
  const h    = hours?.[day];
  if (!h?.open) return "Closed today";
  return `${h.openTime} – ${h.closeTime}`;
}

function PharmacyInfoCard({ pharmacy, open }: { pharmacy: Pharmacy; open: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 space-y-4">
      {/* Logo + Name */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 h-12 w-36 rounded-2xl bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
          {pharmacy.logo_url ? (
            <img src={pharmacy.logo_url} alt={pharmacy.display_name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xl font-extrabold text-[#2a9d8f]">
              {pharmacy.display_name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-[#0d1f1c] leading-tight">{pharmacy.display_name}</h2>
          <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            open ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"
          }`}>
            {open ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[#6b8280]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#2a9d8f]" />
          <span>{pharmacy.full_address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 shrink-0 text-[#2a9d8f]" />
          <a href={`tel:${pharmacy.phone}`} className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">
            {pharmacy.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 shrink-0 text-[#2a9d8f]" />
          <span>Today: {todayHours(pharmacy.opening_hours ?? {})}</span>
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Services</p>
        <div className="flex flex-wrap gap-1.5">
          {pharmacy.service_online_orders && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              <ShoppingBag className="w-3 h-3" /> Online Orders
            </span>
          )}
          {pharmacy.service_delivery && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              <Truck className="w-3 h-3" /> Delivery
            </span>
          )}
          {pharmacy.service_consultation && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
              <Stethoscope className="w-3 h-3" /> Consultation
            </span>
          )}
        </div>
      </div>

      {/* Payment methods */}
      {pharmacy.payment_methods && pharmacy.payment_methods.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Payment Methods</p>
          <div className="flex flex-wrap gap-1.5">
            {pharmacy.payment_methods.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f0fbf9] text-[#2a9d8f] border border-[#d0ece9] px-2 py-0.5 rounded-full">
                <CreditCard className="w-3 h-3" />
                {m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PharmacistInfoCard({ pharmacist }: { pharmacist: Pharmacist }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 space-y-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280]">Your Pharmacist</p>

      <div className="flex items-center gap-4">
        <div className="shrink-0 w-14 h-14 rounded-full bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
          {pharmacist.photo_url ? (
            <img src={pharmacist.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#2a9d8f]" />
          )}
        </div>
        <div>
          <p className="text-sm font-extrabold text-[#0d1f1c]">{pharmacist.full_name}</p>
          {pharmacist.qualification && (
            <p className="text-xs text-[#6b8280]">{pharmacist.qualification}</p>
          )}
          {pharmacist.years_of_experience != null && (
            <p className="text-xs text-[#6b8280]">{pharmacist.years_of_experience} yrs experience</p>
          )}
        </div>
      </div>

      {pharmacist.bio && (
        <p className="text-sm text-[#6b8280] leading-relaxed">{pharmacist.bio}</p>
      )}

      {pharmacist.specialization && pharmacist.specialization.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-1.5">Specialization</p>
          <div className="flex flex-wrap gap-1">
            {pharmacist.specialization.map((s) => (
              <span key={s} className="text-xs bg-[#f0fbf9] text-[#2a9d8f] border border-[#d0ece9] px-2 py-0.5 rounded-full font-semibold">{s}</span>
            ))}
          </div>
        </div>
      )}

      {pharmacist.languages && pharmacist.languages.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[#6b8280]">
          <Languages className="w-4 h-4 text-[#2a9d8f] shrink-0" />
          <span>{pharmacist.languages.join(", ")}</span>
        </div>
      )}

      {pharmacist.consultation_fee != null && (
        <div className="bg-[#f0fbf9] rounded-xl p-3">
          <p className="text-xs text-[#6b8280]">Consultation Fee</p>
          <p className="text-sm font-extrabold text-[#2a9d8f]">${pharmacist.consultation_fee.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-[#0d1f1c] hover:bg-[#f8fffe] transition-colors"
      >
        {title}
        {expanded ? <ChevronUp className="w-4 h-4 text-[#6b8280]" /> : <ChevronDown className="w-4 h-4 text-[#6b8280]" />}
      </button>
      {expanded && <div className="border-t border-[#e2efed]">{children}</div>}
    </div>
  );
}

export default function PharmacyLanding({ pharmacy, pharmacist, defaultAddress }: Props) {
  const open = isOpenNow(pharmacy.opening_hours ?? {});

  return (
    <div className="min-h-screen bg-[#f8fffe]">
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

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Mobile: collapsible info sections */}
        <div className="lg:hidden space-y-3 mb-6">
          <CollapsibleSection title={`📍 ${pharmacy.display_name}`}>
            <div className="p-4">
              <PharmacyInfoCard pharmacy={pharmacy} open={open} />
            </div>
          </CollapsibleSection>

          {pharmacist && (
            <CollapsibleSection title={`👨‍⚕️ ${pharmacist.full_name} — Your Pharmacist`}>
              <div className="p-4">
                <PharmacistInfoCard pharmacist={pharmacist} />
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Main layout */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
          {/* Left: Order form */}
          <div>
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-[#0d1f1c]">Place an Order</h2>
              <p className="text-sm text-[#6b8280] mt-1">
                Choose your order type and fill in your details below.
              </p>
            </div>
            <OrderTabs
              pharmacyId={pharmacy.id}
              address={defaultAddress}
              hasDelivery={pharmacy.service_delivery}
            />
          </div>

          {/* Right: Pharmacy + Pharmacist info (desktop only) */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-20">
            <PharmacyInfoCard pharmacy={pharmacy} open={open} />
            {pharmacist && <PharmacistInfoCard pharmacist={pharmacist} />}
          </div>
        </div>
      </div>
    </div>
  );
}
