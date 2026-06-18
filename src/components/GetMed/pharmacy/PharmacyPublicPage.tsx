"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Stethoscope,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCard {
  value: string;
  label: string;
}

interface PriceItem {
  name: string;
  price: string;
  description?: string;
}

interface Pharmacy {
  id: string;
  display_name: string;
  logo_url: string | null;
  full_address: string;
  city: string;
  province: string;
  phone: string;
  service_online_orders: boolean;
  service_delivery: boolean;
  service_consultation: boolean;
  // Landing page fields
  hero_image_url:    string | null;
  hero_title:        string | null;
  hero_subtitle:     string | null;
  about_heading:     string | null;
  about_description: string | null;
  landing_stats:     StatCard[] | null;
  price_list:        PriceItem[] | null;
}

interface Props {
  pharmacy: Pharmacy;
  slug: string;
  consultationFee: number | null;
}

// Fallback content used when the pharmacy hasn't customised a field
const FALLBACK_HERO_IMAGE  = "/images/pharmacy.png";
const FALLBACK_SUBTITLE    = "Personalized care for you and your family, right in your neighbourhood.";
const FALLBACK_DESCRIPTION = "We are a trusted community pharmacy committed to providing personalized, compassionate care to every patient who walks through our doors. Our team is dedicated to your health and wellbeing — from filling prescriptions quickly and accurately, to offering expert consultations and advice.";

const FALLBACK_STATS: [StatCard, StatCard, StatCard] = [
  { value: "15+",     label: "Years serving the community" },
  { value: "15,000+", label: "Patients served" },
  { value: "#1",      label: "Rated pharmacy in the city" },
];

// Icons mapped to stat position (1→Clock, 2→Users, 3→Award)
const STAT_ICONS = [Clock, Users, Award];

// Prefix "$" only when the price reads as a plain number (e.g. "25" → "$25").
// Leaves free-form values like "Free" or "From $20" untouched.
function formatPrice(price: string): string {
  const trimmed = price.trim();
  return /^\d+(\.\d{1,2})?$/.test(trimmed) ? `$${trimmed}` : trimmed;
}

