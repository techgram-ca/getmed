"use client";

import {
  Award,
  Clock,
  Languages,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface NearbyPharmacy {
  id: string;
  url_slug: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  distance_km: number;
  pharmacist: {
    full_name: string;
    photo_url: string | null;
    qualification: string;
    license_number: string;
    years_of_experience: number | null;
    specialization: string[];
    languages: string[];
    bio: string | null;
    consultation_modes: string[];
    consultation_fee: number | null;
  } | null;
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  chat:  <MessageSquare className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
};

/* ── Pharmacist card ───────────────────────────────────────── */
function PharmacistCard({ ph }: { ph: NearbyPharmacy }) {
  return (
    <article className="bg-white rounded-2xl border border-[#e2efed] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Photo */}
          <div className="shrink-0 w-[72px] h-[72px] rounded-2xl bg-[#e0f5f2] border border-[#d0ede9] flex items-center justify-center overflow-hidden">
            {ph.pharmacist?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ph.pharmacist.photo_url}
                alt={ph.pharmacist.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-[#2a9d8f]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-[0.95rem] font-bold text-[#0d1f1c] leading-tight">
                  {ph.pharmacist?.full_name ?? "Pharmacist"}
                </h2>
                {ph.pharmacist?.qualification && (
                  <p className="text-xs text-[#2a9d8f] font-semibold mt-0.5">
                    {ph.pharmacist.qualification}
                  </p>
                )}
              </div>
              {ph.pharmacist != null && (
                <div className="text-right shrink-0">
                  {ph.pharmacist.consultation_fee && ph.pharmacist.consultation_fee > 0 ? (
                    <>
                      <p className="text-lg font-extrabold text-[#0d1f1c]">
                        ${ph.pharmacist.consultation_fee.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-[#6b8280]">per consult</p>
                    </>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Free
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#6b8280]">
              {ph.pharmacist?.years_of_experience != null && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#2a9d8f]" />
                  {ph.pharmacist.years_of_experience} yrs exp.
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#2a9d8f]" />
                {ph.distance_km.toFixed(1)} km away
              </span>
            </div>
          </div>
        </div>

        {/* Pharmacy name + address */}
        <div className="mt-3 pt-3 border-t border-[#f0f8f6]">
          <p className="text-xs font-semibold text-[#0d1f1c]">{ph.display_name}</p>
          <p className="text-[11px] text-[#6b8280] flex items-start gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-[#2a9d8f]" />
            {ph.full_address}, {ph.city}, {ph.province}
          </p>
          <p className="text-[11px] text-[#6b8280] mt-0.5">{ph.phone}</p>
        </div>

        {/* Specializations */}
        {ph.pharmacist?.specialization && ph.pharmacist.specialization.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {ph.pharmacist.specialization.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-[#e0f5f2] text-[#2a9d8f] text-[10px] font-semibold rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Languages */}
        {ph.pharmacist?.languages && ph.pharmacist.languages.length > 0 && (
          <p className="mt-2 text-[11px] text-[#6b8280] flex items-center gap-1">
            <Languages className="w-3 h-3 text-[#2a9d8f] shrink-0" />
            {ph.pharmacist.languages.join(", ")}
          </p>
        )}

        {/* Consultation modes */}
        {ph.pharmacist?.consultation_modes && ph.pharmacist.consultation_modes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ph.pharmacist.consultation_modes.map((mode) => (
              <span
                key={mode}
                className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#e2efed] rounded-full text-[10px] font-medium text-[#406460] capitalize"
              >
                {MODE_ICONS[mode] ?? null}
                {mode}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {ph.pharmacist?.bio && (
          <p className="mt-2 text-[11px] text-[#6b8280] leading-relaxed line-clamp-2">
            {ph.pharmacist.bio}
          </p>
        )}

        {/* Book button */}
        <div className="mt-4">
          <Button asChild className="w-full">
            <Link href={`/consult/${ph.url_slug}`} className="no-underline">
              Book Consultation
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ── Main export ───────────────────────────────────────────── */
interface Props {
  pharmacies: NearbyPharmacy[];
  radiusKm: number;
  searchAddress: string | null;
}

export default function NearbyPharmacists({ pharmacies, radiusKm, searchAddress }: Props) {
  if (pharmacies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e0f5f2] flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-[#2a9d8f]" />
        </div>
        <h3 className="text-lg font-bold text-[#0d1f1c] mb-2">No pharmacists found nearby</h3>
        <p className="text-sm text-[#6b8280] max-w-xs">
          No pharmacies offering consultations within {radiusKm} km of your address.
          Try a different location.
        </p>
        <Button asChild className="mt-6">
          <a href="/consult">Try another address</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* ── Left: results ─────────────────────────────────── */}
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#0d1f1c] tracking-tight">
              Pharmacists near you
            </h1>
            <p className="text-sm text-[#6b8280] mt-1">
              {pharmacies.length} pharmacist{pharmacies.length !== 1 ? "s" : ""} offering
              consultations within {radiusKm} km
              {searchAddress ? ` of "${searchAddress}"` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {pharmacies.map((ph) => (
              <PharmacistCard key={ph.id} ph={ph} />
            ))}
          </div>
        </div>

        {/* ── Right: sticky sidebar ─────────────────────────── */}
        <aside className="lg:sticky lg:top-[73px] space-y-4">
          {/* Search summary */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
            <p className="text-xs font-bold text-[#0d1f1c] uppercase tracking-wider mb-3">
              Your Search
            </p>
            {searchAddress && (
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                <p className="text-sm text-[#0d1f1c] font-medium leading-snug">{searchAddress}</p>
              </div>
            )}
            <p className="text-xs text-[#6b8280] mb-4">
              Showing results within <span className="font-semibold text-[#0d1f1c]">{radiusKm} km</span>
            </p>
            <a
              href="/consult"
              className="block text-center text-xs font-semibold text-[#2a9d8f] hover:underline no-underline"
            >
              Change address
            </a>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5">
            <p className="text-xs font-bold text-[#0d1f1c] uppercase tracking-wider mb-4">
              How it works
            </p>
            <ol className="space-y-3">
              {[
                { icon: MapPin,      text: "Choose a nearby pharmacist" },
                { icon: Stethoscope, text: "Book your consultation" },
                { icon: Zap,         text: "Get contacted within minutes" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#e0f5f2] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3 h-3 text-[#2a9d8f]" />
                  </div>
                  <p className="text-xs text-[#6b8280] leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Trust note */}
          <div className="bg-[#f0fbf9] rounded-2xl border border-[#d0ede9] p-5">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
              <p className="text-xs text-[#406460] leading-relaxed">
                All pharmacists are licensed and regulated in Canada.
                If your condition needs a doctor, they will refer you immediately.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
