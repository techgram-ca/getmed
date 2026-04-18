"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacySignupAction } from "@/app/pharmacy/signup/actions";

import BasicInfo, {
  type BasicInfoValue,
} from "./sections/BasicInfo";
import PharmacyDetails, {
  DEFAULT_PHARMACY_DETAILS,
  type PharmacyDetailsValue,
} from "./sections/PharmacyDetails";
import Services, { type ServicesValue } from "./sections/Services";
import PharmacistDetails, {
  DEFAULT_PHARMACIST,
  type PharmacistValue,
} from "./sections/PharmacistDetails";

interface FormState {
  basic: BasicInfoValue;
  pharmacy: PharmacyDetailsValue;
  services: ServicesValue;
  pharmacist: PharmacistValue;
}

const INITIAL: FormState = {
  basic: { contactName: "", email: "", phone: "", password: "" },
  pharmacy: DEFAULT_PHARMACY_DETAILS,
  services: { onlineOrders: false, delivery: false, consultation: false },
  pharmacist: DEFAULT_PHARMACIST,
};

export default function SignupForm() {
  const [form, setForm]       = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();

      // ── Auth fields ────────────────────────────────────────────
      fd.append("email",       form.basic.email);
      fd.append("password",    form.basic.password);
      fd.append("contactName", form.basic.contactName);
      fd.append("phone",       form.basic.phone);

      // ── Pharmacy details (no files) ────────────────────────────
      fd.append(
        "pharmacy",
        JSON.stringify({
          legalName:     form.pharmacy.legalName,
          displayName:   form.pharmacy.displayName,
          address:       form.pharmacy.address,
          licenseNumber: form.pharmacy.licenseNumber,
          openingHours:  form.pharmacy.openingHours,
          paymentMethods: form.pharmacy.paymentMethods,
        })
      );

      // ── Services ───────────────────────────────────────────────
      fd.append("services", JSON.stringify(form.services));

      // ── Files ─────────────────────────────────────────────────
      if (form.pharmacy.licenseFile) {
        fd.append("licenseFile", form.pharmacy.licenseFile);
      }

      // ── Pharmacist (only when consultation is selected) ────────
      if (form.services.consultation) {
        fd.append(
          "pharmacist",
          JSON.stringify({
            fullName:           form.pharmacist.fullName,
            qualification:      form.pharmacist.qualification,
            licenseNumber:      form.pharmacist.licenseNumber,
            yearsOfExperience:  form.pharmacist.yearsOfExperience,
            specialization:     form.pharmacist.specialization,
            languages:          form.pharmacist.languages,
            bio:                form.pharmacist.bio,
            availabilityHours:  form.pharmacist.availabilityHours,
            modes:              form.pharmacist.modes,
            fee:                form.pharmacist.fee,
          })
        );
        if (form.pharmacist.photo) {
          fd.append("pharmacistPhoto", form.pharmacist.photo);
        }
      }

      const result = await pharmacySignupAction(fd);

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
    return <SuccessScreen name={form.basic.contactName} pharmacy={form.pharmacy.displayName} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      {/* Top bar */}
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
              Pharmacy Portal
            </span>
          </Link>

          <span className="text-xs text-[#6b8280]">
            Already registered?{" "}
            <a href="#" className="text-[#2a9d8f] font-semibold hover:underline">
              Sign in
            </a>
          </span>
        </div>
      </header>

      {/* Page hero */}
      <div className="bg-white border-b border-[#e2efed] px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-[#0d1f1c] tracking-tight">
            Register Your Pharmacy
          </h1>
          <p className="mt-1.5 text-sm text-[#6b8280] max-w-xl">
            Join GetMed to reach more patients in your area. Complete all sections below — we&apos;ll
            review your application within 1–2 business days.
          </p>

          {/* Progress pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Basic Info",
              "Pharmacy Details",
              "Services",
              ...(form.services.consultation ? ["Pharmacist Profile"] : []),
            ].map((label, i) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold"
              >
                <span className="w-4 h-4 rounded-full bg-[#2a9d8f] text-white text-[0.6rem] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <BasicInfo
          value={form.basic}
          onChange={(v) => setForm((prev) => ({ ...prev, basic: v }))}
        />

        <PharmacyDetails
          value={form.pharmacy}
          onChange={(v) => setForm((prev) => ({ ...prev, pharmacy: v }))}
        />

        <Services
          value={form.services}
          onChange={(v) => setForm((prev) => ({ ...prev, services: v }))}
        />

        {form.services.consultation && (
          <PharmacistDetails
            value={form.pharmacist}
            onChange={(v) => setForm((prev) => ({ ...prev, pharmacist: v }))}
          />
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="bg-white rounded-2xl border border-[#e2efed] px-6 py-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0d1f1c]">Ready to submit?</p>
              <p className="text-xs text-[#6b8280] mt-0.5">
                We&apos;ll review your application and contact you within 1–2 business days.
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          <p className="mt-4 text-[0.7rem] text-[#6b8280] border-t border-[#e2efed] pt-4">
            By submitting this form you agree to GetMed&apos;s{" "}
            <a href="#" className="text-[#2a9d8f] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#2a9d8f] hover:underline">
              Privacy Policy
            </a>
            . Your information is kept confidential and used only for verification purposes.
          </p>
        </div>
      </form>
    </div>
  );
}

function SuccessScreen({ name, pharmacy }: { name: string; pharmacy: string }) {
  return (
    <div className="min-h-screen bg-[#f8fffe] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#e0f5f2] flex items-center justify-center mb-6">
        <CheckCircle2 className="w-9 h-9 text-[#2a9d8f]" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#0d1f1c] tracking-tight">
        Application Submitted!
      </h1>
      <p className="mt-3 text-sm text-[#6b8280] max-w-md">
        Thank you, <strong>{name || "there"}</strong>! We&apos;ve received your registration for{" "}
        <strong>{pharmacy || "your pharmacy"}</strong>. Our team will review it and reach out
        within 1–2 business days.
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
