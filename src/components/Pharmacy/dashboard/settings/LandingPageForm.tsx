"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Edit2, ImagePlus, Loader2, X } from "lucide-react";
import { updateLandingPageAction } from "@/app/pharmacy/dashboard/settings/actions";

interface StatCard {
  value: string;
  label: string;
}

interface Props {
  pharmacy: {
    hero_image_url:    string | null;
    hero_title:        string | null;
    hero_subtitle:     string | null;
    about_heading:     string | null;
    about_description: string | null;
    landing_stats:     StatCard[] | null;
  };
}

const EMPTY_STATS: [StatCard, StatCard, StatCard] = [
  { value: "", label: "" },
  { value: "", label: "" },
  { value: "", label: "" },
];

function toStatTriple(raw: StatCard[] | null): [StatCard, StatCard, StatCard] {
  const base = raw ?? [];
  return [
    base[0] ?? { value: "", label: "" },
    base[1] ?? { value: "", label: "" },
    base[2] ?? { value: "", label: "" },
  ];
}

function HeroPreview({ url }: { url: string | null }) {
  if (!url) return <p className="text-xs text-[#a0b5b2]">No hero image uploaded</p>;
  return (
    <div className="w-full h-[120px] rounded-xl overflow-hidden border border-[#e2efed]">
      <img src={url} alt="Hero" className="w-full h-full object-cover" />
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors";

const textareaCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-[#e2efed] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/30 focus:border-[#2a9d8f] transition-colors resize-none min-h-[100px]";

export default function LandingPageForm({ pharmacy }: Props) {
  const [editing, setEditing]      = useState(false);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess]      = useState(false);
  const [error, setError]          = useState<string | null>(null);

  const [heroTitle,        setHeroTitle]        = useState(pharmacy.hero_title        ?? "");
  const [heroSubtitle,     setHeroSubtitle]      = useState(pharmacy.hero_subtitle     ?? "");
  const [aboutHeading,     setAboutHeading]      = useState(pharmacy.about_heading     ?? "");
  const [aboutDescription, setAboutDescription]  = useState(pharmacy.about_description ?? "");
  const [stats, setStats]                        = useState<[StatCard, StatCard, StatCard]>(toStatTriple(pharmacy.landing_stats));
  const [heroImageFile, setHeroImageFile]        = useState<File | null>(null);
  const [heroPreview,   setHeroPreview]          = useState<string | null>(pharmacy.hero_image_url);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!heroImageFile) return;
    const url = URL.createObjectURL(heroImageFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroImageFile]);

  function handleCancel() {
    setEditing(false);
    setError(null);
    setHeroTitle(pharmacy.hero_title        ?? "");
    setHeroSubtitle(pharmacy.hero_subtitle  ?? "");
    setAboutHeading(pharmacy.about_heading  ?? "");
    setAboutDescription(pharmacy.about_description ?? "");
    setStats(toStatTriple(pharmacy.landing_stats));
    setHeroImageFile(null);
    setHeroPreview(pharmacy.hero_image_url);
  }

  function setStat(i: number, field: keyof StatCard, v: string) {
    setStats((prev) => {
      const next = prev.map((s, idx) => idx === i ? { ...s, [field]: v } : s) as [StatCard, StatCard, StatCard];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("heroTitle",        heroTitle);
    fd.set("heroSubtitle",     heroSubtitle);
    fd.set("aboutHeading",     aboutHeading);
    fd.set("aboutDescription", aboutDescription);
    fd.set("landingStats",     JSON.stringify(stats.filter((s) => s.value || s.label)));
    if (heroImageFile) fd.set("heroImageFile", heroImageFile);

    startTransition(async () => {
      const res = await updateLandingPageAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setEditing(false);
        setHeroImageFile(null);
      }
    });
  }

  /* ── View mode ─────────────────────────────────────────────── */
  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0d1f1c]">Landing Page</h2>
          <button
            type="button"
            onClick={() => { setEditing(true); setSuccess(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2a9d8f] border border-[#2a9d8f]/30 hover:bg-[#e0f5f2] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Landing page updated successfully.
          </div>
        )}

        <div>
          <p className="text-xs text-[#6b8280] mb-2">Hero Image</p>
          <HeroPreview url={heroPreview} />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">Hero Title</dt>
            <dd className="font-semibold text-[#0d1f1c]">{heroTitle || <span className="text-[#a0b5b2] font-normal">Defaults to pharmacy name</span>}</dd>
          </div>
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">Hero Subtitle</dt>
            <dd className="font-semibold text-[#0d1f1c]">{heroSubtitle || <span className="text-[#a0b5b2] font-normal">None</span>}</dd>
          </div>
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">About Heading</dt>
            <dd className="font-semibold text-[#0d1f1c]">{aboutHeading || <span className="text-[#a0b5b2] font-normal">Auto-generated</span>}</dd>
          </div>
          <div>
            <dt className="text-[#6b8280] text-xs mb-0.5">About Description</dt>
            <dd className="font-semibold text-[#0d1f1c] line-clamp-2">{aboutDescription || <span className="text-[#a0b5b2] font-normal">Default text</span>}</dd>
          </div>
        </dl>

        {stats.some((s) => s.value || s.label) && (
          <div>
            <p className="text-xs text-[#6b8280] mb-2">Trust Stats</p>
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s, i) => (
                <div key={i} className="bg-[#f8fffe] rounded-xl border border-[#e2efed] p-3 text-center">
                  <p className="text-base font-extrabold text-[#0d1f1c]">{s.value || "—"}</p>
                  <p className="text-xs text-[#6b8280] mt-0.5">{s.label || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Edit mode ─────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0d1f1c]">Landing Page</h2>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6b8280] border border-[#e2efed] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>

      {/* Hero image */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-2">Hero Background Image</p>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { setHeroImageFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
        />
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="relative w-full h-[140px] rounded-2xl border-2 border-dashed border-[#e2efed] bg-[#f8fffe] hover:border-[#2a9d8f] hover:bg-[#f0fbf9] transition-all flex items-center justify-center overflow-hidden group"
        >
          {heroPreview ? (
            <img src={heroPreview} alt="Hero" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="w-7 h-7 text-[#6b8280] group-hover:text-[#2a9d8f] transition-colors" />
              <span className="text-xs font-semibold text-[#6b8280] group-hover:text-[#2a9d8f]">
                {heroImageFile ? "Change image" : "Upload hero image"}
              </span>
            </div>
          )}
        </button>
        {heroImageFile && (
          <button
            type="button"
            onClick={() => { setHeroImageFile(null); setHeroPreview(pharmacy.hero_image_url); }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent p-0"
          >
            <X className="w-3 h-3" /> Remove new image
          </button>
        )}
      </div>

      {/* Hero text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Hero Title <span className="font-normal text-[#6b8280]">(optional)</span>
          </label>
          <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. HealthFirst Pharmacy" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0d1f1c] mb-1.5">
            Hero Subtitle / Tagline <span className="font-normal text-[#6b8280]">(optional)</span>
          </label>
          <input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="e.g. Trusted care for every family" className={inputCls} />
        </div>
      </div>

      {/* About us */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#0d1f1c]">About Us Section</p>
        <div>
          <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
            Heading <span className="font-normal text-[#6b8280]">(optional)</span>
          </label>
          <input value={aboutHeading} onChange={(e) => setAboutHeading(e.target.value)} placeholder="e.g. Caring for Toronto since 2008" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f1c] mb-1.5">
            Description <span className="font-normal text-[#6b8280]">(optional)</span>
          </label>
          <textarea value={aboutDescription} onChange={(e) => setAboutDescription(e.target.value)} placeholder="Tell patients about your pharmacy…" className={textareaCls} />
        </div>
      </div>

      {/* Trust stats */}
      <div>
        <p className="text-sm font-semibold text-[#0d1f1c] mb-1">Trust Stats</p>
        <p className="text-xs text-[#6b8280] mb-3">Leave all blank to hide the stats section.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-2 bg-[#f8fffe] rounded-xl border border-[#e2efed] p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#6b8280]">Stat {i + 1}</p>
              <input value={stat.value} onChange={(e) => setStat(i, "value", e.target.value)} placeholder={["15+", "15,000+", "#1"][i]} className={inputCls} />
              <input value={stat.label} onChange={(e) => setStat(i, "label", e.target.value)} placeholder={["Years serving", "Patients served", "Rated in city"][i]} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a9d8f] text-white text-sm font-bold hover:bg-[#21867a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {pending ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-[#e2efed] text-sm font-semibold text-[#6b8280] hover:bg-[#f8fffe] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
