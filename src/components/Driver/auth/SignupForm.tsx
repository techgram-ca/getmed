"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, Camera, Car, CheckCircle2,
  Eye, EyeOff, FileText, HeartPulse, Loader2, MapPin, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { driverSignupAction } from "@/app/driver/signup/actions";

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
];

const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Truck", "Motorcycle", "Bicycle", "Electric Vehicle"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export default function DriverSignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Photo preview
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      const result = await driverSignupAction(fd);

      if (result.error) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#e2efed]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
            <span className="hidden sm:block ml-1 text-xs font-medium text-[#6b8280] border-l border-[#e2efed] pl-2">
              Driver Portal
            </span>
          </Link>
          <span className="text-xs text-[#6b8280]">
            Already a driver?{" "}
            <Link href="/driver/login" className="text-[#2a9d8f] font-semibold hover:underline no-underline">
              Sign in
            </Link>
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-[#e2efed] px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-[#0d1f1c] tracking-tight">Apply to Drive with GetMed</h1>
          <p className="mt-1.5 text-sm text-[#6b8280] max-w-xl">
            Deliver medications and earn flexible income. Complete the form below — our team reviews
            applications within 1–2 business days.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6b8280]">
            {["Flexible hours", "Competitive pay", "Fast approval"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2a9d8f]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ── Personal Information ─────────────────────────────── */}
        <Section title="Personal Information" icon={User}>
          {/* Photo */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide mb-2">
              Profile Photo <span className="text-[#6b8280] normal-case font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#e0f5f2] border-2 border-[#e2efed] flex items-center justify-center overflow-hidden shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-[#2a9d8f]" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-[#e2efed] bg-[#f8fffe] text-sm font-medium text-[#6b8280] hover:border-[#2a9d8f]/50 hover:text-[#2a9d8f] transition-colors">
                  <Camera className="w-4 h-4" /> Upload photo
                </span>
                <input
                  type="file" name="photoFile" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPhotoPreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input name="fullName" type="text" required placeholder="Jane Smith" className={inputCls} />
            </Field>
            <Field label="Phone Number" required>
              <input name="phone" type="tel" required placeholder="+1 (416) 555-0100" className={inputCls} />
            </Field>
            <Field label="Email Address" required>
              <input name="email" type="email" required placeholder="jane@email.com" className={inputCls} />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <input
                  name="password" type={showPassword ? "text" : "password"} required
                  minLength={8} placeholder="Min. 8 characters" className={`${inputCls} pr-11`}
                />
                <button
                  type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b8280] hover:text-[#0d1f1c] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>
        </Section>

        {/* ── Service Area ─────────────────────────────────────── */}
        <Section title="Service Area" icon={MapPin}>
          <p className="text-xs text-[#6b8280] mb-4">Where you&apos;ll primarily be picking up and delivering orders.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" required className="sm:col-span-1">
              <input name="city" type="text" required placeholder="Toronto" className={inputCls} />
            </Field>
            <Field label="Province" required className="sm:col-span-1">
              <select name="province" required className={inputCls}>
                <option value="">Select…</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Postal Code" required className="sm:col-span-1">
              <input name="postalCode" type="text" required placeholder="M5V 3A8" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Vehicle Information ──────────────────────────────── */}
        <Section title="Vehicle Information" icon={Car}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vehicle Type" required>
              <select name="vehicleType" required className={inputCls}>
                <option value="">Select type…</option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <select name="vehicleYear" className={inputCls}>
                <option value="">Select year…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Make">
              <input name="vehicleMake" type="text" placeholder="Toyota" className={inputCls} />
            </Field>
            <Field label="Model">
              <input name="vehicleModel" type="text" placeholder="Corolla" className={inputCls} />
            </Field>
            <Field label="License Plate" className="sm:col-span-2">
              <input name="vehiclePlate" type="text" placeholder="ABCD 123" className={`${inputCls} uppercase`} />
            </Field>
          </div>
        </Section>

        {/* ── Driver's License ─────────────────────────────────── */}
        <Section title="Driver's License" icon={FileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="License Number" required>
              <input name="licenseNumber" type="text" required placeholder="D1234-56789-AB123" className={inputCls} />
            </Field>
            <Field label="Issuing Province" required>
              <select name="licenseProvince" required className={inputCls}>
                <option value="">Select…</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Expiry Date" required>
              <input name="licenseExpiry" type="date" required className={inputCls} />
            </Field>
            <Field label="License Document" required>
              <label className="block cursor-pointer">
                <span className={`${inputCls} flex items-center gap-2 text-[#6b8280] cursor-pointer hover:border-[#2a9d8f]/50`}>
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {licenseFileName ?? "Upload PDF or image…"}
                  </span>
                </span>
                <input
                  type="file" name="licenseFile" accept=".pdf,image/*" required className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLicenseFileName(f.name);
                  }}
                />
              </label>
              <p className="mt-1.5 text-[0.65rem] text-[#a0b5b2]">Accepted: PDF, JPG, PNG — max 10 MB</p>
            </Field>
          </div>
        </Section>

        {/* ── Agreements ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e2efed] px-6 py-6 shadow-sm space-y-3">
          <p className="text-sm font-bold text-[#0d1f1c]">Agreements & Consents</p>
          {[
            {
              name: "backgroundConsent",
              label: "I consent to a background check as part of the driver approval process.",
            },
            {
              name: "termsConsent",
              label: (
                <>
                  I have read and agree to GetMed&apos;s{" "}
                  <Link href="/terms" className="text-[#2a9d8f] hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-[#2a9d8f] hover:underline">Privacy Policy</Link>.
                </>
              ),
            },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name={name} required className="mt-0.5 w-4 h-4 accent-[#2a9d8f] shrink-0" />
              <span className="text-sm text-[#6b8280] leading-relaxed">{label}</span>
            </label>
          ))}
        </div>

        {/* Submit */}
        <div className="bg-white rounded-2xl border border-[#e2efed] px-6 py-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0d1f1c]">Ready to apply?</p>
              <p className="text-xs text-[#6b8280] mt-0.5">
                We&apos;ll review your application and contact you within 1–2 business days.
              </p>
            </div>
            <Button type="submit" size="lg" disabled={loading} className="flex items-center gap-2 shrink-0">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <>Submit Application <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-[#f8fffe] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#e0f5f2] flex items-center justify-center mb-6">
        <CheckCircle2 className="w-9 h-9 text-[#2a9d8f]" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#0d1f1c] tracking-tight">Application Submitted!</h1>
      <p className="mt-3 text-sm text-[#6b8280] max-w-md">
        Thank you for applying to drive with GetMed. Our team will review your application and
        reach out within 1–2 business days. Keep an eye on your email.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2a9d8f] text-white text-sm font-semibold hover:bg-[#21867a] transition-colors no-underline"
      >
        <HeartPulse className="w-4 h-4" />
        Back to GetMed
      </Link>
    </div>
  );
}

// ── Internal helpers ─────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-3 rounded-xl border border-[#e2efed] bg-[#f8fffe] text-sm text-[#0d1f1c] placeholder:text-[#a0b5b2] focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/40 focus:border-[#2a9d8f] transition";

function Section({
  title, icon: Icon, children,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] px-6 py-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#e2efed]">
        <div className="w-8 h-8 rounded-lg bg-[#e0f5f2] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#2a9d8f]" />
        </div>
        <h2 className="text-base font-bold text-[#0d1f1c]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, required, children, className,
}: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-[#0d1f1c] uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
