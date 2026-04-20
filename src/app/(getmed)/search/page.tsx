import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartPulse, Search } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import SearchResults from "@/components/GetMed/search/SearchResults";
import type { SearchPharmacy } from "@/components/GetMed/search/PharmacyCard";

export const metadata: Metadata = { title: "Find a Pharmacy — GetMed" };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; address?: string }>;
}) {
  const { lat: latStr, lng: lngStr, address } = await searchParams;

  const lat = parseFloat(latStr ?? "");
  const lng = parseFloat(lngStr ?? "");

  if (isNaN(lat) || isNaN(lng)) redirect("/");

  const admin = createAdminClient();

  // Fetch configured search radius (default 10 km)
  const { data: setting } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "search_radius_km")
    .single();

  const radiusKm = parseFloat(setting?.value ?? "10");

  // Fetch all approved pharmacies with coordinates
  const { data: rows } = await admin
    .from("pharmacies")
    .select(
      "id, display_name, logo_url, full_address, city, province, phone, lat, lng, url_slug, service_online_orders, service_delivery, service_consultation, opening_hours"
    )
    .eq("status", "approved")
    .not("lat", "is", null)
    .not("lng", "is", null);

  // Filter by radius + attach distance
  const pharmacies: SearchPharmacy[] = (rows ?? [])
    .map((ph) => ({
      ...ph,
      distance_km: haversineKm(lat, lng, ph.lat!, ph.lng!),
    }))
    .filter((ph) => ph.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 bg-white border-b border-[#e2efed] px-4 h-[57px] flex items-center gap-4 z-40">
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-8 h-8 rounded-[9px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Search className="w-4 h-4 text-[#6b8280] shrink-0" />
          <p className="text-sm text-[#0d1f1c] font-medium truncate">
            {address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
          </p>
        </div>

        <Link
          href="/"
          className="shrink-0 text-xs font-semibold text-[#2a9d8f] hover:underline no-underline"
        >
          Change address
        </Link>
      </header>

      {/* Split layout fills the remaining viewport */}
      <SearchResults
        pharmacies={pharmacies}
        searchLat={lat}
        searchLng={lng}
        searchAddress={address ?? null}
        radiusKm={radiusKm}
      />
    </div>
  );
}
