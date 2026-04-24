"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { LayoutTemplate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "../SectionCard";

export interface StatCard {
  value: string;
  label: string;
}

export interface LandingPageValue {
  heroImageFile: File | null;
  heroTitle: string;
  heroSubtitle: string;
  aboutHeading: string;
  aboutDescription: string;
  stats: [StatCard, StatCard, StatCard];
}

export const DEFAULT_LANDING_PAGE: LandingPageValue = {
  heroImageFile: null,
  heroTitle: "",
  heroSubtitle: "",
  aboutHeading: "",
  aboutDescription: "",
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
};

interface Props {
  value: LandingPageValue;
  onChange: (v: LandingPageValue) => void;
  step: number;
}

function HeroImageUpload({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) { setPreview(null); return; }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="space-y-2">
      <input
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ""; }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative w-full h-[160px] rounded-2xl border-2 border-dashed border-[#e2efed] bg-[#f8fffe] hover:border-[#2a9d8f] hover:bg-[#f0fbf9] transition-all flex items-center justify-center overflow-hidden group"
        aria-label="Upload hero image"
      >
        {preview ? (
          <img src={preview} alt="Hero preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="w-8 h-8 text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors" />
            <span className="text-xs font-semibold text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors">
              Click to upload hero background image
            </span>
            <span className="text-[0.65rem] text-[#a0b5b2]">JPG, PNG or WebP · max 10 MB · recommended 1440×480</span>
          </div>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent p-0"
        >
          <X className="w-3 h-3" /> Remove image
        </button>
      )}
    </div>
  );
}

export default function LandingPage({ value, onChange, step }: Props) {
  function set<K extends keyof LandingPageValue>(key: K, v: LandingPageValue[K]) {
    onChange({ ...value, [key]: v });
  }

  function setStat(index: number, field: keyof StatCard, v: string) {
    const next = value.stats.map((s, i) =>
      i === index ? { ...s, [field]: v } : s
    ) as [StatCard, StatCard, StatCard];
    set("stats", next);
  }

  return (
    <SectionCard
      step={step}
      title="Landing Page"
      description="Customise the page patients see when your pharmacy shares its link."
      icon={LayoutTemplate}
    >
      {/* Hero image */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-2">
          Hero Background Image <span className="text-[#6b8280] font-normal">(optional)</span>
        </p>
        <HeroImageUpload value={value.heroImageFile} onChange={(f) => set("heroImageFile", f)} />
      </div>

      {/* Hero text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Hero Title" hint="defaults to pharmacy name">
          <Input
            value={value.heroTitle}
            onChange={(e) => set("heroTitle", e.target.value)}
            placeholder="e.g. HealthFirst Pharmacy"
          />
        </Field>
        <Field label="Hero Subtitle / Tagline" hint="optional">
          <Input
            value={value.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
            placeholder="e.g. Trusted care for every family"
          />
        </Field>
      </div>

      {/* About us */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#0d1f1c]">About Us Section</p>
        <Field label="Heading" hint="optional">
          <Input
            value={value.aboutHeading}
            onChange={(e) => set("aboutHeading", e.target.value)}
            placeholder="e.g. Caring for Toronto since 2008"
          />
        </Field>
        <Field label="Description" hint="optional">
          <Textarea
            value={value.aboutDescription}
            onChange={(e) => set("aboutDescription", e.target.value)}
            placeholder="Tell patients about your pharmacy, your team, and your values…"
            className="min-h-[100px]"
          />
        </Field>
      </div>

      {/* Trust stats */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-1">Trust Stats</p>
        <p className="text-xs text-[#6b8280] mb-3">3 highlight cards shown on your landing page. Leave blank to hide.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {value.stats.map((stat, i) => (
            <div key={i} className="space-y-2 bg-[#f8fffe] rounded-xl border border-[#e2efed] p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#6b8280]">
                Stat {i + 1}
              </p>
              <Input
                value={stat.value}
                onChange={(e) => setStat(i, "value", e.target.value)}
                placeholder={["15+", "15,000+", "#1"][i]}
              />
              <Input
                value={stat.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
                placeholder={["Years serving", "Patients served", "Rated in city"][i]}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
        {label}
        {hint && <span className="ml-1 font-normal text-[#6b8280]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
