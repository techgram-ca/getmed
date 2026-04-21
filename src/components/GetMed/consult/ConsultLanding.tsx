"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Droplets,
  Heart,
  Layers,
  Leaf,
  Microscope,
  Search,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import AddressAutocomplete, { type PlaceResult } from "@/components/GetMed/AddressAutocomplete";
import { Button } from "@/components/ui/button";

const HERO_IMG = "images/hero.png";

const CONDITIONS = [
  {
    Icon: Microscope,
    title: "Infections",
    conditions: ["Urinary tract infection (UTI)", "Pink eye", "Oral thrush"],
    bg: "#e0f5f2",
    iconColor: "#2a9d8f",
  },
  {
    Icon: Layers,
    title: "Skin Conditions",
    conditions: ["Acne", "Eczema", "Cold sores"],
    bg: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    Icon: Leaf,
    title: "Allergies",
    conditions: ["Seasonal allergies", "Food sensitivities"],
    bg: "#ede9fe",
    iconColor: "#7c3aed",
  },
  {
    Icon: Activity,
    title: "Pain & Minor Injuries",
    conditions: ["Headaches", "Muscle pain / sprains"],
    bg: "#fee2e2",
    iconColor: "#dc2626",
  },
  {
    Icon: Heart,
    title: "Women's Health",
    conditions: ["Yeast infections", "Menstrual pain"],
    bg: "#fce7f3",
    iconColor: "#be185d",
  },
  {
    Icon: Thermometer,
    title: "Fever & Respiratory",
    conditions: ["Common cold symptoms", "Mild fever", "Sore throat"],
    bg: "#fff7ed",
    iconColor: "#ea580c",
  },
];

export default function ConsultLanding() {
  const router = useRouter();
  const [showAddress, setShowAddress] = useState(false);
  const [place, setPlace] = useState<PlaceResult | null>(null);

  function handlePlaceSelect(p: PlaceResult) {
    setPlace(p);
    router.push(
      `/consult/nearby?lat=${p.lat}&lng=${p.lng}&address=${encodeURIComponent(p.address)}`
    );
  }

  function handleFindPharmacists() {
    if (!place) {
      document.getElementById("consult-address")?.focus();
      return;
    }
    router.push(
      `/consult/nearby?lat=${place.lat}&lng=${place.lng}&address=${encodeURIComponent(place.address)}`
    );
  }

  return (
    <>
      {/* ── Hero: two-column layout ─────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#e0f5f2] via-[#f0fbf9] to-white">
        <div className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                <Stethoscope className="w-3.5 h-3.5" />
                Licensed Canadian Pharmacists
              </div>

              <h1 className="text-[clamp(2.2rem,4.5vw,3.4rem)] font-extrabold text-[#0d1f1c] tracking-tight leading-[1.15] mb-4">
                Consult a pharmacist —{" "}
                <span className="text-[#2a9d8f]">from anywhere</span>
              </h1>

              <p className="text-[1.05rem] text-[#6b8280] leading-[1.7] max-w-[480px] mb-6">
                Get expert advice, prescriptions, and treatment for common conditions
                without leaving home.
              </p>

              <div className="flex flex-wrap gap-5 text-sm text-[#6b8280] mb-8">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  No appointment needed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  Quick response
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  Covered by most plans
                </span>
              </div>

              {showAddress ? (
                <div className="flex flex-wrap gap-3">
                  <AddressAutocomplete
                    inputId="consult-address"
                    onAddressChange={() => setPlace(null)}
                    onPlaceSelect={handlePlaceSelect}
                    onEnter={handleFindPharmacists}
                    placeholder="Enter your address..."
                    className="flex-1 min-w-[220px]"
                  />
                  <Button
                    size="search"
                    onClick={handleFindPharmacists}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    Find Pharmacists
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <Button
                    size="lg"
                    onClick={() => setShowAddress(true)}
                    className="gap-2"
                  >
                    Start Consultation
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-[#6b8280]">Takes less than 2 minutes</p>
                </div>
              )}
            </div>

            {/* Right column – hero image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-[-12px] bg-[#e0f5f2] rounded-[28px] rotate-3" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="Consult a pharmacist"
                className="relative rounded-2xl w-full object-cover shadow-[0_32px_80px_rgba(42,157,143,0.15)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Conditions section ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f1c] tracking-tight">
              Conditions pharmacists can treat
            </h2>
            <p className="text-[#6b8280] mt-3 text-base max-w-lg mx-auto">
              Get quick assessment and treatment for common minor conditions — no clinic visit needed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONDITIONS.map(({ Icon, title, conditions, bg, iconColor }) => (
              <div
                key={title}
                className="bg-[#f8fffe] rounded-2xl border border-[#e2efed] p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <h3 className="text-base font-bold text-[#0d1f1c] mb-3">{title}</h3>
                <ul className="space-y-2">
                  {conditions.map((c) => (
                    <li key={c} className="text-sm text-[#6b8280] flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0"
                        style={{ backgroundColor: iconColor }}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center space-y-2">
            <p className="text-sm text-[#6b8280]">
              👉 <span className="font-medium text-[#0d1f1c]">+ Many more minor conditions</span>
            </p>
            <p className="text-sm text-[#6b8280]">
              If your condition is not suitable, our pharmacist will refer you to a doctor.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 flex flex-col items-center gap-3">
            {showAddress ? (
              <div className="flex flex-wrap gap-3 w-full max-w-xl justify-center">
                <AddressAutocomplete
                  inputId="consult-address-bottom"
                  onAddressChange={() => setPlace(null)}
                  onPlaceSelect={handlePlaceSelect}
                  onEnter={handleFindPharmacists}
                  placeholder="Enter your address..."
                  className="flex-1 min-w-[220px]"
                />
                <Button
                  size="search"
                  onClick={handleFindPharmacists}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Find Pharmacists
                </Button>
              </div>
            ) : (
              <>
                <Button size="lg" onClick={() => setShowAddress(true)} className="gap-2">
                  Start Consultation
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-xs text-[#6b8280]">Takes less than 2 minutes</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