export default function PharmacyPublicPage({ pharmacy, slug, consultationFee }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    pharmacy.service_online_orders && { label: "Online Orders",           icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50"   },
    pharmacy.service_delivery      && { label: "Home Delivery",           icon: Truck,       color: "text-purple-600", bg: "bg-purple-50" },
    pharmacy.service_consultation  && { label: "Pharmacist Consultation", icon: Stethoscope, color: "text-teal-600",   bg: "bg-teal-50"   },
  ].filter(Boolean) as Array<{ label: string; icon: React.ElementType; color: string; bg: string }>;

  // Resolve dynamic content with fallbacks
  const heroImage    = pharmacy.hero_image_url || FALLBACK_HERO_IMAGE;
  const heroTitle    = pharmacy.hero_title      || pharmacy.display_name;
  const heroSubtitle = pharmacy.hero_subtitle   || FALLBACK_SUBTITLE;
  const aboutHeading = pharmacy.about_heading   || `Caring for ${pharmacy.city} since day one`;
  const aboutDesc    = pharmacy.about_description || FALLBACK_DESCRIPTION;

  const rawStats     = pharmacy.landing_stats;
  const hasStats     = rawStats && rawStats.length > 0;
  const stats: [StatCard, StatCard, StatCard] = hasStats
    ? [rawStats[0] ?? FALLBACK_STATS[0], rawStats[1] ?? FALLBACK_STATS[1], rawStats[2] ?? FALLBACK_STATS[2]]
    : FALLBACK_STATS;

  const priceItems = (pharmacy.price_list ?? []).filter((p) => p?.name && p?.price);

  return (
    <div className="min-h-screen bg-[#f8fffe]">

      {/* ── 1. Global GetMed Navbar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#f8fffe]/90 backdrop-blur-[16px] border-b border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-[1.2rem] font-extrabold tracking-tight text-[#0d1f1c]">
              Get<span className="text-[#2a9d8f]">Med</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* ── 2. Pharmacy Sub-Header ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#e2efed] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Pharmacy logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 h-9 w-[108px] rounded-xl flex items-center justify-center overflow-hidden ${pharmacy.logo_url ? "" : "bg-[#e0f5f2] border border-[#e2efed]"}`}>
              {pharmacy.logo_url ? (
                <img src={pharmacy.logo_url} alt={pharmacy.display_name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm font-extrabold text-[#2a9d8f]">
                  {pharmacy.display_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm font-extrabold text-[#0d1f1c] truncate">{pharmacy.display_name}</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            <Link
              href={`/order/${slug}#prescription`}
              className="text-sm font-semibold text-[#2a9d8f] hover:text-[#21867a] transition-colors no-underline"
            >
              Order Now
            </Link>
            {priceItems.length > 0 && (
              <a
                href="#pricing"
                className="text-sm font-semibold text-[#2a9d8f] hover:text-[#21867a] transition-colors no-underline"
              >
                Pricing
              </a>
            )}
            <a
              href={`tel:${pharmacy.phone}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#0d1f1c] hover:text-[#2a9d8f] transition-colors no-underline"
            >
              <Phone className="w-4 h-4" />
              Contact
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-[#0d1f1c] hover:bg-[#f0fbf9] transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e2efed] bg-white px-6 py-4 flex flex-col gap-4">
            <Link
              href={`/order/${slug}#prescription`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#2a9d8f] no-underline"
            >
              Order Now
            </Link>
            {priceItems.length > 0 && (
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#2a9d8f] no-underline"
              >
                Pricing
              </a>
            )}
            <a
              href={`tel:${pharmacy.phone}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#0d1f1c] no-underline"
            >
              <Phone className="w-4 h-4" />
              Contact
            </a>
          </div>
        )}
      </div>

      {/* ── 3. Hero Section — two-column layout ─────────────────────── */}
      <section className="bg-gradient-to-b from-[#f0fbf9] to-[#f8fffe] border-b border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left column — copy + CTAs */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f5f2] text-[#2a9d8f] text-xs font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#2a9d8f] pulse-dot" />
                Your trusted neighbourhood pharmacy
              </div>

              <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.12] tracking-tight text-[#0d1f1c]">
                {heroTitle}
              </h1>

              <p className="mt-4 text-[1.05rem] text-[#6b8280] max-w-[520px] leading-[1.7]">
                {heroSubtitle}
              </p>

              {/* Two primary CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href={`/order/${slug}#prescription`}>
                    <FileText className="w-4 h-4" />
                    Order Prescription
                  </Link>
                </Button>
                {pharmacy.service_consultation && (
                  <Button
                    asChild
                    size="lg"
                    variant="white"
                    className="flex items-center gap-2 border border-[#e2efed]"
                  >
                    <Link href={`/consult/${slug}`}>
                      <Stethoscope className="w-4 h-4" />
                      Book Consultation
                    </Link>
                  </Button>
                )}
              </div>

              {/* Quick info row */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#6b8280] leading-snug">
                    {pharmacy.full_address}
                    <br />
                    {pharmacy.city}, {pharmacy.province}
                  </p>
                </div>
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="flex items-center gap-2.5 text-sm text-[#6b8280] hover:text-[#2a9d8f] transition-colors no-underline"
                >
                  <Phone className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                  {pharmacy.phone}
                </a>
              </div>
            </div>

            {/* Right column — hero image with fallback */}
            <div className="relative">
              <div className="absolute inset-[-12px] bg-[#e0f5f2] rounded-[28px] rotate-3" />
              <img
                src={heroImage}
                alt={pharmacy.display_name}
                className="relative rounded-2xl w-full h-[300px] md:h-[400px] object-cover shadow-[0_32px_80px_rgba(42,157,143,0.15)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Pharmacy Overview Section ────────────────────────────── */}
      <section className="bg-white border-b border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left: About + Services */}
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">About Us</p>
                <h2 className="text-2xl font-extrabold text-[#0d1f1c] mb-3">{aboutHeading}</h2>
                <p className="text-[#6b8280] leading-relaxed">{aboutDesc}</p>
              </div>

              {services.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6b8280] mb-3">Our Services</p>
                  <div className="flex flex-wrap gap-2.5">
                    {services.map(({ label, icon: Icon, color, bg }) => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${bg} ${color} px-3.5 py-2 rounded-xl`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Trust stats */}
            <div className="grid grid-cols-1 gap-5">
              {stats.map(({ value, label }, i) => {
                const Icon = STAT_ICONS[i];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-5 bg-[#f8fffe] rounded-2xl border border-[#e2efed] p-6"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#2a9d8f]" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-[#0d1f1c]">{value}</p>
                      <p className="text-sm text-[#6b8280] mt-0.5">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Service Price List Widget ────────────────────────────── */}
      {priceItems.length > 0 && (
        <section id="pricing" className="py-16 scroll-mt-32">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2a9d8f] mb-3">Pricing</p>
              <h2 className="text-3xl font-extrabold text-[#0d1f1c]">Our Services &amp; Prices</h2>
              <p className="mt-3 text-[#6b8280]">Transparent pricing for the services we offer.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2efed] shadow-sm overflow-hidden divide-y divide-[#e2efed]">
              {priceItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-[#f8fffe] transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e0f5f2] flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-[#2a9d8f]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#0d1f1c]">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-[#6b8280] mt-0.5 leading-snug">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-[#2a9d8f] whitespace-nowrap shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Closing CTA under the price list */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="flex items-center gap-2">
                <Link href={`/order/${slug}#prescription`}>
                  <FileText className="w-4 h-4" />
                  Order Prescription
                </Link>
              </Button>
              {pharmacy.service_consultation && (
                <Button asChild size="lg" variant="white" className="flex items-center gap-2 border border-[#e2efed]">
                  <Link href={`/consult/${slug}`}>
                    <Stethoscope className="w-4 h-4" />
                    Book Consultation
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Trust strip ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#e2efed]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            {[
              { title: "Licensed & verified", desc: "An approved pharmacy on the GetMed network." },
              { title: "Fast & convenient", desc: "Order online for pickup or home delivery." },
              { title: "Caring local team", desc: "Real pharmacists who know your community." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3 justify-center sm:justify-start">
                <CheckCircle2 className="w-5 h-5 text-[#2a9d8f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#0d1f1c]">{title}</p>
                  <p className="text-sm text-[#6b8280] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e2efed] bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6b8280]">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-[8px] bg-[#2a9d8f] flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-[#0d1f1c]">Get<span className="text-[#2a9d8f]">Med</span></span>
          </Link>
          <p>© {new Date().getFullYear()} GetMed. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Terms</Link>
            <Link href="/support" className="hover:text-[#2a9d8f] transition-colors no-underline text-[#6b8280]">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
