"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AddressAutocomplete, { type PlaceResult } from "./AddressAutocomplete";

const HERO_IMG =
  "images/hero.png";

export default function Hero() {
  const router = useRouter();
  const [place, setPlace] = useState<PlaceResult | null>(null);

  function handleSearch() {
    if (!place) {
      document.getElementById("hero-address-input")?.focus();
      return;
    }
    const params = new URLSearchParams({
      lat:     place.lat.toString(),
      lng:     place.lng.toString(),
      address: place.address,
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left column */}
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-[#2a9d8f] pulse-dot" />
            Trusted by 10,000+ users
          </div>

          <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.15] tracking-tight">
            Get Your <span className="text-[#2a9d8f]">Medicines</span> Delivered
          </h1>

          <p className="mt-4 text-[1.1rem] text-[#6b8280] max-w-[500px] leading-[1.7]">
            Quickly order prescription medicines from nearby pharmacies and get
            them delivered straight to your door — safe, fast, and hassle-free.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <AddressAutocomplete
              inputId="hero-address-input"
              onAddressChange={() => setPlace(null)}
              onPlaceSelect={setPlace}
              onEnter={handleSearch}
            />
            <Button size="search" onClick={handleSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Find Pharmacies
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-3 text-xs text-[#6b8280]">
            <div className="flex">
              {[1, 2, 3, 4].map((n, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={n}
                  src={`/images/user-${n}.jpg`}
                  alt={`User ${n}`}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  style={{ marginLeft: i === 0 ? 0 : -6 }}
                />
              ))}
            </div>
            <span>Join thousands getting medicines delivered daily</span>
          </div>
        </div>

        {/* Right column – hero image */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-[-12px] bg-[#e0f5f2] rounded-[28px] rotate-3" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt="Medicine delivery"
            className="relative rounded-2xl w-full object-cover shadow-[0_32px_80px_rgba(42,157,143,0.15)]"
          />
        </div>
      </div>
    </div>
  );
}
