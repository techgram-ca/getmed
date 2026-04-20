"use client";

import { useState } from "react";
import { Map, List } from "lucide-react";
import PharmacyCard, { type SearchPharmacy } from "./PharmacyCard";
import PharmacyMap from "./PharmacyMap";

interface Props {
  pharmacies: SearchPharmacy[];
  searchLat: number;
  searchLng: number;
  searchAddress: string | null;
  radiusKm: number;
}

export default function SearchResults({ pharmacies, searchLat, searchLng, searchAddress, radiusKm }: Props) {
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [mobileTab, setMobileTab]   = useState<"list" | "map">("list");

  const mapPharmacies = pharmacies
    .filter((ph) => ph.lat !== null && ph.lng !== null)
    .map((ph) => ({ id: ph.id, display_name: ph.display_name, lat: ph.lat as number, lng: ph.lng as number }));

  return (
    <>
      {/* Mobile tab switcher */}
      <div className="lg:hidden flex border-b border-[#e2efed] bg-white sticky top-[57px] z-30">
        {(["list", "map"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 ${
              mobileTab === tab
                ? "border-[#2a9d8f] text-[#2a9d8f]"
                : "border-transparent text-[#6b8280]"
            }`}
          >
            {tab === "list" ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
            {tab === "list" ? `List (${pharmacies.length})` : "Map"}
          </button>
        ))}
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: pharmacy list */}
        <div className={`w-full lg:w-[400px] xl:w-[440px] shrink-0 overflow-y-auto border-r border-[#e2efed] bg-white ${
          mobileTab === "map" ? "hidden lg:block" : "block"
        }`}>
          {pharmacies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#e0f5f2] flex items-center justify-center mb-4">
                <Map className="w-7 h-7 text-[#2a9d8f]" />
              </div>
              <p className="text-base font-bold text-[#0d1f1c]">No pharmacies found</p>
              <p className="text-sm text-[#6b8280] mt-1 max-w-[260px]">
                No approved pharmacies found within {radiusKm} km of your location. Try a different address.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-[#e2efed] bg-[#f8fffe]">
                <p className="text-xs font-semibold text-[#6b8280]">
                  {pharmacies.length} pharmacy{pharmacies.length !== 1 ? "s" : ""} within {radiusKm} km
                </p>
              </div>
              {pharmacies.map((ph, i) => (
                <PharmacyCard
                  key={ph.id}
                  pharmacy={ph}
                  index={i + 1}
                  isActive={activeId === ph.id}
                  onMouseEnter={() => setActiveId(ph.id)}
                  onMouseLeave={() => setActiveId(null)}
                  searchLat={searchLat}
                  searchLng={searchLng}
                  searchAddress={searchAddress}
                />
              ))}
            </>
          )}
        </div>

        {/* Right: map */}
        <div className={`flex-1 ${mobileTab === "list" ? "hidden lg:block" : "block"}`}>
          <PharmacyMap
            searchLat={searchLat}
            searchLng={searchLng}
            pharmacies={mapPharmacies}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setMobileTab("list");
            }}
          />
        </div>
      </div>
    </>
  );
}
