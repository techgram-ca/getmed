"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Heart,
  Layers,
  Leaf,
  Microscope,
  Stethoscope,
  Wind,
} from "lucide-react";
import AddressAutocomplete, { PlaceResult } from "@/components/GetMed/AddressAutocomplete";
import { Button } from "@/components/ui/button";

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
    conditions: ["Seasonal allergies"],
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
    conditions: ["Yeast infections"],
    bg: "#fce7f3",
    iconColor: "#be185d",
  },
];

export default function ConsultLanding() {
  const router = useRouter();
  const [showAddress, setShowAddress] = useState(false);

  function handlePlaceSelect(place: PlaceResult) {
    router.push(
      `/consult/nearby?lat=${place.lat}&lng=${place.lng}&address=${encodeURIComponent(place.address)}`
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#e0f5f2] via-[#f0fbf9] to-white pt-28 pb-16 px-6">
        <div className="max-w-[760px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <Stethoscope className="w-3.5 h-3.5" />
            Licensed Canadian Pharmacists
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d1f1c] tracking-tight leading-tight mb-4">
            Consult a pharmacist —{" "}
            <span className="text-[#2a9d8f]">from anywhere</span>
          </h1>
          <p className="text-[#6b8280] text-lg max-w-lg mx-auto mb-8">
            Get expert advice, prescriptions, and treatment for common conditions without
            leaving home.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#6b8280] mb-8">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />No appointment needed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />Quick response</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />Covered by most plans</span>
          </div>

          {showAddress ? (
            <div className="max-w-md mx-auto flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#0d1f1c]">Enter your address to find nearby pharmacists</p>
              <AddressAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter your address..."
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" onClick={() => setShowAddress(true)} className="gap-2">
                Start Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-[#6b8280]">Takes less than 2 minutes</p>
            </div>
          )}
        </div>
      </section>

      {/* Conditions section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
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

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-[#6b8280]">
              👉 <span className="font-medium text-[#0d1f1c]">+ Many more minor conditions</span>
            </p>
            <p className="text-sm text-[#6b8280]">
              If your condition is not suitable, our pharmacist will refer you to a doctor.
            </p>
          </div>

          {/* CTA repeat */}
          <div className="mt-10 flex flex-col items-center gap-3">
            {showAddress ? (
              <div className="max-w-md w-full flex flex-col gap-3">
                <p className="text-sm font-semibold text-[#0d1f1c] text-center">Enter your address to find nearby pharmacists</p>
                <AddressAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter your address..."
                  className="w-full"
                />
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
