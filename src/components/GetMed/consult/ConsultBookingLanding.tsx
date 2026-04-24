"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  HeartPulse,
  Languages,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
  Stethoscope,
  Truck,
  User,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookConsultationAction } from "@/app/(getmed)/consult/actions";

/* ─── types ─────────────────────────────────────────────────── */
interface Pharmacy {
  id: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  opening_hours: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  payment_methods: string[] | null;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
}

interface Pharmacist {
  full_name: string;
  photo_url: string | null;
  qualification: string | null;
  years_of_experience: number | null;
  specialization: string[] | null;
  languages: string[] | null;
  bio: string | null;
  consultation_modes: string[] | null;
  consultation_fee: number | null;
}

interface Props {
  pharmacy: Pharmacy;
  pharmacist: Pharmacist | null;
}

/* ─── helpers ───────────────────────────────────────────────── */
const MODE_ICONS: Record<string, React.ReactNode> = {
  chat:  <MessageSquare className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
};

function isOpenNow(hours: Record<string, { open: boolean; openTime: string; closeTime: string }>) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const h = hours?.[days[new Date().getDay()]];
  if (!h?.open) return false;
  const [oH, oM] = h.openTime.split(":").map(Number);
  const [cH, cM] = h.closeTime.split(":").map(Number);
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= oH * 60 + oM && cur < cH * 60 + cM;
}

function todayHours(hours: Record<string, { open: boolean; openTime: string; closeTime: string }>) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const h = hours?.[days[new Date().getDay()]];
  if (!h?.open) return "Closed today";
  return `${h.openTime} – ${h.closeTime}`;
}

/* ─── Pharmacist sidebar card ───────────────────────────────── */
function PharmacistInfoCard({ pharmacist }: { pharmacist: Pharmacist }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 space-y-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280]">Your Pharmacist</p>

      <div className="flex items-center gap-4">
        <div className="shrink-0 w-16 h-16 rounded-full bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
          {pharmacist.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pharmacist.photo_url} alt={pharmacist.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-[#2a9d8f]" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[#0d1f1c] leading-tight">{pharmacist.full_name}</p>
          {pharmacist.qualification && (
            <p className="text-xs text-[#2a9d8f] font-semibold mt-0.5">{pharmacist.qualification}</p>
          )}
          {pharmacist.years_of_experience != null && (
            <p className="text-xs text-[#6b8280] mt-0.5 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#2a9d8f]" />
              {pharmacist.years_of_experience} yrs experience
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#f0fbf9] rounded-xl p-3 flex items-center justify-between">
        <p className="text-xs text-[#6b8280]">Consultation Fee</p>
        {pharmacist.consultation_fee && pharmacist.consultation_fee > 0 ? (
          <p className="text-base font-extrabold text-[#2a9d8f]">${pharmacist.consultation_fee.toFixed(2)}</p>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
            Free
          </span>
        )}
      </div>

      {pharmacist.consultation_modes && pharmacist.consultation_modes.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Available Via</p>
          <div className="flex flex-wrap gap-1.5">
            {pharmacist.consultation_modes.map((mode) => (
              <span
                key={mode}
                className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#e2efed] rounded-full text-xs font-medium text-[#406460] capitalize"
              >
                {MODE_ICONS[mode] ?? null}
                {mode}
              </span>
            ))}
          </div>
        </div>
      )}

      {pharmacist.specialization && pharmacist.specialization.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Specialization</p>
          <div className="flex flex-wrap gap-1">
            {pharmacist.specialization.map((s) => (
              <span key={s} className="text-xs bg-[#f0fbf9] text-[#2a9d8f] border border-[#d0ece9] px-2 py-0.5 rounded-full font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {pharmacist.languages && pharmacist.languages.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[#6b8280]">
          <Languages className="w-4 h-4 text-[#2a9d8f] shrink-0" />
          <span>{pharmacist.languages.join(", ")}</span>
        </div>
      )}

      {pharmacist.bio && (
        <p className="text-xs text-[#6b8280] leading-relaxed border-t border-[#f0f8f6] pt-3">
          {pharmacist.bio}
        </p>
      )}
    </div>
  );
}

/* ─── Pharmacy sidebar card ─────────────────────────────────── */
function PharmacyInfoCard({ pharmacy, open }: { pharmacy: Pharmacy; open: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#e0f5f2] border border-[#e2efed] flex items-center justify-center overflow-hidden">
          {pharmacy.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pharmacy.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-extrabold text-[#2a9d8f]">
              {pharmacy.display_name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-extrabold text-[#0d1f1c] leading-tight">{pharmacy.display_name}</h2>
          <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            open ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"
          }`}>
            {open ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[#6b8280]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#2a9d8f]" />
          <span>{pharmacy.full_address}, {pharmacy.city}, {pharmacy.province}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 shrink-0 text-[#2a9d8f]" />
          <a href={`tel:${pharmacy.phone}`} className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">
            {pharmacy.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-[#2a9d8f]" />
          <span>Today: {todayHours(pharmacy.opening_hours ?? {})}</span>
        </div>
      </div>

      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Services</p>
        <div className="flex flex-wrap gap-1.5">
          {pharmacy.service_online_orders && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              <ShoppingBag className="w-3 h-3" /> Online Orders
            </span>
          )}
          {pharmacy.service_delivery && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              <Truck className="w-3 h-3" /> Delivery
            </span>
          )}
          {pharmacy.service_consultation && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
              <Stethoscope className="w-3 h-3" /> Consultation
            </span>
          )}
        </div>
      </div>

      {pharmacy.payment_methods && pharmacy.payment_methods.length > 0 && (
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-2">Payment</p>
          <div className="flex flex-wrap gap-1.5">
            {pharmacy.payment_methods.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f0fbf9] text-[#2a9d8f] border border-[#d0ece9] px-2 py-0.5 rounded-full">
                <CreditCard className="w-3 h-3" />
                {m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible (mobile) ───────────────────────────────────── */
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-[#0d1f1c] hover:bg-[#f8fffe] transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-[#6b8280]" /> : <ChevronDown className="w-4 h-4 text-[#6b8280]" />}
      </button>
      {open && <div className="border-t border-[#e2efed] p-4">{children}</div>}
    </div>
  );
}

/* ─── Booking form ───────────────────────────────────────────── */
function BookingForm({ pharmacyId, pharmacyName, pharmacistName }: {
  pharmacyId: string;
  pharmacyName: string;
  pharmacistName: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("pharmacyId", pharmacyId);
    startTransition(async () => {
      const result = await bookConsultationAction(fd);
      if (result.error) setServerError(result.error);
      else setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm p-8 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[#e0f5f2] flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#2a9d8f]" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#0d1f1c] mb-2">Booking Confirmed!</h2>
          <p className="text-[#6b8280] text-sm leading-relaxed max-w-sm mx-auto">
            Your consultation request has been sent to{" "}
            <span className="font-semibold text-[#0d1f1c]">{pharmacyName}</span>.
          </p>
        </div>

        <div className="w-full max-w-sm bg-[#f0fbf9] rounded-2xl border border-[#d0ede9] p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <p className="text-sm text-[#0d1f1c] leading-relaxed">
              Your pharmacist will reach out to you shortly{pharmacistName ? ` — ${pharmacistName} will contact you` : ""}.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <p className="text-sm text-[#0d1f1c] leading-relaxed">
              If they don&rsquo;t reach you within{" "}
              <span className="font-semibold">30–60 minutes</span>, please reach out to our{" "}
              <Link href="/support" className="text-[#2a9d8f] font-semibold hover:underline no-underline">
                support team
              </Link>{" "}
              for assistance.
            </p>
          </div>
        </div>

        <Button asChild size="lg" className="w-full max-w-sm mt-2">
          <Link href="/" className="no-underline">
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[#e2efed]">
        <h2 className="text-lg font-extrabold text-[#0d1f1c]">Book a Consultation</h2>
        <p className="text-sm text-[#6b8280] mt-1">
          Fill in your details and we&rsquo;ll connect you with{" "}
          {pharmacistName ? (
            <span className="font-semibold text-[#0d1f1c]">{pharmacistName}</span>
          ) : (
            "a pharmacist"
          )}{" "}
          at <span className="font-semibold text-[#0d1f1c]">{pharmacyName}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Patient info */}
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
            Your Information
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#406460] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input name="name" required placeholder="Your full name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#406460] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input name="phone" type="tel" required placeholder="e.g. 416-555-0100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#406460] mb-1.5">
                  Email <span className="text-[#9bb3b0] font-normal">(optional)</span>
                </label>
                <Input name="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Consultation details */}
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6b8280] mb-3">
            Consultation Details
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#406460] mb-1.5">
                What would you like to discuss? <span className="text-red-500">*</span>
              </label>
              <Input
                name="condition"
                required
                placeholder="e.g. UTI, rash, allergy, medication review…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#406460] mb-1.5">
                Additional notes <span className="text-[#9bb3b0] font-normal">(optional)</span>
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Describe your symptoms, how long you've had them, any current medications…"
                className="w-full rounded-xl border border-[#d8e9e6] px-4 py-2.5 text-sm text-[#0d1f1c] placeholder:text-[#9bb3b0] focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:ring-offset-2 resize-none"
              />
            </div>
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
        )}

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? "Booking…" : "Confirm Booking"}
        </Button>

        <p className="text-xs text-[#6b8280] text-center">
          Your pharmacist will contact you shortly after booking.
        </p>
      </form>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export default function ConsultBookingLanding({ pharmacy, pharmacist }: Props) {
  const router = useRouter();
  const open = isOpenNow(pharmacy.opening_hours ?? {});

  return (
    <div className="min-h-screen bg-[#f8fffe]">
      {/* Sticky header */}
      <header className="bg-white border-b border-[#e2efed] px-4 h-14 flex items-center gap-3 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-[#0d1f1c]">
            Get<span className="text-[#2a9d8f]">Med</span>
          </span>
        </Link>
        <span className="text-[#d0e8e5]">/</span>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#6b8280] hover:text-[#2a9d8f] transition-colors font-medium bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-[#d0e8e5]">/</span>
        <span className="text-sm text-[#6b8280] truncate font-medium">{pharmacy.display_name}</span>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Mobile: collapsible info */}
        <div className="lg:hidden space-y-3 mb-6">
          {pharmacist && (
            <CollapsibleSection title={`👨‍⚕️ ${pharmacist.full_name} — Your Pharmacist`}>
              <PharmacistInfoCard pharmacist={pharmacist} />
            </CollapsibleSection>
          )}
          <CollapsibleSection title={`📍 ${pharmacy.display_name}`}>
            <PharmacyInfoCard pharmacy={pharmacy} open={open} />
          </CollapsibleSection>
        </div>

        {/* Main layout */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
          {/* Left: form */}
          <div>
            <div className="mb-5">
              <h1 className="text-xl font-extrabold text-[#0d1f1c]">Book a Consultation</h1>
              <p className="text-sm text-[#6b8280] mt-1">
                Get expert advice from a licensed pharmacist near you.
              </p>
            </div>
            <BookingForm
              pharmacyId={pharmacy.id}
              pharmacyName={pharmacy.display_name}
              pharmacistName={pharmacist?.full_name ?? null}
            />
          </div>

          {/* Right: sidebar (desktop only) */}
          <div className="hidden lg:flex flex-col gap-5 sticky top-20">
            {pharmacist && <PharmacistInfoCard pharmacist={pharmacist} />}
            <PharmacyInfoCard pharmacy={pharmacy} open={open} />
          </div>
        </div>
      </div>
    </div>
  );
}
